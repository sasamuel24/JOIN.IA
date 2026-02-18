"use client";

import { useState } from 'react';
import Link from 'next/link';
import WhatsappFloat from '@/components/WhatsappFloat';
import { Typewriter } from '@/components/ui/Typewriter';
import { FloatingPaths } from '@/components/ui/background-paths';
import { Header } from '@/components/ui/header-1';
import AuthStatus from "@/components/AuthStatus";
import ContactSection from './ContactSection';

const faqItems = [
  {
    q: '¿Qué es JOIN.IA, en una frase?',
    a: 'JOIN.IA es un producto de IA que estamos construyendo para ayudar a las empresas a reducir y eliminar procesos manuales, convirtiendo el trabajo repetitivo en ejecución más simple y consistente.',
  },
  {
    q: '¿JOIN.IA es una agencia, un software o consultoría?',
    a: 'JOIN.IA es producto. En esta etapa, también trabajamos de cerca con algunos equipos para entender sus procesos y construir con casos reales.',
  },
  {
    q: '¿Para quién es JOIN.IA?',
    a: 'Para empresas y equipos que sienten que el trabajo se vuelve lento por depender de coordinación manual, tareas repetidas y procesos que no escalan.',
  },
  {
    q: '¿Qué tipo de procesos ayuda a eliminar?',
    a: 'Procesos repetitivos que consumen tiempo y energía: seguimiento, coordinación, registro de información, control operativo y tareas administrativas que hoy dependen de personas.',
  },
  {
    q: '¿Necesito un equipo técnico para usar JOIN.IA?',
    a: 'No. La idea es que sea usable por personas de negocio y operación. Si hoy dependes del "más técnico del equipo" para todo, JOIN.IA es para ti.',
  },
  {
    q: '¿Cuándo puedo empezar a usarlo?',
    a: 'Estamos abriendo acceso de forma progresiva. Si te registras, te avisamos cuando habilitemos cupos y te damos prioridad para probarlo.',
  },
  {
    q: '¿Cómo puedo contribuir o ser parte del proceso?',
    a: 'Regístrate y cuéntanos un proceso manual que te drena tiempo cada semana. Con eso priorizamos qué construir primero y te invitamos a probarlo antes.',
  },
  {
    q: '¿Cómo manejan la privacidad de mi información?',
    a: 'Solo pedimos lo mínimo para contactarte y aprender de tu caso. Si compartes información, será únicamente con tu autorización y con enfoque en construir la solución.',
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" style={{ padding: '7rem 0', background: '#fff' }}>
      <style>{`
        .faq-chevron { transition: transform 0.3s ease; }
        .faq-chevron.open { transform: rotate(180deg); }
        .faq-answer { overflow: hidden; transition: max-height 0.35s ease, opacity 0.3s ease; }
      `}</style>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '5rem', alignItems: 'start' }}>
        {/* Left: Header */}
        <div>
          <span style={{
            display: 'inline-block',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#111',
            border: '1px solid rgba(0,0,0,0.2)',
            borderRadius: '4px',
            padding: '0.35rem 0.75rem',
            letterSpacing: '0.02em',
            marginBottom: '1.5rem'
          }}>
            FAQ
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 700, color: '#111', lineHeight: 1.1, margin: '0 0 1.25rem 0' }}>
            Lo que necesitas saber
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(0,0,0,0.55)', lineHeight: 1.7, margin: 0, maxWidth: '420px' }}>
            Preguntas comunes sobre qué es JOIN.IA, cómo lo estamos construyendo y para quién está pensado.
          </p>
        </div>

        {/* Right: Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {faqItems.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.25rem 0',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    gap: '1rem',
                  }}
                >
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111', lineHeight: 1.4 }}>
                    {item.q}
                  </span>
                  <svg
                    className={`faq-chevron${isOpen ? ' open' : ''}`}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M6 9l6 6 6-6" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div
                  className="faq-answer"
                  style={{
                    maxHeight: isOpen ? '300px' : '0',
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <p style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.55)', lineHeight: 1.7, margin: '0 0 1.25rem 0', paddingRight: '2rem' }}>
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
export default function Home() {
  return (
    <>
      <Header />
      <AuthStatus />

      <main>
        <section className="hero relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
            <FloatingPaths position={1} />
            <FloatingPaths position={-1} />
          </div>
          <div className="container hero-content relative z-10">
            <h1 className="hero-title">
              <Typewriter
                text="¿Tu empresa está preparada para implementar Inteligencia artificial?"
                speed={50}
                cursor="|"
                loop={false}
              />
            </h1>
            <p className="hero-subtitle">
              <Typewriter
                text="Ordenamos el conocimiento, automatizamos flujos de trabajo y preparamos tu negocio para escalar con IA."
                speed={30}
                cursor="|"
                loop={false}
                delay={2000}
              />
            </p>
            <div className="hero-actions">
              <a href="#contacto" className="btn btn-primary">Transformar mi empresa</a>
              <a href="#vision" className="btn btn-secondary">Saber más</a>
            </div>
          </div>
        </section>

        <section id="problemas" style={{ padding: '7rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '2rem', maxWidth: '750px', margin: '0 auto' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#111', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '50px', padding: '0.6rem 1.25rem', letterSpacing: '0.01em' }}>
                Estamos construyendo el próximo estándar de operación con IA
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </span>
              <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 700, color: '#111', lineHeight: 1.15, margin: 0 }}>
                De &ldquo;hacerlo a mano&rdquo; a &ldquo;que se haga solo&rdquo;.
              </h2>
              <p style={{ fontSize: '1.1rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.7, maxWidth: '650px', margin: 0 }}>
                JOIN.IA está naciendo para que las empresas dejen de depender de tareas repetitivas, seguimiento manual y operación dispersa—y pasen a un sistema donde la IA impulsa la ejecución.
              </p>
              <div style={{ marginTop: '0.5rem' }}>
                <a href="#contacto" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#fff', backgroundColor: '#111', borderRadius: '6px', textDecoration: 'none' }}>
                  Quiero acceso anticipado
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="pipeline" style={{ padding: '7rem 0' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', width: '100%' }}>
            {/* Header: left-aligned */}
            <div style={{ maxWidth: '600px', marginBottom: '4rem' }}>
              <span style={{
                display: 'inline-block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#111',
                border: '1px solid rgba(0,0,0,0.2)',
                borderRadius: '4px',
                padding: '0.35rem 0.75rem',
                letterSpacing: '0.02em',
                marginBottom: '1.5rem'
              }}>
                Why JOIN.IA
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 700, color: '#111', lineHeight: 1.1, margin: '0 0 1.5rem 0' }}>
                Operar sin procesos manuales
              </h2>
              <p style={{ fontSize: '1rem', color: 'rgba(0,0,0,0.55)', lineHeight: 1.7, margin: 0 }}>
                Hoy, eliminar lo manual se reduce a tres cosas: detectar lo repetitivo, convertirlo en un flujo claro, y asegurar que la ejecución pase siempre igual.
                <br />JOIN.IA está naciendo para hacer eso simple.
              </p>
            </div>

            {/* 3 Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
              {/* Card 01 */}
              <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '420px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(0,0,0,0.45)', textTransform: 'uppercase' as const }}>/01 IDENTIFICACIÓN</span>
                  <div style={{
                    margin: '1.5rem 0',
                    height: '160px',
                    backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.15) 1.2px, transparent 1.2px)',
                    backgroundSize: '18px 18px',
                    borderRadius: '8px'
                  }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111', marginBottom: '0.6rem', lineHeight: 1.3 }}>
                    Descubre dónde se va el tiempo
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, margin: 0 }}>
                    Identifica tareas repetitivas, puntos de fricción y &ldquo;trabajos invisibles&rdquo; que consumen horas. Para que mejores con datos, no con intuición.
                  </p>
                </div>
              </div>

              {/* Card 02 */}
              <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '420px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(0,0,0,0.45)', textTransform: 'uppercase' as const }}>/02 AUTOMATIZACIÓN</span>
                  <div style={{
                    margin: '1.5rem 0',
                    height: '160px',
                    backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.15) 1.2px, transparent 1.2px)',
                    backgroundSize: '18px 18px',
                    borderRadius: '8px'
                  }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111', marginBottom: '0.6rem', lineHeight: 1.3 }}>
                    Convierte lo manual en un sistema
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, margin: 0 }}>
                    Transforma procesos en pasos ejecutables para que el trabajo avance sin depender de perseguir personas, copiar/pegar o revisar mil veces.
                  </p>
                </div>
              </div>

              {/* Card 03 */}
              <div style={{ border: '1px solid rgba(0,0,0,0.12)', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '420px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(0,0,0,0.45)', textTransform: 'uppercase' as const }}>/03 VISIBILIDAD</span>
                  <div style={{
                    margin: '1.5rem 0',
                    height: '160px',
                    backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.15) 1.2px, transparent 1.2px)',
                    backgroundSize: '18px 18px',
                    borderRadius: '8px'
                  }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111', marginBottom: '0.6rem', lineHeight: 1.3 }}>
                    Mantén a todos alineados
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, margin: 0 }}>
                    Una sola fuente de verdad sobre qué está pasando y qué sigue. Menos &ldquo;¿en qué vamos?&rdquo;, más claridad y ejecución continua.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonios" style={{ padding: '6rem 0', overflow: 'hidden' }}>
          {/* Inline keyframes for marquee — CSS classes don't survive Tailwind v4 */}
          <style>{`
            @keyframes mq-left { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            @keyframes mq-right { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
            .mq-left { animation: mq-left 20s linear infinite; }
            .mq-right { animation: mq-right 20s linear infinite; }
            .mq-wrap:hover .mq-left, .mq-wrap:hover .mq-right { animation-play-state: paused; }
          `}</style>

          {/* Header */}
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 4rem' }}>
            <span style={{
              display: 'inline-block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#111',
              border: '1px solid rgba(0,0,0,0.2)',
              borderRadius: '4px',
              padding: '0.35rem 0.75rem',
              letterSpacing: '0.02em',
              marginBottom: '1.5rem'
            }}>
              Lo escuchamos todo el tiempo
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 700, color: '#111', lineHeight: 1.1, margin: '0 0 1.5rem 0', maxWidth: '600px' }}>
              Operar no debería ser tan manual
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(0,0,0,0.55)', lineHeight: 1.8, margin: 0, maxWidth: '620px' }}>
              Hoy el trabajo no falla por falta de talento.<br />
              Falla porque la operación vive en la cabeza de las personas.<br />
              Y cuando eso pasa, todo se vuelve lento, frágil y difícil de repetir.
              <br /><br />
              Esto es lo que seguimos escuchando en empresas que quieren crecer sin ahogarse en lo repetitivo.
            </p>
          </div>

          {/* Marquee Row 1: left */}
          <div className="mq-wrap" style={{ marginBottom: '1.25rem' }}>
            <div className="mq-left" style={{ display: 'flex', gap: '1.25rem', width: 'max-content', willChange: 'transform' }}>
              {[...Array(2)].map((_, i) => (
                <div key={`r1-${i}`} style={{ display: 'flex', gap: '1.25rem' }}>
                  <div style={{ flexShrink: 0, width: '340px', background: '#F7F7F7', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem' }}>
                    <p style={{ fontSize: '0.95rem', color: '#111', lineHeight: 1.6, margin: 0 }}>&ldquo;Todo depende de una persona. Si no está, la operación se frena.&rdquo;</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src="/img6.jpeg" alt="Andrea" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111' }}>Andrea</div>
                        <div style={{ fontSize: '0.75rem', color: '#4A4A4A' }}>Operaciones</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, width: '340px', background: '#F7F7F7', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem' }}>
                    <p style={{ fontSize: '0.95rem', color: '#111', lineHeight: 1.6, margin: 0 }}>&ldquo;Terminamos haciendo el trabajo dos veces: primero en WhatsApp… y luego en Excel.&rdquo;</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src="/img4.png" alt="Felipe" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111' }}>Felipe</div>
                        <div style={{ fontSize: '0.75rem', color: '#4A4A4A' }}>Coordinador</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, width: '340px', background: '#F7F7F7', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem' }}>
                    <p style={{ fontSize: '0.95rem', color: '#111', lineHeight: 1.6, margin: 0 }}>&ldquo;Las aprobaciones nos matan. El proceso es simple, pero la cadena es eterna.&rdquo;</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src="/img8.png" alt="Laura" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111' }}>Laura</div>
                        <div style={{ fontSize: '0.75rem', color: '#4A4A4A' }}>Administración</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, width: '340px', background: '#F7F7F7', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem' }}>
                    <p style={{ fontSize: '0.95rem', color: '#111', lineHeight: 1.6, margin: 0 }}>&ldquo;Cada área tiene su &lsquo;verdad&rsquo;. Cuando llega el reporte, nadie confía en los números.&rdquo;</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src="/img1.png" alt="Camilo" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111' }}>Camilo</div>
                        <div style={{ fontSize: '0.75rem', color: '#4A4A4A' }}>Dirección</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Marquee Row 2: right */}
          <div className="mq-wrap">
            <div className="mq-right" style={{ display: 'flex', gap: '1.25rem', width: 'max-content', willChange: 'transform' }}>
              {[...Array(2)].map((_, i) => (
                <div key={`r2-${i}`} style={{ display: 'flex', gap: '1.25rem' }}>
                  <div style={{ flexShrink: 0, width: '340px', background: '#F7F7F7', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem' }}>
                    <p style={{ fontSize: '0.95rem', color: '#111', lineHeight: 1.6, margin: 0 }}>&ldquo;Lo repetitivo nos roba el día: seguimiento, recordatorios, actualizaciones, confirmaciones.&rdquo;</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src="/img7.png" alt="Sara" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111' }}>Sara</div>
                        <div style={{ fontSize: '0.75rem', color: '#4A4A4A' }}>Comercial</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, width: '340px', background: '#F7F7F7', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem' }}>
                    <p style={{ fontSize: '0.95rem', color: '#111', lineHeight: 1.6, margin: 0 }}>&ldquo;Tenemos herramientas… pero no están conectadas. Todo queda en el medio: la gente.&rdquo;</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src="/img2.png" alt="Juan" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111' }}>Juan</div>
                        <div style={{ fontSize: '0.75rem', color: '#4A4A4A' }}>Tecnología</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, width: '340px', background: '#F7F7F7', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem' }}>
                    <p style={{ fontSize: '0.95rem', color: '#111', lineHeight: 1.6, margin: 0 }}>&ldquo;El problema no es trabajar duro. Es trabajar en tareas que una IA debería hacer.&rdquo;</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src="/img5.png" alt="Mariana" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111' }}>Mariana</div>
                        <div style={{ fontSize: '0.75rem', color: '#4A4A4A' }}>Founder</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, width: '340px', background: '#F7F7F7', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem' }}>
                    <p style={{ fontSize: '0.95rem', color: '#111', lineHeight: 1.6, margin: 0 }}>&ldquo;Cuando crecemos, crece el caos. Más clientes = más cosas manuales.&rdquo;</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src="/img3.png" alt="Daniel" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111' }}>Daniel</div>
                        <div style={{ fontSize: '0.75rem', color: '#4A4A4A' }}>Gerente General</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Plataforma Section */}
        <section id="plataforma" style={{ padding: '7rem 0', background: '#fff' }}>
          <style>{`
            @keyframes dot-float {
              0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
              50% { transform: translateY(-8px) scale(1.3); opacity: 1; }
            }
            .dot-grid-cell {
              width: 4px; height: 4px; border-radius: 50%; background: rgba(0,0,0,0.18);
              animation: dot-float var(--dur, 3s) ease-in-out var(--delay, 0s) infinite;
            }
          `}</style>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            {/* Left: Content */}
            <div>
              <span style={{
                display: 'inline-block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#111',
                border: '1px solid rgba(0,0,0,0.2)',
                borderRadius: '4px',
                padding: '0.35rem 0.75rem',
                letterSpacing: '0.02em',
                marginBottom: '1.5rem'
              }}>
                Plataforma
              </span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, color: '#111', lineHeight: 1.15, margin: '0 0 1.5rem 0' }}>
                Diseñada para empresas que quieren operar sin procesos manuales
              </h2>
              <p style={{ fontSize: '1rem', color: 'rgba(0,0,0,0.55)', lineHeight: 1.7, margin: '0 0 2.5rem 0', maxWidth: '520px' }}>
                JOIN.IA está naciendo para darle a las empresas una sola cosa que hoy casi nadie tiene: un puente claro entre lo que pasa en la operación y lo que la IA puede ejecutar, para que el trabajo deje de depender de pasos humanos repetidos.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <path d="M20 6L9 17l-5-5" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111', marginBottom: '0.25rem' }}>Orientada a resultados</div>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.5 }}>Hecha para que el trabajo avance, no para sumar más &ldquo;herramientas&rdquo; al día a día.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <path d="M20 6L9 17l-5-5" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111', marginBottom: '0.25rem' }}>Lista para cualquier equipo</div>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.5 }}>Funciona para operaciones, ventas, administración y liderazgo — sin depender de un perfil técnico.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <path d="M20 6L9 17l-5-5" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111', marginBottom: '0.25rem' }}>Estandariza la ejecución</div>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.5 }}>Convierte el &ldquo;cada quien lo hace a su manera&rdquo; en un sistema repetible y confiable.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <path d="M20 6L9 17l-5-5" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111', marginBottom: '0.25rem' }}>IA desde el inicio</div>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.5 }}>Un enfoque nativo de IA para reducir fricción, acelerar decisiones y eliminar lo repetitivo.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Dynamic dot pattern */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(20, 1fr)', gridTemplateRows: 'repeat(16, 1fr)', gap: '12px', padding: '2rem', minHeight: '420px' }}>
              {Array.from({ length: 320 }).map((_, idx) => {
                const col = idx % 20;
                const row = Math.floor(idx / 20);
                const cx = 10, cy = 8;
                const dist = Math.sqrt((col - cx) ** 2 + (row - cy) ** 2);
                const show = Math.random() > 0.35 && dist < 12;
                if (!show) return <div key={idx} />;
                const dur = (2 + Math.random() * 3).toFixed(1);
                const delay = (Math.random() * 4).toFixed(1);
                return (
                  <div
                    key={idx}
                    className="dot-grid-cell"
                    style={{ '--dur': `${dur}s`, '--delay': `${delay}s` } as React.CSSProperties}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection />
        <ContactSection />
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-logo">JOIN.IA</div>
          <p className="copyright">&copy; 2025 JOIN.IA. Todos los derechos reservados.</p>
        </div>
      </footer>
      <WhatsappFloat />
    </>
  );
}
