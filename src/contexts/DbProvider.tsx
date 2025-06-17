import { useEffect, useState } from "react";
import { DbContext } from "./DbContext";
import {
  createClient,
  Session,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";
import { Capacitor, PluginListenerHandle } from "@capacitor/core";
import { App } from "@capacitor/app";

interface DbProviderProps {
  children: React.ReactNode;
}
export interface DbContextValue {
  user: User | null;
  name: string | null;
  session: Session | null;
  supabase: SupabaseClient;
  login: () => void;
  logout: () => void;
  updateName: (name: string) => void;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const options = Capacitor.isNativePlatform()
  ? {
      redirectTo: "infinisweeper://auth/callback",
      queryParams: {
        response_type: "token",
      },
    }
  : {
      redirectTo: window.location.origin,
    };

export const DbProvider = ({ children }: DbProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user?.id)
          supabase
            .from("names")
            .select("name")
            .eq("uid", session.user.id)
            .single()
            .then(({ data, error }) => {
              if (error)
                console.error("Error fetching user profile:", error.message);
              else setName(data?.name ?? null);
            });
      }
    );

    let listenerHandle: PluginListenerHandle;
    const setupListener = async () => {
      listenerHandle = await App.addListener("appUrlOpen", async ({ url }) => {
        if (!url.includes("#access_token=")) return;

        const fragment = url.split("#")[1];
        const params = new URLSearchParams(fragment);

        const access_token = params.get("access_token") ?? "";
        const refresh_token = params.get("refresh_token") ?? "";

        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
        }
      });
    };
    setupListener();

    return () => {
      listener.subscription.unsubscribe();
      listenerHandle?.remove();
    };
  }, []);

  const value: DbContextValue = {
    user,
    session,
    supabase,
    name,
    login: () => {
      supabase.auth
        .signInWithOAuth({
          provider: "google",
          options,
        })
        .then((data) => {
          console.log("Sign in successful:", data);
        })
        .catch((error) => console.error("Error signing in:", error.message));
    },
    logout: () => {
      supabase.auth
        .signOut()
        .catch((error) => console.error("Error signing out:", error.message));
    },
    updateName: async (name: string) => {
      if (!user || !session) return;
      const { error } = await supabase
        .from("names")
        .upsert({ uid: session.user.id, name }, { onConflict: "uid" });
      if (error) throw error;
      setName(name);
    },
  };

  return <DbContext.Provider value={value}>{children}</DbContext.Provider>;
};
