"use client";

import React from 'react';

interface AuthPanelProps {
    isLogin: boolean;
    onToggleMode: () => void;
}

export default function AuthPanel({ isLogin, onToggleMode }: AuthPanelProps) {
    return (
        <div className="w-full h-full relative bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-12 overflow-hidden">
            {/* Patrón decorativo sutil de fondo */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            </div>

            {/* Contenido del panel */}
            <div className="relative z-10 text-white text-center max-w-md">
                <h2 className="text-4xl font-bold mb-4">
                    {isLogin ? 'Hello, Friend!' : 'Welcome Back!'}
                </h2>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                    {isLogin 
                        ? 'Enter your personal details and start your journey with us'
                        : 'To keep connected with us please login with your personal info'}
                </p>
                <button
                    onClick={onToggleMode}
                    className="px-10 py-3 border-2 border-white text-white rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 font-semibold uppercase tracking-wider"
                >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
            </div>
        </div>
    );
}