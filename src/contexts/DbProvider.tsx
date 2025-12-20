import { App } from "@capacitor/app";
import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import type { User as FirebaseUser } from "firebase/auth";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  getRedirectResult,
  onAuthStateChanged,
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
    let mounted = true;

    // Handle redirect result from OAuth
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log("✅ Redirect successful:", result.user.email);
        } else {
          console.log("ℹ️ No redirect result (normal on page load)");
        }
      })
      .catch((error) => {
        console.error("❌ Error getting redirect result:", error);
      });

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("🔄 Auth state changed:", firebaseUser ? firebaseUser.email : "null");
      if (!mounted) return;

      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch username from Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setName(userDoc.data()?.username ?? null);
          } else {
            // Create user document if it doesn't exist
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

    // Handle deep links for mobile (Capacitor)
    let listenerHandle: PluginListenerHandle;
    if (Capacitor.isNativePlatform()) {
      const setupListener = async () => {
        listenerHandle = await App.addListener(
          "appUrlOpen",
          async () => {},
        );
      };
      setupListener();
    }

    return () => {
      mounted = false;
      unsubscribe();
      listenerHandle?.remove();
    };
  }, []);

  const value: DbContextValue = {
    user,
    name,
    login: () => {
      const provider = new GoogleAuthProvider();
      console.log("🚀 Starting sign in popup...");
      signInWithPopup(auth, provider).catch((error) =>
        console.error("Error signing in:", error.message),
      );
    },
    logout: () => {
      firebaseSignOut(auth).catch((error) =>
        console.error("Error signing out:", error.message),
      );
    },
    updateName: async (name: string) => {
      if (!user) return;

      // Update user document
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          username: name,
        },
        { merge: true },
      );

      // Update all score documents for this user
      // Document IDs are in format: {uid}_{modename}
      // Query for all documents where ID starts with user's UID
      const scoresRef = collection(db, "scores");
      const q = query(
        scoresRef,
        where(documentId(), ">=", `${user.uid}_`),
        where(documentId(), "<=", `${user.uid}_\uf8ff`),
      );

      const querySnapshot = await getDocs(q);
      const updatePromises = querySnapshot.docs.map((docSnap) => {
        return setDoc(docSnap.ref, { username: name }, { merge: true });
      });

      await Promise.all(updatePromises);

      setName(name);
    },
  };

  return <DbContext.Provider value={value}>{children}</DbContext.Provider>;
};
