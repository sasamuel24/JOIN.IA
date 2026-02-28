const TESTIMONIOS = [
  { quote: '"Paso más tiempo buscando info que haciendo cosas con esa info."', author: 'Fundador, empresa de 30 personas' },
  { quote: '"Mi equipo es bueno, pero la coordinación nos mata la productividad."', author: 'Directora de Operaciones' },
];

export function FeedbackSidePanel() {
  return (
    <div className="bg-surface-1 rounded-xl p-6 flex flex-col gap-5 h-full">
      <h3 className="text-base font-bold text-text-main">Comunidad Early Access</h3>

      {/* Stats */}
      <div>
        <p className="text-[0.72rem] font-semibold text-text-secondary uppercase tracking-wider mb-2">
          Lo que más duele
        </p>
        {[
          { label: 'Tareas repetitivas', pct: 72 },
          { label: 'Coordinación', pct: 61 },
          { label: 'Reportes lentos', pct: 54 },
          { label: 'Decisiones sin datos', pct: 48 },
        ].map(item => (
          <div key={item.label} className="flex justify-between text-[0.8rem] text-text-secondary mb-1">
            <span>{item.label}</span>
            <span className="font-semibold">{item.pct}%</span>
          </div>
        ))}
      </div>

      {/* Testimonios */}
      <div>
        <h4 className="text-sm font-bold text-text-main mb-2">Lo que dicen</h4>
        {TESTIMONIOS.map((t, i) => (
          <div key={i} className="bg-surface-0 border border-border rounded-lg p-3 mb-2">
            <p className="text-[0.82rem] italic text-text-main leading-relaxed mb-1">{t.quote}</p>
            <p className="text-[0.72rem] text-text-secondary">— {t.author}</p>
          </div>
        ))}
      </div>

      {/* Counter */}
      <div className="border-t border-border pt-4 text-center">
        <p className="text-[0.72rem] font-semibold text-text-secondary uppercase tracking-wider mb-1">
          Feedbacks recibidos
        </p>
        <p className="text-2xl font-bold text-text-main">147</p>
        <p className="text-xs text-text-secondary">de usuarios en Early Access</p>
      </div>
    </div>
  );
}
