import { MessageSquare, Users } from 'lucide-react';

const MOCK_DEBATES = [
  {
    id: '1',
    title: 'Como manejan el seguimiento de tareas sin un sistema centralizado?',
    category: 'Operaciones',
    replies: 14,
    participants: 8,
    lastActivity: 'Hace 2h',
  },
  {
    id: '2',
    title: 'Herramientas que realmente funcionan para equipos remotos pequenos',
    category: 'Herramientas',
    replies: 21,
    participants: 12,
    lastActivity: 'Hace 5h',
  },
  {
    id: '3',
    title: 'Cuanto tiempo pierden en reuniones de sincronizacion por semana?',
    category: 'Productividad',
    replies: 9,
    participants: 6,
    lastActivity: 'Hace 1d',
  },
  {
    id: '4',
    title: 'El problema no es la herramienta, es el proceso -- opiniones?',
    category: 'General',
    replies: 31,
    participants: 15,
    lastActivity: 'Hace 1d',
  },
  {
    id: '5',
    title: 'Automatizacion que les ha ahorrado mas de 5 horas a la semana',
    category: 'Automatizacion',
    replies: 7,
    participants: 5,
    lastActivity: 'Hace 3d',
  },
];

export function TabDebates() {
  return (
    <div>
      <p className="text-[0.85rem] text-secondary mb-4">
        {MOCK_DEBATES.length} debates activos
      </p>

      <div className="flex flex-col gap-2">
        {MOCK_DEBATES.map(debate => (
          <div
            key={debate.id}
            className="border border-border rounded-[10px] px-5 py-4 cursor-pointer transition-colors duration-150 hover:border-accent-glow hover:bg-surface-1"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[0.68rem] font-semibold text-accent bg-accent-light px-2 py-0.5 rounded-full">
                    {debate.category}
                  </span>
                  <span className="text-[0.72rem] text-secondary">
                    {debate.lastActivity}
                  </span>
                </div>
                <p className="text-[0.92rem] font-semibold text-main leading-snug">
                  {debate.title}
                </p>
              </div>

              <div className="flex gap-3 shrink-0 items-center">
                <span className="flex items-center gap-1 text-[0.78rem] text-secondary">
                  <MessageSquare size={13} />
                  {debate.replies}
                </span>
                <span className="flex items-center gap-1 text-[0.78rem] text-secondary">
                  <Users size={13} />
                  {debate.participants}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
