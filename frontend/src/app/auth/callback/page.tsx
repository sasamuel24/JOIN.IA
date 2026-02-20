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
    router.replace("/dashboard");
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
