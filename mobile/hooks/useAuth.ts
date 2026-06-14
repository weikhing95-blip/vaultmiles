import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { thisMonth } from "../lib/calculator";

export interface User {
  name: string;
  email: string;
  kfNum: string;
  joinedAt: string;
}

async function fetchProfile(authUser: { id: string; email?: string }): Promise<User> {
  const { data } = await supabase
    .from("profiles")
    .select("name, kf_num, created_at")
    .eq("id", authUser.id)
    .single();

  return {
    name: data?.name ?? "",
    email: authUser.email ?? "",
    kfNum: data?.kf_num ?? "",
    joinedAt: (data?.created_at as string | undefined)?.slice(0, 7) ?? thisMonth(),
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) setUser(await fetchProfile(session.user));
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        setUser(await fetchProfile(session.user));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signUp(
    email: string,
    password: string,
    name: string,
    kfNum: string,
  ): Promise<"ok" | "confirm_email"> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (!data.user) throw new Error("Sign up failed — please try again.");

    if (!data.session) {
      // Email confirmation required — profile will be written after confirmation
      return "confirm_email";
    }

    // Try to write profile; if it fails due to RLS timing, onAuthStateChange will retry
    await supabase.from("profiles").upsert({
      id: data.user.id,
      name: name.trim(),
      kf_num: kfNum.trim(),
    });

    return "ok";
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return { user, loading, signUp, signIn, logout };
}
