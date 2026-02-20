"use client";

import React, { useEffect, useRef } from 'react';

interface AuthPanelProps {
    isLogin: boolean;
    onToggleMode: () => void;
}

export default function AuthPanel({ isLogin, onToggleMode }: AuthPanelProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -9999, y: -9999 });
    const animFrameRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const PARTICLE_COUNT = 75;
        const CONNECTION_DISTANCE = 110;
        const MOUSE_INFLUENCE = 100;
        const COLOR = '#438B7D';
        let tick = 0;

        let particles: {
            x: number; y: number;
            ox: number; oy: number;
            vx: number; vy: number;
            phase: number;
            speed: number;
            amp: number;
            radius: number;
        }[] = [];

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            buildParticles();
        };

        const buildParticles = () => {
            particles = Array.from({ length: PARTICLE_COUNT }, () => {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                return {
                    x, y,
                    ox: x, oy: y,
                    vx: 0, vy: 0,
                    phase: Math.random() * Math.PI * 2,
                    speed: 0.004 + Math.random() * 0.008,
                    amp: 8 + Math.random() * 18,
                    radius: 2.5 + Math.random() * 2,
                };
            });
        };

        const draw = () => {
            tick++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Actualizar posiciones
            for (const p of particles) {
                const organicX = Math.sin(tick * p.speed + p.phase) * p.amp;
                const organicY = Math.cos(tick * p.speed * 0.8 + p.phase + 1.2) * p.amp;
                const targetX = p.ox + organicX;
                const targetY = p.oy + organicY;

                const dx = p.x - mouseRef.current.x;
                const dy = p.y - mouseRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < MOUSE_INFLUENCE) {
                    const force = (1 - dist / MOUSE_INFLUENCE) * 8;
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                }

                p.vx += (targetX - p.x) * 0.08;
                p.vy += (targetY - p.y) * 0.08;
                p.vx *= 0.72;
                p.vy *= 0.72;
                p.x += p.vx;
                p.y += p.vy;
            }

            // Dibujar líneas entre partículas cercanas
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i];
                    const b = particles[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONNECTION_DISTANCE) {
                        const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.35;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = COLOR;
                        ctx.globalAlpha = opacity;
                        ctx.lineWidth = 1.4;
                        ctx.stroke();
                    }
                }
            }

            // Dibujar líneas hacia el mouse
            for (const p of particles) {
                const dx = p.x - mouseRef.current.x;
                const dy = p.y - mouseRef.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECTION_DISTANCE * 1.4) {
                    const opacity = (1 - dist / (CONNECTION_DISTANCE * 1.4)) * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
                    ctx.strokeStyle = COLOR;
                    ctx.globalAlpha = opacity;
                    ctx.lineWidth = 1.1;
                    ctx.stroke();
                }
            }

            // Dibujar puntos
            for (const p of particles) {
                const distToMouse = Math.sqrt(
                    (p.x - mouseRef.current.x) ** 2 +
                    (p.y - mouseRef.current.y) ** 2
                );
                const basePulse = 0.4 + Math.sin(tick * p.speed + p.phase) * 0.15;
                const mouseGlow = distToMouse < MOUSE_INFLUENCE * 1.5
                    ? (1 - distToMouse / (MOUSE_INFLUENCE * 1.5)) * 0.6
                    : 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = COLOR;
                ctx.globalAlpha = Math.min(1, basePulse + mouseGlow);
                ctx.fill();
            }

            ctx.globalAlpha = 1;
            animFrameRef.current = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -9999, y: -9999 };
        };

        resize();
        draw();

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('resize', resize);

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <div className="w-full h-full relative flex items-center justify-center p-12 overflow-hidden"
                style={{ background: 'rgb(10, 10, 10)' }}>

            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
            />

            <div className="relative z-10 text-white text-center max-w-md">
                <h2 className="text-4xl font-bold mb-4">
                    {isLogin ? '¡Hola!' : '¡Bienvenido de nuevo!'}
                </h2>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                    {isLogin
                        ? 'Ingresa tus datos y comienza tu camino con nosotros'
                        : 'Para seguir conectado inicia sesión con tu cuenta'}
                </p>
                <button
                    onClick={onToggleMode}
                    className="px-10 py-3 border-2 border-white text-white rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 font-semibold uppercase tracking-wider"
                >
                    {isLogin ? 'Regístrate' : 'Inicia sesión'}
                </button>
            </div>
        </div>
    );
}