"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    localStorage.setItem("access_token", token);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        router.replace(user?.role === "admin" ? "/admin" : "/dashboard");
      })
      .catch(() => router.replace("/dashboard"));
  }, [params, router]);

  return (
    <div style={{ padding: 24 }}>
      Iniciando sesión...
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando...</div>}>
      <AuthCallbackInner />
    </Suspense>
  );
}
