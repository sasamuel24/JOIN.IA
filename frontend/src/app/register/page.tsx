"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        // Redirect to home for now
        window.location.href = '/';
    };

    const handleGoogleSignup = () => {
        window.location.href = '/';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen flex flex-col justify-between bg-white text-black font-sans">

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-center px-6 w-full py-8">
                <div className="w-full max-w-[520px] flex flex-col gap-12">
                    {/* Title Section */}
                    <div className="text-center flex flex-col gap-6">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                            Create your account
                        </h1>
                        <p className="text-gray-500 text-base">
                            Start managing your operations with AI
                        </p>
                    </div>

                    {/* Auth Actions */}
                    <div className="flex flex-col gap-10">
                        {/* Google Button */}
                        <div>
                            <button
                                onClick={handleGoogleSignup}
                                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700 bg-white text-base"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Sign up with Google
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">Or continue with email</span>
                            </div>
                        </div>

                        {/* Registration Form */}
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            {/* Full Name */}
                            <div className="flex flex-col gap-3">
                                <label
                                    htmlFor="fullName"
                                    className="block text-sm font-semibold text-gray-700"
                                >
                                    Full name
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    placeholder="Jane Smith"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-base"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-3">
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-semibold text-gray-700"
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="jsmith@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-base"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="flex flex-col gap-3">
                                <label
                                    htmlFor="password"
                                    className="flex items-center justify-between text-sm font-semibold text-gray-700"
                                >
                                    <span>Password</span>
                                    <span className="text-xs font-normal text-gray-500">Min 6 characters</span>
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-base"
                                    required
                                    minLength={6}
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="flex flex-col gap-3">
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-semibold text-gray-700"
                                >
                                    Password confirmation
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-base"
                                    required
                                />
                                {error && (
                                    <p className="text-xs text-red-600">{error}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full px-4 py-3.5 bg-gray-900 text-white rounded-lg hover:bg-black transition-all duration-200 font-medium text-base"
                            >
                                Create account →
                            </button>

                            {/* Login Link */}
                            <p className="text-center text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link href="/login" className="font-semibold text-gray-900 hover:underline">
                                    Log in
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
