"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type MeResponse = {
  id: string;
  email: string;
  full_name: string | null;
  provider: string;
};

export default function AuthStatus() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          // token inválido o expiró
          localStorage.removeItem("access_token");
          setMe(null);
          setLoading(false);
          return;
        }

        const data = (await res.json()) as MeResponse;
        setMe(data);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    })();
  }, []);

    const logout = () => {
    localStorage.removeItem("access_token");
    setMe(null);
    window.location.href = "/login";
    };

  if (loading) {
    return (
      <div style={{ padding: 12, fontSize: 14 }}>
        Verificando sesión...
      </div>
    );
  }

  if (!me) {
    return (
      null
    );
  }

  return (
    null
  );
}
