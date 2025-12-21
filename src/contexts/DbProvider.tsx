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
	query,
	setDoc,
	Timestamp,
	where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { DbContext } from "./DbContext";

interface DbProviderProps {
	children: React.ReactNode;
}

export interface DbContextValue {
	user: FirebaseUser | null;
	name: string | null;
	login: () => void;
	logout: () => void;
	updateName: (name: string) => void;
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
				} catch (error) {
					console.error("Error fetching/creating user document:", error);
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
			try {
				await signInWithPopup(auth, provider);
			} catch (error) {
				console.error("Error signing in:", error);
			}
		},
		logout: async () => {
			try {
				await firebaseSignOut(auth);
			} catch (error) {
				console.error("Error signing out:", error);
			}
		},
		updateName: async (newName: string) => {
			if (!user) return;

			try {
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
			} catch (error) {
				console.error("Error updating username:", error);
			}
		},
	};

	return <DbContext.Provider value={value}>{children}</DbContext.Provider>;
};
