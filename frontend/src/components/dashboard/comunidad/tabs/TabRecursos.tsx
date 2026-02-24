import { FileText, Video, Link as LinkIcon, BookOpen } from 'lucide-react';

const MOCK_RECURSOS = [
  {
    id: '1',
    title: 'Guia: Como reducir reuniones innecesarias',
    description: 'Estrategias practicas para equipos que quieren recuperar tiempo.',
    type: 'guide' as const,
  },
  {
    id: '2',
    title: 'Template: Tablero de seguimiento semanal',
    description: 'Una plantilla para centralizar tareas sin complicaciones.',
    type: 'template' as const,
  },
  {
    id: '3',
    title: 'Video: Por que estamos construyendo JOIN.IA',
    description: 'El equipo fundador explica la vision y el problema que resolvemos.',
    type: 'video' as const,
  },
  {
    id: '4',
    title: 'Articulo: La friccion operativa invisible',
    description: 'Como las micro-ineficiencias destruyen la productividad sin que lo notes.',
    type: 'article' as const,
  },
];

const TYPE_ICONS = {
  guide: BookOpen,
  template: FileText,
  video: Video,
  article: LinkIcon,
};

const TYPE_LABELS = {
  guide: 'Guia',
  template: 'Template',
  video: 'Video',
  article: 'Articulo',
};

export function TabRecursos() {
  return (
    <div>
      <p className="text-[0.85rem] text-secondary mb-4">
        Recursos para la comunidad
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
        {MOCK_RECURSOS.map(recurso => {
          const Icon = TYPE_ICONS[recurso.type];
          return (
            <div
              key={recurso.id}
              className="border border-border rounded-[10px] p-5 cursor-pointer transition-all duration-150 hover:border-accent-glow hover:shadow-accent"
            >
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center">
                  <Icon size={16} />
                </div>
                <span className="text-[0.7rem] font-semibold text-accent-text uppercase tracking-wide">
                  {TYPE_LABELS[recurso.type]}
                </span>
              </div>
              <h4 className="text-[0.92rem] font-semibold text-main leading-snug mb-1">
                {recurso.title}
              </h4>
              <p className="text-[0.82rem] text-secondary leading-normal">
                {recurso.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
