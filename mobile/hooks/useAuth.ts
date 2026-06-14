import { useState, useEffect } from "react";
import { User, getUser, saveUser, clearUser } from "../lib/storage";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser().then((u) => { setUser(u); setLoading(false); });
  }, []);

  async function login(profile: User) {
    await saveUser(profile);
    setUser(profile);
  }

  async function logout() {
    await clearUser();
    setUser(null);
  }

  return { user, loading, login, logout };
}
