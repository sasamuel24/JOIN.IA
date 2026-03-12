"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { AuthUser, CurrentUser } from "@/types/dashboard";

type AuthContextType = {
  user: CurrentUser | null;
  loading: boolean;
  error: string | null;
  logout: () => void;
  refresh: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Mapea lo que devuelve la API al tipo CurrentUser que usa toda la app
function mapAuthUser(data: AuthUser): CurrentUser {
  return {
    id: data.id,
    email: data.email,
    name: data.full_name ?? "Usuario",
    avatar_url: undefined,
    role: undefined,
    group: undefined,
    access_tier: undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => (res.ok ? res.json() : Promise.reject("unauthorized")))
      .then((data: AuthUser) => setUser(mapAuthUser(data)))
      .catch(err => setError(String(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, logout, refresh: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}