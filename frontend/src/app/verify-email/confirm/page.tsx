"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function VerifyEmailConfirmContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setErrorMsg("Token no encontrado en la URL.");
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`
                );
                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    setErrorMsg(data?.detail || "El enlace es inválido o ha expirado.");
                    setStatus("error");
                    return;
                }

                localStorage.setItem("access_token", data.access_token);
                setStatus("success");

                setTimeout(() => {
                    const destination = data.user?.role === "admin" ? "/admin" : "/dashboard";
                    window.location.href = destination;
                }, 2000);
            } catch {
                setErrorMsg("No se pudo conectar al servidor.");
                setStatus("error");
            }
        };

        verify();
    }, [token]);

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

                {status === "loading" && (
                    <>
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
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="#00D4AA" strokeWidth="2" strokeDasharray="50" strokeDashoffset="20">
                                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
                                </circle>
                            </svg>
                        </div>
                        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", margin: "0 0 8px" }}>
                            Verificando tu correo...
                        </h1>
                        <p style={{ fontSize: "14px", color: "#9CA3AF" }}>Un momento, por favor.</p>
                    </>
                )}

                {status === "success" && (
                    <>
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
                                <path d="M5 13l4 4L19 7" stroke="#00D4AA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111111", margin: "0 0 8px" }}>
                            ¡Correo verificado!
                        </h1>
                        <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: "1.6" }}>
                            Tu cuenta está activa. Redirigiendo al dashboard...
                        </p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                            background: "rgba(239,68,68,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 24px",
                        }}>
                            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                                <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                                    stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111111", margin: "0 0 8px" }}>
                            Enlace inválido
                        </h1>
                        <p style={{ fontSize: "14px", color: "#6B7280", margin: "0 0 24px", lineHeight: "1.6" }}>
                            {errorMsg}
                        </p>
                        <a
                            href="/login"
                            style={{
                                display: "inline-block",
                                padding: "10px 24px",
                                background: "#111111",
                                color: "#fff",
                                borderRadius: "8px",
                                textDecoration: "none",
                                fontSize: "14px",
                                fontWeight: 600,
                            }}
                        >
                            Volver al login
                        </a>
                    </>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailConfirmPage() {
    return (
        <Suspense>
            <VerifyEmailConfirmContent />
        </Suspense>
    );
}
