'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ProfileHeader } from './ProfileHeader';
import { DashboardDivider } from '../shared/DashboardDivider';
import { DashboardFooter } from '../shared/DashboardFooter';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Chip } from '@/components/ui/chip';
import { Skeleton } from '@/components/ui/skeleton';

const TABS = ['Mi perfil', 'Configuraci\u00f3n', 'Early Access'] as const;
type Tab = (typeof TABS)[number];

const INDUSTRIAS = [
  'Servicios B2B',
  'Tecnolog\u00eda',
  'Manufactura',
  'Retail',
  'Salud',
  'Educaci\u00f3n',
  'Finanzas',
  'Log\u00edstica',
  'Otro',
];

const TAMA\u00d1OS = ['1\u20135 personas', '6\u201320 personas', '21\u201350 personas', '51\u2013200 personas', '200+'];

const PAISES = [
  'Colombia',
  'M\u00e9xico',
  'Argentina',
  'Chile',
  'Per\u00fa',
  'Espa\u00f1a',
  'Estados Unidos',
  'Otro',
];

const DOLORES = [
  'Tareas repetitivas',
  'Coordinaci\u00f3n de equipo',
  'Encontrar informaci\u00f3n',
  'Reportes lentos',
  'Sobrecarga de mensajes',
  'Tomar decisiones sin datos',
  'Delegar sin perder control',
  'Procesos no documentados',
];

export function PerfilDashboard() {
  const { user, loading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<Tab>('Mi perfil');

  // Editable fields state
  const nameParts = (user?.name || 'Usuario').split(' ');
  const [firstName, setFirstName] = useState(nameParts[0] || '');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');

  // Company fields
  const [company, setCompany] = useState('');
  const [industria, setIndustria] = useState('Servicios B2B');
  const [teamSize, setTeamSize] = useState('6\u201320 personas');
  const [pais, setPais] = useState('Colombia');

  // Pain points
  const [selectedDolores, setSelectedDolores] = useState<string[]>([]);

  // Notification toggles
  const [notifProduct, setNotifProduct] = useState(true);
  const [notifCommunity, setNotifCommunity] = useState(false);
  const [notifFeedback, setNotifFeedback] = useState(true);

  const toggleDolor = (d: string) => {
    setSelectedDolores(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4 sm:p-8 lg:p-12 min-h-[60vh]">
        <Skeleton className="w-full h-[180px] rounded-none" />
        <div className="flex gap-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="w-full h-[200px]" />
        <Skeleton className="w-full h-[180px]" />
      </div>
    );
  }

  const fallbackUser = user ?? {
    id: '',
    name: `${firstName} ${lastName}`.trim() || 'Usuario',
    email: email,
    role: 'user' as const,
    group: 'Validaci\u00f3n inicial',
    access_tier: 'Early Access',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen flex flex-col"
    >
      {/* Card container */}
      <div className="flex-1 overflow-hidden bg-surface-0">
        <ProfileHeader user={fallbackUser} />

        {/* Tabs */}
        <div className="flex border-b border-border px-4 sm:px-8 lg:px-12" role="tablist" aria-label="Secciones de perfil">
          {TABS.map(tab => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-5 py-3 text-[0.85rem] font-[family-name:var(--font-main)] bg-transparent border-none cursor-pointer',
                'transition-colors duration-150 -mb-px border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                activeTab === tab
                  ? 'font-semibold text-text-main border-b-text-main'
                  : 'font-normal text-text-secondary border-b-transparent hover:text-text-main'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-4 sm:p-8 lg:px-12 lg:py-8">
          {activeTab === 'Mi perfil' && (
            <div className="flex flex-col gap-8">
              {/* Personal Info Section */}
              <SectionCard
                title="Informaci\u00f3n personal"
                subtitle="As\u00ed te ver\u00e1n los dem\u00e1s miembros"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldGroup label="Nombre">
                    <Input
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="Tu nombre"
                    />
                  </FieldGroup>
                  <FieldGroup label="Apellido">
                    <Input
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="Tu apellido"
                    />
                  </FieldGroup>
                  <FieldGroup label="Correo electr\u00f3nico">
                    <Input
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                    />
                  </FieldGroup>
                  <FieldGroup label="Tel\u00e9fono">
                    <Input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+57 300 000 0000"
                    />
                  </FieldGroup>
                </div>
                <div className="mt-4">
                  <FieldGroup label="T\u00edtulo / Descripci\u00f3n">
                    <Input
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="CEO & Fundador"
                    />
                  </FieldGroup>
                  <p className="text-[0.72rem] text-text-secondary mt-1.5">
                    Aparece debajo de tu nombre en la comunidad y en el sidebar.
                  </p>
                </div>
                <div className="mt-4">
                  <FieldGroup label="Sobre m\u00ed">
                    <Textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="Describe qui\u00e9n eres, a qu\u00e9 te dedicas y qu\u00e9 esperas de JOIN.IA..."
                    />
                  </FieldGroup>
                </div>
                <SectionFooter hint="Los cambios se guardan autom\u00e1ticamente" />
              </SectionCard>

              {/* Company Section */}
              <SectionCard
                title="Tu empresa"
                subtitle="Contexto para personalizar JOIN.IA a tu negocio"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldGroup label="Nombre de la empresa">
                    <Input
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      placeholder="Mi Empresa SAS"
                    />
                  </FieldGroup>
                  <FieldGroup label="Industria">
                    <Select value={industria} onChange={e => setIndustria(e.target.value)}>
                      {INDUSTRIAS.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </Select>
                  </FieldGroup>
                  <FieldGroup label="Tama\u00f1o del equipo">
                    <Select value={teamSize} onChange={e => setTeamSize(e.target.value)}>
                      {TAMA\u00d1OS.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </Select>
                  </FieldGroup>
                  <FieldGroup label="Pa\u00eds">
                    <Select value={pais} onChange={e => setPais(e.target.value)}>
                      {PAISES.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </Select>
                  </FieldGroup>
                </div>
                <SectionFooter hint="Esta info ayuda a JOIN.IA a personalizarse para ti" />
              </SectionCard>

              {/* Pain points Section */}
              <SectionCard
                title="Tus dolores principales"
                subtitle="Selecciona los que m\u00e1s te afectan hoy"
              >
                <div className="flex flex-wrap gap-2">
                  {DOLORES.map(d => (
                    <Chip
                      key={d}
                      label={d}
                      selected={selectedDolores.includes(d)}
                      onToggle={() => toggleDolor(d)}
                    />
                  ))}
                </div>
                <SectionFooter hint="Puedes cambiar tu selecci\u00f3n en cualquier momento" />
              </SectionCard>
            </div>
          )}

          {activeTab === 'Configuraci\u00f3n' && (
            <div className="flex flex-col gap-8">
              <SectionCard title="Notificaciones" subtitle="Controla c\u00f3mo te contactamos">
                <div className="flex flex-col gap-3">
                  <ToggleRow
                    label="Actualizaciones del producto"
                    checked={notifProduct}
                    onCheckedChange={setNotifProduct}
                  />
                  <ToggleRow
                    label="Nuevos miembros en la comunidad"
                    checked={notifCommunity}
                    onCheckedChange={setNotifCommunity}
                  />
                  <ToggleRow
                    label="Recordatorios de feedback"
                    checked={notifFeedback}
                    onCheckedChange={setNotifFeedback}
                  />
                </div>
              </SectionCard>

              <SectionCard title="Sesi\u00f3n" subtitle="Gestiona tu acceso">
                <button
                  onClick={() => {
                    localStorage.removeItem('access_token');
                    window.location.href = '/login';
                  }}
                  className={cn(
                    'px-5 py-2 rounded-md border border-error bg-transparent text-error',
                    'text-[0.85rem] font-medium font-[family-name:var(--font-main)] cursor-pointer',
                    'transition-colors duration-150 hover:bg-error/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2'
                  )}
                >
                  Cerrar sesi\u00f3n
                </button>
              </SectionCard>
            </div>
          )}

          {activeTab === 'Early Access' && (
            <div className="flex flex-col gap-8">
              <SectionCard title="Tu acceso" subtitle="Detalles de tu membres\u00eda Early Access">
                <div className="flex flex-col gap-3">
                  <InfoRow label="Plan" value="Early Access" accent />
                  <InfoRow label="Grupo" value={fallbackUser.group} />
                  <InfoRow label="Rol" value={fallbackUser.role === 'admin' ? 'Administrador' : 'Usuario'} />
                </div>
              </SectionCard>

              <SectionCard title="Beneficios incluidos" subtitle="Lo que obtienes como Early Adopter">
                <div className="flex flex-col gap-2.5">
                  {[
                    'Acceso anticipado a todas las funcionalidades',
                    'Canal directo con el equipo fundador',
                    'Influencia en el roadmap del producto',
                    'Descuento permanente en planes futuros',
                    'Badge exclusivo en la comunidad',
                  ].map((b, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 text-sm text-text-main"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      {b}
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-12">
        <DashboardDivider className="my-7" />
        <DashboardFooter />
      </div>
    </motion.div>
  );
}

/* -- Reusable sub-components ---------------------------------------- */

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card variant="outline">
      <div className="mb-5">
        <h3 className="text-[0.95rem] font-bold text-text-main mb-0.5">
          {title}
        </h3>
        <p className="text-[0.78rem] text-text-secondary">{subtitle}</p>
      </div>
      {children}
    </Card>
  );
}

function SectionFooter({ hint }: { hint: string }) {
  return (
    <div className="flex justify-between items-center mt-5 pt-4 border-t border-border">
      <span className="text-xs text-text-secondary">{hint}</span>
      <button
        className={cn(
          'px-4 py-2 rounded-md border-none bg-text-main text-white',
          'text-[0.82rem] font-semibold font-[family-name:var(--font-main)] cursor-pointer',
          'transition-opacity duration-150 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2'
        )}
      >
        Guardar cambios
      </button>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[0.7rem] font-semibold text-text-secondary uppercase tracking-wide mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-text-main">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function InfoRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-3.5 py-2.5 border border-border rounded-lg">
      <span className="text-[0.82rem] font-semibold text-text-secondary uppercase tracking-wide">
        {label}
      </span>
      <span
        className={cn(
          'text-[0.85rem] font-semibold',
          accent ? 'text-accent-text' : 'text-text-main'
        )}
      >
        {value}
      </span>
    </div>
  );
}
