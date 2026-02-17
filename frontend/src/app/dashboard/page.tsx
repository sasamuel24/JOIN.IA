"use client";

import React from "react";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <main className="mx-auto max-w-6xl px-6 pt-32 pb-10">
        {/* Aquí irá el contenido real del dashboard */}
      </main>
    </AuthGuard>
  );
}
