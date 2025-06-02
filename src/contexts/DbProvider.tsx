import { useEffect, useState } from "react";
import { DbContext } from "./useDb";
import {
  createClient,
  Session,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";

interface DbProviderProps {
  children: React.ReactNode;
}
export interface DbContextValue {
  user: User | null;
  session: Session | null;
  supabase: SupabaseClient;
  login: () => void;
  logout: () => void;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const DbProvider = ({ children }: DbProviderProps) => {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      },
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  });

  const value: DbContextValue = {
    user,
    session,
    supabase,
    login: () => {
      supabase.auth
        .signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin,
          },
        })
        .catch((error) => console.error("Error signing in:", error.message));
    },
    logout: () => {
      supabase.auth
        .signOut()
        .catch((error) => console.error("Error signing out:", error.message));
    },
  };

  return <DbContext.Provider value={value}>{children}</DbContext.Provider>;
};
