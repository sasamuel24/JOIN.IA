"use client";

import React, { useState, useEffect } from 'react';

interface RegisterFormProps {
    onToggleMode: () => void;
}

export default function RegisterForm({ onToggleMode }: RegisterFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    // Lee el email guardado desde la página principal
    useEffect(() => {
        const savedEmail = sessionStorage.getItem('register_email');
        if (savedEmail) {
            setEmail(savedEmail);
            sessionStorage.removeItem('register_email');
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    full_name: fullName,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data?.detail || "Register failed");
                return;
            }

            onToggleMode();
        } catch (err) {
            setError("Cannot connect to backend (is it running?)");
        }
    };

    const handleGoogleSignup = () => {
        window.location.href = "http://127.0.0.1:8000/api/v1/auth/google/login";
    };

    return (
        <div className="w-full flex flex-col items-center gap-6">

            {/* Título */}
            <div className="text-center flex flex-col gap-1">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Create account
                </h2>
                <p className="text-gray-400 text-sm">
                    Start your journey with JOIN.IA
                </p>
            </div>

            {/* Campos */}
            <div className="w-72 flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-5 h-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400 text-sm bg-gray-50"
                    required
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 h-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400 text-sm bg-gray-50"
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 h-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400 text-sm bg-gray-50"
                    required
                    minLength={6}
                />

                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-5 h-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400 text-sm bg-gray-50"
                    required
                />

                {error && (
                    <div className="text-xs text-red-500 bg-red-50 border border-red-100 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}
            </div>

            {/* Botones */}
            <div className="w-72 flex flex-col gap-3">
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full h-10 bg-gray-900 text-white rounded-lg hover:bg-black transition-all duration-200 font-semibold text-sm tracking-wide"
                >
                    Create Account
                </button>

                <div className="relative flex items-center gap-3 py-1">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="text-xs text-gray-400">or</span>
                    <div className="flex-1 border-t border-gray-200"></div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleSignup}
                    className="w-full flex items-center justify-center gap-3 px-4 h-10 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 bg-white"
                >
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="text-gray-600 font-medium text-sm">Continue with Google</span>
                </button>
            </div>

            {/* Link login */}
            <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <button
                    type="button"
                    onClick={onToggleMode}
                    className="text-gray-900 font-bold hover:underline"
                >
                    Sign In
                </button>
            </p>

        </div>
    );
}