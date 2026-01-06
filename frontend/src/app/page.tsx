"use client";

import Link from 'next/link';
import WhatsappFloat from '@/components/WhatsappFloat';
import { Typewriter } from '@/components/ui/Typewriter';
import { FloatingPaths } from '@/components/ui/background-paths';
import { Header } from '@/components/ui/header-1';

export default function Home() {
  return (
    <>
      <Header />

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

        <section id="productos" className="section products-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Nuestros agentes de IA para tu operación diaria</h2>
              <p className="section-desc">Automatizamos el ciclo completo: atiendes solicitudes, facturas sin errores y cobras a tiempo, todo con agentes de IA conectados a tu negocio.</p>
            </div>

            <div className="grid">
              {/* Producto 1 */}
              <div className="card product-card">
                <div className="card-content">
                  <h3 className="card-title">Agente Community Manager con IA</h3>
                  <span className="product-tagline">Redes sociales sin fricción, con IA.</span>
                  <p className="card-text">Agente que crea, programa y gestiona publicaciones en redes sociales a partir del contexto de tu empresa. Analiza tu marca, productos y objetivos para generar contenido coherente, constante y optimizado para cada canal.</p>

                  <ul className="benefit-list">
                    <li className="benefit-item">
                      <svg className="benefit-icon" style={{ width: '20px', height: '20px', minWidth: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Crea publicaciones automáticamente (texto + ideas visuales).
                    </li>
                    <li className="benefit-item">
                      <svg className="benefit-icon" style={{ width: '20px', height: '20px', minWidth: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Mantiene consistencia de marca y tono.
                    </li>
                    <li className="benefit-item">
                      <svg className="benefit-icon" style={{ width: '20px', height: '20px', minWidth: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Reduce la carga operativa del equipo de marketing.
                    </li>
                  </ul>
                </div>

                <div className="ideal-for">
                  Ideal para: <strong>marketing, ventas, startups y pymes</strong>
                </div>
                <a href="#contacto" className="btn btn-secondary card-cta">Ver demo</a>
              </div>

              {/* Producto 2 */}
              <div className="card product-card">
                <div className="card-content">
                  <h3 className="card-title">Agente de Mesa de Ayuda</h3>
                  <span className="product-tagline">CHAT EN VIVO CON IA PARA ATENDER Y ORDENAR SOLICITUDES INTERNAS.</span>
                  <p className="card-text">Un chat inteligente donde tu equipo puede hacer solicitudes, resolver dudas y reportar problemas en tiempo real.La IA responde, clasifica y asigna cada caso automáticamente.</p>

                  <ul className="benefit-list">
                    <li className="benefit-item">
                      <svg className="benefit-icon" style={{ width: '20px', height: '20px', minWidth: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Chat en vivo con IA 24/7
                    </li>
                    <li className="benefit-item">
                      <svg className="benefit-icon" style={{ width: '20px', height: '20px', minWidth: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Resuelve solicitudes simples y escala a humanos cuando es necesario.
                    </li>
                    <li className="benefit-item">
                      <svg className="benefit-icon" style={{ width: '20px', height: '20px', minWidth: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Convierte conversaciones en casos con seguimiento y métricas.
                    </li>
                  </ul>
                </div>

                <div className="ideal-for">
                  Ideal para: <strong>soporte, operaciones, mantenimiento y áreas internas.</strong>
                </div>
                <a href="#contacto" className="btn btn-secondary card-cta">Ver demo</a>
              </div>

              {/* Producto 3 */}
              <div className="card product-card">
                <div className="card-content">
                  <h3 className="card-title">Consultoría en Automatización & IA Empresarial</h3>
                  <span className="product-tagline">Diseñamos la IA a la medida de tu operación.</span>
                  <p className="card-text">Servicio de consultoría estratégica donde analizamos tus procesos, detectamos cuellos de botella y diseñamos agentes y workflows de IA personalizados para tu empresa..</p>

                  <ul className="benefit-list">
                    <li className="benefit-item">
                      <svg className="benefit-icon" style={{ width: '20px', height: '20px', minWidth: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Diagnóstico de procesos y oportunidades de automatización.
                    </li>
                    <li className="benefit-item">
                      <svg className="benefit-icon" style={{ width: '20px', height: '20px', minWidth: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Diseño de agentes y workflows a medida.
                    </li>
                    <li className="benefit-item">
                      <svg className="benefit-icon" style={{ width: '20px', height: '20px', minWidth: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Implementación y acompañamiento estratégico.
                    </li>
                  </ul>
                </div>

                <div className="ideal-for">
                  Ideal para: <strong>gerencia, operaciones, finanzas y líderes de transformación digital.</strong>
                </div>
                <a href="#contacto" className="btn btn-secondary card-cta">Ver demo</a>
              </div>
            </div>

            <div className="products-final-cta">
              <h3>¿Quieres ver cómo estos agentes se adaptan a tu empresa?</h3>
              <a href="https://calendly.com/samuel-murillo-corte/30min" className="btn btn-primary" target="_blank" rel="noopener noreferrer">Agenda una llamada</a>
            </div>
          </div>
        </section>

        <section id="vision" className="section section-neutral">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Nuestra Visión</h2>
              <p className="section-desc">Un futuro donde la IA es el estándar operativo.</p>
            </div>
            <div className="content-block">
              <p>Que todas las empresas tengan un agente empresarial capaz de analizar información, automatizar tareas repetitivas, ejecutar procesos en tiempo real y convertir la IA en un estándar operativo accesible para todos.</p>
            </div>
          </div>
        </section>

        <section id="mision" className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Nuestra Misión</h2>
              <p className="section-desc">Integración sin fricción, ejecución total.</p>
            </div>
            <div className="content-block">
              <p>Permitir que las organizaciones integren IA sin fricción, generen workflows inteligentes a partir de texto o datos y operen desde un ecosistema centralizado que mejora la eficiencia en todas las áreas.</p>
            </div>
          </div>
        </section>

        <section id="valores" className="section section-alt">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Valores Fundamentales</h2>
            </div>
            <div className="grid values-grid">
              <div className="card">
                <h3 className="card-title">Innovación accesible</h3>
                <p className="card-text">Convertir procesos tradicionales en sistemas inteligentes sin necesidad de conocimientos técnicos.</p>
              </div>
              <div className="card">
                <h3 className="card-title">Reducción de tareas</h3>
                <p className="card-text">Automatizar actividades manuales para liberar tiempo operativo valioso.</p>
              </div>
              <div className="card">
                <h3 className="card-title">Decisiones con datos</h3>
                <p className="card-text">Conectar información real del negocio con acciones automáticas precisas.</p>
              </div>
              <div className="card">
                <h3 className="card-title">Efectividad operativa</h3>
                <p className="card-text">Mejorar cumplimiento, velocidad y rendimiento mediante automatización.</p>
              </div>
              <div className="card">
                <h3 className="card-title">Impacto tecnológico</h3>
                <p className="card-text">Transformar la operación empresarial integrando IA en todo su flujo.</p>
              </div>
              <div className="card">
                <h3 className="card-title">Soluciones de IA a la medida</h3>
                <p className="card-text">Desarrollar automatizaciones y agentes inteligentes adaptados a cada empresa.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="contacto" className="section">
          <div className="container contact-container">
            <h2 className="section-title">¿Listo para evolucionar?</h2>
            <p className="section-desc text-secondary">Convierte a tu empresa en una organización más rápida, eficiente e inteligente.</p>
            <a href="https://wa.me/573226430243?text=Hola%20quiero%20información" className="btn btn-primary" target="_blank" rel="noopener noreferrer">Contáctanos</a>
          </div>
        </section>
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
