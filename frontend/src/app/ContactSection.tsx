"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ContactSection() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleRegister = () => {
    if (email) {
      sessionStorage.setItem('register_email', email);
    }
    router.push('/login?mode=register');
  };

  return (
    <section id="contacto" style={{ padding: '7rem 0 5rem', background: '#fff' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <span style={{
          display: 'inline-block',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: '#111',
          border: '1px solid rgba(0,0,0,0.2)',
          borderRadius: '4px',
          padding: '0.35rem 0.75rem',
          letterSpacing: '0.02em',
          marginBottom: '2rem'
        }}>
          Acceso temprano
        </span>
        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 700, color: '#111', lineHeight: 1.1, margin: '0 0 1.25rem 0' }}>
          Regístrate para entrar
        </h2>
        <p style={{ fontSize: '1rem', color: 'rgba(0,0,0,0.55)', lineHeight: 1.7, margin: '0 0 2.5rem 0', maxWidth: '480px' }}>
          Crea tu cuenta para acceder a JOIN.IA y recibir novedades del producto mientras lo construimos.
        </p>

        {/* Email + Button row */}
        <div style={{ display: 'flex', width: '100%', maxWidth: '480px', gap: '0', marginBottom: '2rem' }}>
          <input
            type="email"
            placeholder="Email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
            style={{
              flex: 1,
              padding: '0.85rem 1.25rem',
              fontSize: '0.95rem',
              background: '#F7F7F7',
              color: '#111',
              border: '1px solid rgba(0,0,0,0.12)',
              borderRight: 'none',
              borderRadius: '6px 0 0 6px',
              outline: 'none',
            }}
          />
          <button
            onClick={handleRegister}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.85rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#fff',
              background: '#111',
              border: '1px solid #111',
              borderRadius: '0 6px 6px 0',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Registrarme
          </button>
        </div>

        {/* Links */}
        <p style={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.45)', margin: '0 0 0.5rem 0' }}>
          ¿Ya estás registrado?{' '}
          <a href="/login" style={{ color: '#111', textDecoration: 'underline' }}>Inicia sesión</a>
        </p>
        <a href="#" style={{ fontSize: '0.8rem', color: 'rgba(0,0,0,0.35)', textDecoration: 'underline' }}>
          Política de privacidad
        </a>
      </div>
    </section>
  );
}