"use client";

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import AuthPanel from './AuthPanel';

export default function AuthContainer() {
    const [isLogin, setIsLogin] = useState(true);

    const toggleMode = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div
            className="flex items-center justify-center bg-gray-100 px-4 py-8"
            style={{ minHeight: 'calc(100vh - 64px)', marginTop: '64px' }}
        >
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex relative"
                 style={{ minHeight: isLogin ? '520px' : '520px', transition: 'min-height 0.7s ease-in-out' }}
            >
                {/* Panel de Formulario */}
                <div
                    className={`absolute w-full lg:w-1/2 h-full flex items-center justify-center p-8 bg-white transition-all duration-700 ease-in-out ${
                        isLogin ? 'lg:left-0' : 'lg:left-1/2'
                    }`}
                >
                    <div className="w-full max-w-md relative">
                        {/* Login Form */}
                        <div
                            className={`transition-opacity duration-500 ${
                                isLogin ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'
                            }`}
                        >
                            <LoginForm onToggleMode={toggleMode} />
                        </div>

                        {/* Register Form */}
                        <div
                            className={`transition-opacity duration-500 ${
                                !isLogin ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'
                            }`}
                        >
                            <RegisterForm onToggleMode={toggleMode} />
                        </div>
                    </div>
                </div>

                {/* Panel Decorativo */}
                <div
                    className={`hidden lg:block absolute w-1/2 h-full transition-all duration-700 ease-in-out ${
                        isLogin ? 'left-1/2' : 'left-0'
                    }`}
                >
                    <AuthPanel isLogin={isLogin} onToggleMode={toggleMode} />
                </div>
            </div>
        </div>
    );
}