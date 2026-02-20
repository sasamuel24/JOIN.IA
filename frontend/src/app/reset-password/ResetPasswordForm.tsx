"use client";

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type Step = 'form' | 'success';

export default function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<Step>('form');

    const handleSubmit = async () => {
        setError('');

        if (!token) {
            setError('Invalid or missing token.');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password: password }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data?.detail || 'Algo salió mal, intenta de nuevo.');
                return;
            }

            setStep('success');
        } catch {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 flex items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 64px)', marginTop: '64px' }}>
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col items-center"
                style={{ padding: '48px 40px' }}
            >
                {step === 'form' ? (
                    <div className="w-full flex flex-col items-center" style={{ gap: '28px' }}>

                        {/* Icono */}
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>

                        {/* Texto */}
                        <div className="text-center flex flex-col gap-2">
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Nueva contraseña
                            </h2>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Elige una contraseña segura<br />para tu cuenta.
                            </p>
                        </div>

                        {/* Inputs + botón */}
                        <div className="w-72 flex flex-col gap-3">
                            <input
                                type="password"
                                placeholder="Nueva contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 h-10 border border-gray-200 rounded-lg outline-none transition-all text-gray-900 placeholder:text-gray-400 text-sm bg-gray-50 focus:border-[#00D4AA] focus:bg-white focus:ring-1 focus:ring-[#00D4AA]/20"
                                autoFocus
                            />

                            <input
                                type="password"
                                placeholder="Confirmar contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                className="w-full px-5 h-10 border border-gray-200 rounded-lg outline-none transition-all text-gray-900 placeholder:text-gray-400 text-sm bg-gray-50 focus:border-[#00D4AA] focus:bg-white focus:ring-1 focus:ring-[#00D4AA]/20"
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
                                {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                            </button>
                        </div>

                        <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                            <button
                                onClick={() => router.push('/login')}
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
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                ¡Listo!
                            </h2>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Tu contraseña ha sido<br />actualizada correctamente.
                            </p>
                        </div>

                        <p className="text-xs text-gray-400 text-center leading-relaxed">
                            Ya puedes iniciar sesión<br />con tu nueva contraseña.
                        </p>

                        <div style={{ width: '288px', marginBottom: '8px' }}>
                            <button
                                onClick={() => router.push('/login')}
                                className="w-full h-10 bg-gray-900 text-white rounded-lg hover:bg-[#00D4AA] transition-all duration-200 font-semibold text-sm tracking-wide"
                            >
                                Iniciar sesión
                            </button>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}