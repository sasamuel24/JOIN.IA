"use client";

import { useState } from 'react';

interface ForgotPasswordModalProps {
    onClose: () => void;
}

type Step = 'email' | 'sent';

export default function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<Step>('email');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email) {
            setError('Please enter your email');
            return;
        }
        setError('');
        setLoading(true);

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            setStep('sent');
        } catch {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 flex flex-col items-center"
                style={{ padding: '64px 40px' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-gray-300 hover:text-gray-500 transition-colors"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                {step === 'email' ? (
                    <div className="w-full flex flex-col items-center" style={{ gap: '28px' }}>

                        {/* Icono */}
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="4" width="20" height="16" rx="2"/>
                                <path d="M2 7l10 7 10-7"/>
                            </svg>
                        </div>

                        {/* Texto */}
                        <div className="text-center flex flex-col gap-2">
                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                                ¿Olvidaste tu contraseña?
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                            </p>
                        </div>

                        {/* Input + botón */}
                        <div className="w-72 flex flex-col gap-3">
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                className="w-full px-5 h-10 border border-gray-200 rounded-lg outline-none transition-all text-gray-900 placeholder:text-gray-400 text-sm bg-gray-50 focus:border-[#00D4AA] focus:bg-white focus:ring-1 focus:ring-[#00D4AA]/20"
                                autoFocus
                            />

                            {error && (
                                <div className="text-xs text-red-500 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full h-10 bg-gray-900 text-white rounded-lg hover:bg-[#00D4AA] transition-all duration-200 font-semibold text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Enviando...' : 'Enviar enlace'}
                            </button>
                        </div>

                        {/* Back link con espacio generoso abajo */}
                        <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                            <button
                                onClick={onClose}
                                className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                            >
                                Volver a iniciar sesión
                            </button>
                        </div>

                    </div>
                ) : (
                    <div className="w-full flex flex-col items-center" style={{ gap: '28px' }}>

                        {/* Icono éxito */}
                        <div className="w-14 h-14 rounded-full bg-[#00D4AA]/10 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4AA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5"/>
                            </svg>
                        </div>

                        {/* Texto éxito */}
                        <div className="text-center flex flex-col gap-2">
                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Revisa tu correo
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Enviamos un enlace a<br />
                                <span className="text-gray-700 font-medium">{email}</span>
                            </p>
                        </div>

                        <p className="text-xs text-gray-400 text-center leading-relaxed">
                            ¿No lo recibiste? Revisa tu carpeta de spam<br />o intenta con otro correo.
                        </p>

                        <div style={{ width: '288px', marginBottom: '8px' }}>
                            <button
                                onClick={onClose}
                                className="w-full h-10 bg-gray-900 text-white rounded-lg hover:bg-[#00D4AA] transition-all duration-200 font-semibold text-sm tracking-wide"
                            >
                                Back to Sign In
                            </button>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}