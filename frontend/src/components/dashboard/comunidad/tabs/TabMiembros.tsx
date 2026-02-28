import { Avatar } from '@/components/ui/avatar';

const MOCK_MIEMBROS = [
  { id: '1', name: 'Maria Camila', role: 'Fundadora', joined: 'Ene 2026' },
  { id: '2', name: 'Javier P.', role: 'Dir. Operaciones', joined: 'Ene 2026' },
  { id: '3', name: 'Ana Torres', role: 'CTO', joined: 'Feb 2026' },
  { id: '4', name: 'Carlos Ruiz', role: 'Marketing Lead', joined: 'Feb 2026' },
  { id: '5', name: 'Laura Mendez', role: 'Consultora', joined: 'Feb 2026' },
  { id: '6', name: 'Diego Salazar', role: 'CEO', joined: 'Ene 2026' },
  { id: '7', name: 'Valentina Rojas', role: 'RRHH', joined: 'Feb 2026' },
  { id: '8', name: 'Andres Lopez', role: 'Ventas', joined: 'Feb 2026' },
];

export function TabMiembros() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
      {MOCK_MIEMBROS.map(m => (
        <div
          key={m.id}
          className="border border-border rounded-[10px] p-4 flex flex-col items-center text-center transition-all duration-150 cursor-default hover:border-accent-glow hover:shadow-accent"
        >
          <div className="mb-2.5">
            <Avatar name={m.name} size="md" />
          </div>
          <div className="text-[0.9rem] font-semibold text-main">
            {m.name}
          </div>
          <div className="text-[0.78rem] text-secondary mt-0.5">
            {m.role}
          </div>
          <div className="text-[0.7rem] text-secondary mt-1">
            Desde {m.joined}
          </div>
        </div>
      ))}
    </div>
  );
}
