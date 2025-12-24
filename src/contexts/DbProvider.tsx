import type { User as FirebaseUser } from "firebase/auth";
import {
	signOut as firebaseSignOut,
	GoogleAuthProvider,
	onAuthStateChanged,
	signInWithPopup,
} from "firebase/auth";
import {
	collection,
	doc,
	documentId,
	getDoc,
	getDocs,
	limit,
	orderBy,
	query,
	setDoc,
	Timestamp,
	where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { auth, db } from "../lib/firebase";
import { DbContext } from "./DbContext";

interface DbProviderProps {
	children: React.ReactNode;
}

export interface ScoreEntry {
	name: string;
	score: number;
	game_type: string;
}

export interface DbContextValue {
	user: FirebaseUser | null;
	name: string | null;
	login: () => void;
	logout: () => void;
	updateName: (name: string) => void;
	getScoreboard: () => Promise<Record<string, ScoreEntry[]>>;
	submitScore: (score: number, mode: string) => Promise<void>;
	fetchHighScore: (mode: string) => Promise<number | null>;
}

export const DbProvider = ({ children }: DbProviderProps) => {
	const [user, setUser] = useState<FirebaseUser | null>(null);
	const [name, setName] = useState<string | null>(null);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			setUser(firebaseUser);

			if (firebaseUser) {
				const userDocRef = doc(db, "users", firebaseUser.uid);
				try {
					const userDoc = await getDoc(userDocRef);

					if (userDoc.exists()) {
						setName(userDoc.data()?.username ?? null);
					} else {
						const newUsername = firebaseUser.displayName || "Anonymous";
						await setDoc(userDocRef, {
							createdAt: Timestamp.now(),
							username: newUsername,
						});
						setName(newUsername);
					}
				} catch {
					toast.error("Failed to fetch user data!");
				}
			} else {
				setName(null);
			}
		});

		return () => unsubscribe();
	}, []);

	const value: DbContextValue = {
		user,
		name,
		login: async () => {
			const provider = new GoogleAuthProvider();
			await signInWithPopup(auth, provider);
		},
		logout: async () => {
			await firebaseSignOut(auth);
		},
		updateName: async (newName: string) => {
			if (!user) return;

			const userDocRef = doc(db, "users", user.uid);
			await setDoc(userDocRef, { username: newName }, { merge: true });

			// Update username in all score documents (format: UID_modename)
			const scoresRef = collection(db, "scores");
			const q = query(
				scoresRef,
				where(documentId(), ">=", `${user.uid}_`),
				where(documentId(), "<=", `${user.uid}_\uf8ff`),
			);

			const querySnapshot = await getDocs(q);
			await Promise.all(
				querySnapshot.docs.map((docSnap) =>
					setDoc(docSnap.ref, { username: newName }, { merge: true }),
				),
			);

			setName(newName);
		},
		getScoreboard: async () => {
			const modes = [
				{ id: "classic", label: "Classic" },
				// { id: "timeAttack", label: "Time Attack" }, // Future mode
			];

			const scoresByMode: Record<string, ScoreEntry[]> = {};

			await Promise.all(
				modes.map(async ({ id, label }) => {
					const q = query(
						collection(db, "scores"),
						where("mode", "==", id),
						orderBy("score", "desc"),
						limit(10),
					);
					const querySnapshot = await getDocs(q);

					scoresByMode[label] = querySnapshot.docs.map((doc) => ({
						name: doc.data().username,
						score: doc.data().score,
						game_type: label,
					}));
				}),
			);

			return scoresByMode;
		},
		submitScore: async (score: number, mode: string) => {
			if (!user || !name) return;

			const scoreDocId = `${user.uid}_${mode}`;
			const scoreDocRef = doc(db, "scores", scoreDocId);

			await setDoc(scoreDocRef, {
				score,
				username: name,
				mode,
				updatedAt: Timestamp.now(),
			});
		},
		fetchHighScore: async (mode: string) => {
			if (!user) return null;

			const scoreDocId = `${user.uid}_${mode}`;
			const scoreDocRef = doc(db, "scores", scoreDocId);
			const scoreDoc = await getDoc(scoreDocRef);

			if (scoreDoc.exists()) {
				return scoreDoc.data().score;
			}

			return null;
		},
	};

	return <DbContext.Provider value={value}>{children}</DbContext.Provider>;
};
