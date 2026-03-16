'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type State = 'loading' | 'accepting' | 'success' | 'error' | 'unauthenticated' | 'wrong_account';

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [state, setState] = useState<State>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setErrorMsg('El enlace de invitación no es válido o está incompleto.');
      return;
    }

    const accessToken = localStorage.getItem('access_token');

    if (!accessToken) {
      setState('unauthenticated');
      return;
    }

    setState('accepting');

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/invitations/accept?token=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
      .then(async (res) => {
        if (res.ok) {
          setState('success');
        } else {
          const body = await res.json().catch(() => ({}));
          if (res.status === 403) {
            setState('wrong_account');
            setErrorMsg(body?.detail ?? 'Esta invitación fue enviada a otro correo.');
          } else {
            setState('error');
            setErrorMsg(body?.detail ?? 'No se pudo aceptar la invitación.');
          }
        }
      })
      .catch(() => {
        setState('error');
        setErrorMsg('No se pudo conectar con el servidor. Intenta de nuevo.');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f4f0] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-br from-[#0d1117] to-[#1a2332] px-8 py-8 text-center">
          <p className="text-xs font-bold tracking-[4px] text-[#2dd4a0] uppercase mb-3">JOIN.IA</p>
          <h1 className="text-2xl font-bold text-white leading-snug">
            {state === 'success' ? '¡Bienvenido a la comunidad!' : 'Invitación a JOIN.IA'}
          </h1>
        </div>

        {/* Body */}
        <div className="px-8 py-10 text-center">

          {/* LOADING / ACCEPTING */}
          {(state === 'loading' || state === 'accepting') && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-[#e5e7eb] border-t-[#2dd4a0] animate-spin" />
              <p className="text-gray-500 text-sm">
                {state === 'loading' ? 'Verificando tu invitación...' : 'Aceptando tu invitación...'}
              </p>
            </div>
          )}

          {/* SUCCESS */}
          {state === 'success' && (
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-[#f0fdf8] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#2dd4a0]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-gray-700 text-base font-medium mb-1">
                  Tu invitación fue aceptada correctamente.
                </p>
                <p className="text-gray-400 text-sm">
                  Ya eres parte del cambio. Explora la plataforma y conecta con la comunidad.
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#2dd4a0] to-[#0d9e74] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Ir al dashboard →
              </button>
            </div>
          )}

          {/* UNAUTHENTICATED */}
          {state === 'unauthenticated' && (
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-[#fef9ec] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#f59e0b]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-700 text-base font-medium mb-1">
                  Necesitas una cuenta para aceptar
                </p>
                <p className="text-gray-400 text-sm">
                  Regístrate con el correo al que llegó esta invitación para que se acepte automáticamente.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <Link
                  href={`/register?invitation_token=${encodeURIComponent(token ?? '')}`}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#2dd4a0] to-[#0d9e74] text-white font-semibold text-sm text-center hover:opacity-90 transition-opacity"
                >
                  Crear cuenta gratis
                </Link>
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/invitations/accept?token=${token ?? ''}`)}`}
                  className="w-full py-3 rounded-full border border-gray-200 text-gray-600 font-semibold text-sm text-center hover:bg-gray-50 transition-colors"
                >
                  Ya tengo cuenta — Iniciar sesión
                </Link>
              </div>
            </div>
          )}

          {/* WRONG ACCOUNT */}
          {state === 'wrong_account' && (
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-[#fff7ed] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#f97316]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-700 text-base font-medium mb-2">Cuenta incorrecta</p>
                <p className="text-gray-400 text-sm leading-relaxed">{errorMsg}</p>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => {
                    localStorage.removeItem('access_token');
                    window.location.href = `/login?redirect=${encodeURIComponent(`/invitations/accept?token=${token ?? ''}`)}`;
                  }}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#2dd4a0] to-[#0d9e74] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Cambiar de cuenta →
                </button>
                <Link href="/dashboard" className="w-full py-3 rounded-full border border-gray-200 text-gray-600 font-semibold text-sm text-center hover:bg-gray-50 transition-colors">
                  Ir al dashboard
                </Link>
              </div>
            </div>
          )}

          {/* ERROR */}
          {state === 'error' && (
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-[#fef2f2] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#ef4444]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-gray-700 text-base font-medium mb-1">Invitación no válida</p>
                <p className="text-gray-400 text-sm">{errorMsg}</p>
              </div>
              <Link
                href="/"
                className="w-full py-3 rounded-full border border-gray-200 text-gray-600 font-semibold text-sm text-center hover:bg-gray-50 transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-[#f8faf9] border-t border-[#e5e7eb] text-center">
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-[#2dd4a0]">JOIN.IA</span> · Reduciendo fricción · 2026
          </p>
        </div>

      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f4f4f0]">
        <div className="w-10 h-10 rounded-full border-4 border-[#e5e7eb] border-t-[#2dd4a0] animate-spin" />
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  );
}
