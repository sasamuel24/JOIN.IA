"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const handleResend = async () => {
        if (!email || cooldown > 0) return;
        setResendStatus("loading");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/resend-verification`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                setResendStatus("sent");
                setCooldown(60);
            } else {
                setResendStatus("error");
            }
        } catch {
            setResendStatus("error");
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#F9FAFB",
            fontFamily: "var(--font-main, 'Jura', sans-serif)",
        }}>
            <div style={{
                background: "#fff",
                borderRadius: "16px",
                border: "1px solid #E5E7EB",
                padding: "48px 40px",
                maxWidth: "440px",
                width: "100%",
                textAlign: "center",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}>
                {/* Icono */}
                <div style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "rgba(0,212,170,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px",
                }}>
                    <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111111", margin: "0 0 8px" }}>
                    Verifica tu correo
                </h1>

                <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: "1.6", margin: "0 0 8px" }}>
                    Te enviamos un enlace de verificación a:
                </p>
                {email && (
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#111111", margin: "0 0 24px" }}>
                        {email}
                    </p>
                )}

                <p style={{ fontSize: "13px", color: "#9CA3AF", margin: "0 0 32px", lineHeight: "1.5" }}>
                    Revisa tu bandeja de entrada y haz click en el enlace para activar tu cuenta.
                    Si no lo ves, revisa la carpeta de spam.
                </p>

                {/* Botón reenviar */}
                <button
                    onClick={handleResend}
                    disabled={resendStatus === "loading" || cooldown > 0}
                    style={{
                        width: "100%",
                        height: "42px",
                        borderRadius: "8px",
                        border: "1.5px solid #00D4AA",
                        background: "transparent",
                        color: cooldown > 0 ? "#9CA3AF" : "#00D4AA",
                        fontWeight: 600,
                        fontSize: "14px",
                        cursor: cooldown > 0 || resendStatus === "loading" ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                        marginBottom: "12px",
                    }}
                >
                    {resendStatus === "loading"
                        ? "Enviando..."
                        : cooldown > 0
                        ? `Reenviar en ${cooldown}s`
                        : "Reenviar correo"}
                </button>

                {resendStatus === "sent" && (
                    <p style={{ fontSize: "13px", color: "#00D4AA", margin: "0 0 12px" }}>
                        ✓ Correo reenviado correctamente
                    </p>
                )}
                {resendStatus === "error" && (
                    <p style={{ fontSize: "13px", color: "#EF4444", margin: "0 0 12px" }}>
                        No se pudo reenviar. Intenta de nuevo.
                    </p>
                )}

                <a
                    href="/login"
                    style={{ fontSize: "13px", color: "#9CA3AF", textDecoration: "none" }}
                >
                    ← Volver al inicio de sesión
                </a>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense>
            <VerifyEmailContent />
        </Suspense>
    );
}
