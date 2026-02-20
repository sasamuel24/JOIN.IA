"use client";

import Link from 'next/link';
import { Header } from '@/components/ui/header-1';

export default function HistoriaPage() {
  return (
    <>
      <Header />

      <main style={{ background: '#fff', color: '#111' }}>
        <style>{`
          .historia-section-inner { padding: 0 2rem; max-width: 780px; margin: 0 auto; }
          .creemos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
          .pillars-grid  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 2.5rem; }
          @media (max-width: 768px) {
            .creemos-grid { grid-template-columns: 1fr; }
            .pillars-grid  { grid-template-columns: 1fr; }
          }
        `}</style>
        {/* Hero */}
        <section style={{ paddingTop: '10rem', paddingBottom: '5rem' }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 2rem' }}>
            <span style={{
              display: 'inline-block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#00D4AA',
              border: '1px solid rgba(0, 212, 170, 0.3)',
              borderRadius: '4px',
              padding: '0.35rem 0.75rem',
              letterSpacing: '0.02em',
              marginBottom: '2rem',
            }}>
              Por qu&eacute; estamos construyendo JOIN.IA
            </span>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 700, lineHeight: 1.1, margin: '0 0 1.5rem 0', color: '#111' }}>
              El problema operativo que toda empresa conoce demasiado bien
            </h1>
          </div>
        </section>

        {/* Divider */}
        <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.25), transparent)' }} />
        </div>

        {/* Section 1 — Por qué el trabajo manual sigue ganando */}
        <section style={{ padding: '5rem 0' }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 2rem' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 700, lineHeight: 1.15, margin: '0 0 2rem 0', color: '#111' }}>
              Por qué el trabajo manual sigue ganando en las empresas
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1.05rem', color: 'rgba(0,0,0,0.6)', lineHeight: 1.8 }}>
              <p style={{ margin: 0 }}>
                La mayoría de empresas todavía opera como si el tiempo fuera infinito y la energía del equipo no se agotara.
                Procesos, tareas y decisiones se sostienen con coordinación humana: mensajes, revisiones, recordatorios, reuniones y &ldquo;estar encima&rdquo;.
              </p>
              <p style={{ margin: 0 }}>
                En teoría, todo está definido. En la realidad, todo depende de personas intentando que el sistema funcione.
              </p>
              <p style={{ margin: 0, fontWeight: 600, color: '#111' }}>
                Las herramientas que usamos no fueron diseñadas para erradicar eso.<br />
                Nos ayudan a organizar el trabajo, pero no a eliminar lo manual del trabajo.
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.25), transparent)' }} />
        </div>

        {/* Section 2 — El patrón que empecé a ver */}
        <section style={{ padding: '5rem 0' }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 2rem' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 700, lineHeight: 1.15, margin: '0 0 2rem 0', color: '#111' }}>
              El patrón que empecé a ver
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1.05rem', color: 'rgba(0,0,0,0.6)', lineHeight: 1.8 }}>
              <p style={{ margin: 0 }}>
                En distintas empresas y equipos —con tamaños, industrias y ritmos diferentes— el patrón siempre se repetía:
              </p>
              <p style={{ margin: 0 }}>
                La operación &ldquo;funcionaba&rdquo;… hasta que crecía un poco.<br />
                Más clientes, más tareas. Más tareas, más coordinación.<br />
                Y más coordinación, más desgaste.
              </p>
              <p style={{ margin: 0 }}>
                No era falta de talento.<br />
                No era falta de ganas.<br />
                Era que el negocio estaba montado sobre trabajo repetitivo invisible: ese que nadie presume, pero que consume el día.
              </p>
              <p style={{ margin: 0, fontWeight: 600, color: '#111' }}>
                Cada vez que algo se atrasaba, no era por un &ldquo;gran problema&rdquo;.<br />
                Era por la suma de mil cosas pequeñas hechas a mano.
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.25), transparent)' }} />
        </div>

        {/* Section 3 — Dónde se rompe el stack actual */}
        <section style={{ padding: '5rem 0' }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 2rem' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 700, lineHeight: 1.15, margin: '0 0 2rem 0', color: '#111' }}>
              Dónde se rompe el stack actual
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1.05rem', color: 'rgba(0,0,0,0.6)', lineHeight: 1.8 }}>
              <p style={{ margin: 0 }}>
                Nunca fue por falta de herramientas. El problema es cómo encajan. O mejor: cómo no encajan.
              </p>
              <p style={{ margin: 0 }}>
                Tienes herramientas para comunicar (chat), para registrar (docs), para organizar (tableros), para medir (dashboards).
                Pero en el día a día, la realidad es otra:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.5rem', borderLeft: '2px solid rgba(0, 212, 170, 0.4)' }}>
                <p style={{ margin: 0 }}>La información vive en muchos lugares.</p>
                <p style={{ margin: 0 }}>Las decisiones viven en conversaciones.</p>
                <p style={{ margin: 0 }}>La ejecución vive en personas.</p>
              </div>
              <p style={{ margin: 0 }}>
                Entonces el equipo llena el hueco con lo de siempre:
                un Excel, un mensaje, un &ldquo;¿quién lo hace?&rdquo;, un &ldquo;recuérdame más tarde&rdquo;.
              </p>
              <p style={{ margin: 0, fontWeight: 600, color: '#111' }}>
                Funciona… hasta que deja de funcionar.<br />
                Porque cuando la empresa crece, lo manual no escala. Se multiplica.
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.25), transparent)' }} />
        </div>

        {/* Section 4 — Lo que creemos sobre operar bien */}
        <section style={{ padding: '5rem 0' }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 2rem' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 700, lineHeight: 1.15, margin: '0 0 3rem 0', color: '#111' }}>
              Lo que creemos sobre operar bien
            </h2>
            <div className="creemos-grid">
              {/* Card 1 */}
              <div style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', color: '#00D4AA', textTransform: 'uppercase' }}>/01</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', lineHeight: 1.3, margin: 0 }}>
                  La operación no debería depender de memoria humana
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, margin: 0 }}>
                  Si un proceso depende de que alguien se acuerde, no es un sistema. Es un riesgo.
                </p>
              </div>
              {/* Card 2 */}
              <div style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', color: '#00D4AA', textTransform: 'uppercase' }}>/02</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', lineHeight: 1.3, margin: 0 }}>
                  Convertir lo repetitivo en un sistema debería ser simple
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, margin: 0 }}>
                  Las empresas no necesitan más trabajo. Necesitan menos fricción. Menos pasos que &ldquo;alguien&rdquo; tiene que hacer.
                </p>
              </div>
              {/* Card 3 */}
              <div style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', color: '#00D4AA', textTransform: 'uppercase' }}>/03</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', lineHeight: 1.3, margin: 0 }}>
                  Todos deberían ver la misma realidad
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, margin: 0 }}>
                  Cuando cada área tiene su versión, el negocio se vuelve lento. La claridad no es un lujo: es velocidad.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.25), transparent)' }} />
        </div>

        {/* Section 5 — Dónde encaja JOIN.IA */}
        <section style={{ padding: '5rem 0' }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 2rem' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 700, lineHeight: 1.15, margin: '0 0 2rem 0', color: '#111' }}>
              Dónde encaja JOIN.IA
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1.05rem', color: 'rgba(0,0,0,0.6)', lineHeight: 1.8 }}>
              <p style={{ margin: 0 }}>
                JOIN.IA existe para llenar la capa que falta:
                la que convierte lo manual en un sistema que avanza.
              </p>
              <p style={{ margin: 0 }}>
                No estamos construyendo &ldquo;otra herramienta más&rdquo;.
                Estamos construyendo un producto para que la IA deje de ser un asistente aislado y se convierta en parte real de la operación.
              </p>
              <p style={{ margin: 0, fontWeight: 600, color: '#111' }}>
                En la práctica, esto se reduce a tres cosas:
              </p>
            </div>

            {/* 3 Pillars */}
            <div className="pillars-grid">
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', margin: '0 0 0.5rem 0' }}>Menos manual</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, margin: 0 }}>
                  Reducir tareas repetidas que hoy consumen tiempo, energía y foco.
                </p>
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', margin: '0 0 0.5rem 0' }}>Más ejecución</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, margin: 0 }}>
                  Que el trabajo avance con consistencia, sin depender de perseguir, recordar o rehacer.
                </p>
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', margin: '0 0 0.5rem 0' }}>Claridad compartida</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, margin: 0 }}>
                  Que el equipo opere con una sola realidad: qué pasa, qué sigue y qué importa.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.25), transparent)' }} />
        </div>

        {/* Section 6 — El futuro hacia el que estamos construyendo */}
        <section style={{ padding: '5rem 0' }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 2rem' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 700, lineHeight: 1.15, margin: '0 0 2rem 0', color: '#111' }}>
              El futuro hacia el que estamos construyendo
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1.05rem', color: 'rgba(0,0,0,0.6)', lineHeight: 1.8 }}>
              <p style={{ margin: 0 }}>
                Las empresas no van a dejar de crecer.
                Pero sí pueden dejar de crecer con caos.
              </p>
              <p style={{ margin: 0 }}>
                Los equipos hoy son más dinámicos: cambian prioridades, cambian roles, cambian ritmos.
                Y cuando todo depende de lo manual, cada cambio cuesta el doble.
              </p>
              <p style={{ margin: 0, fontWeight: 600, color: '#111' }}>
                JOIN.IA está pensado para estar justo en ese punto:<br />
                antes de que el trabajo se vuelva pesado.<br />
                antes de que el equipo se desgaste.<br />
                antes de que lo manual se vuelva normal.
              </p>
              <p style={{ margin: 0 }}>
                Con el tiempo, la IA no solo ayudará a ejecutar: ayudará a ver patrones, anticipar fricción y sugerir mejores formas de operar.
                Menos &ldquo;apagar incendios&rdquo;. Más construir.
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0, 212, 170, 0.25), transparent)' }} />
        </div>

        {/* Cierre / CTA */}
        <section style={{ padding: '5rem 0 7rem' }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1.1rem', color: 'rgba(0,0,0,0.6)', lineHeight: 1.8, marginBottom: '3rem' }}>
              <p style={{ margin: 0 }}>
                Imagina una operación que se siente ligera y predecible.
                Donde el equipo no vive reaccionando. Donde lo repetitivo no roba el día. Donde crecer no significa complicarlo todo.
              </p>
              <p style={{ margin: 0, fontWeight: 600, color: '#111' }}>
                Ese es el futuro que JOIN.IA quiere construir:<br />
                un lugar al que vuelves para que la empresa avance sin depender de lo manual.
              </p>
              <p style={{ margin: 0 }}>
                Si te suena familiar, queremos construirlo contigo.
              </p>
              TEAM JOIN.IA
            </div>
            <Link
              href="/login"
              style={{
                display: 'inline-block',
                padding: '0.85rem 2rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#fff',
                background: '#00D4AA',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.background = '#00B892'; (e.target as HTMLElement).style.transform = 'translateY(-2px)'; (e.target as HTMLElement).style.boxShadow = '0 4px 20px rgba(0, 212, 170, 0.25)'; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.background = '#00D4AA'; (e.target as HTMLElement).style.transform = 'translateY(0)'; (e.target as HTMLElement).style.boxShadow = 'none'; }}
            >
              Crear cuenta / Registrarme
            </Link>
            
          </div>
          
        </section>
      </main>


      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-logo">JOIN.IA</div>
          <p className="copyright">&copy; 2025 JOIN.IA. Todos los derechos reservados.</p>
        </div>
      </footer>

    </>
  );
}
