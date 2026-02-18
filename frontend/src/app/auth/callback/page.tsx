"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
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
