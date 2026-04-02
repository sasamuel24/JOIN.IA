'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getMe, patchMe, uploadAvatar } from '@/services/userService';
import type { UserProfileResponse, UserProfileUpdate } from '@/services/userService';
import { ProfileHeader } from './ProfileHeader';
import { DashboardDivider } from '../shared/DashboardDivider';
import { DashboardFooter } from '../shared/DashboardFooter';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AITextarea } from '@/components/ui/AITextarea';
import { AIInput } from '@/components/ui/AIInput';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Chip } from '@/components/ui/chip';
import { Skeleton } from '@/components/ui/skeleton';

const TABS = ['Mi perfil', 'Configuración', 'Early Access'] as const;
type Tab = (typeof TABS)[number];

const INDUSTRIAS = [
  'Servicios B2B',
  'Tecnología',
  'Manufactura',
  'Retail',
  'Salud',
  'Educación',
  'Finanzas',
  'Logística',
  'Otro',
];

const TAMAÑOS = ['1–5 personas', '6–20 personas', '21–50 personas', '51–200 personas', '200+'];

const PAISES = [
  'Colombia',
  'México',
  'Argentina',
  'Chile',
  'Perú',
  'España',
  'Estados Unidos',
  'Otro',
];

const DOLORES = [
  'Tareas repetitivas',
  'Coordinación de equipo',
  'Encontrar información',
  'Reportes lentos',
  'Sobrecarga de mensajes',
  'Tomar decisiones sin datos',
  'Delegar sin perder control',
  'Procesos no documentados',
];

/** Subset of profile used for PATCH (snake_case). */
type ProfilePayload = Pick<
  UserProfileResponse,
  | 'first_name'
  | 'last_name'
  | 'phone'
  | 'title'
  | 'bio'
  | 'company'
  | 'industry'
  | 'team_size'
  | 'country'
  | 'pain_points'
  | 'notif_product'
  | 'notif_community'
  | 'notif_feedback'
>;

function diffProfilePayload(
  original: ProfilePayload | null,
  current: ProfilePayload
): Partial<UserProfileUpdate> {
  const patch: Partial<UserProfileUpdate> = {};
  const keys: (keyof ProfilePayload)[] = [
    'first_name',
    'last_name',
    'phone',
    'title',
    'bio',
    'company',
    'industry',
    'team_size',
    'country',
    'pain_points',
    'notif_product',
    'notif_community',
    'notif_feedback',
  ];
  for (const key of keys) {
    const origVal = original?.[key];
    const curVal = current[key];
    if (key === 'pain_points') {
      const origArr = (origVal ?? null) as string[] | null;
      const curArr = (curVal ?? null) as string[] | null;
      const same =
        (origArr == null && curArr == null) ||
        (Array.isArray(origArr) &&
          Array.isArray(curArr) &&
          origArr.length === curArr.length &&
          origArr.every((v, i) => v === curArr[i]));
      if (!same) patch.pain_points = curArr;
      continue;
    }
    if (typeof curVal === 'string') {
      const origEmpty = origVal == null || origVal === '';
      const curEmpty = curVal === '';
      if (origEmpty && curEmpty) continue;
      if (origVal !== curVal) (patch as Record<string, unknown>)[key] = curVal;
      continue;
    }
    if (typeof curVal === 'boolean') {
      if (origVal !== curVal) (patch as Record<string, unknown>)[key] = curVal;
      continue;
    }
    if (origVal !== curVal) (patch as Record<string, unknown>)[key] = curVal;
  }
  return patch;
}

function syncStateFromApi(
  api: UserProfileResponse,
  setters: {
    setFirstName: (v: string) => void;
    setLastName: (v: string) => void;
    setEmail: (v: string) => void;
    setPhone: (v: string) => void;
    setTitle: (v: string) => void;
    setBio: (v: string) => void;
    setCompany: (v: string) => void;
    setIndustria: (v: string) => void;
    setTeamSize: (v: string) => void;
    setPais: (v: string) => void;
    setSelectedDolores: (v: string[]) => void;
    setNotifProduct: (v: boolean) => void;
    setNotifCommunity: (v: boolean) => void;
    setNotifFeedback: (v: boolean) => void;
  }
) {
  const first = api.first_name ?? (api.full_name ? api.full_name.trim().split(/\s+/)[0] ?? '' : '');
  const last = api.last_name ?? (api.full_name ? api.full_name.trim().split(/\s+/).slice(1).join(' ') ?? '' : '');
  setters.setFirstName(first);
  setters.setLastName(last);
  setters.setEmail(api.email ?? '');
  setters.setPhone(api.phone ?? '');
  setters.setTitle(api.title ?? '');
  setters.setBio(api.bio ?? '');
  setters.setCompany(api.company ?? '');
  setters.setIndustria(api.industry ?? 'Servicios B2B');
  setters.setTeamSize(api.team_size ?? '6–20 personas');
  setters.setPais(api.country ?? 'Colombia');
  setters.setSelectedDolores(api.pain_points ?? []);
  setters.setNotifProduct(api.notif_product ?? true);
  setters.setNotifCommunity(api.notif_community ?? false);
  setters.setNotifFeedback(api.notif_feedback ?? true);
}

export function PerfilDashboard() {
  const { user, loading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<Tab>('Mi perfil');
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [initialApiProfile, setInitialApiProfile] = useState<UserProfileResponse | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

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
  const [teamSize, setTeamSize] = useState('6–20 personas');
  const [pais, setPais] = useState('Colombia');

  // Pain points
  const [selectedDolores, setSelectedDolores] = useState<string[]>([]);

  // Notification toggles
  const [notifProduct, setNotifProduct] = useState(true);
  const [notifCommunity, setNotifCommunity] = useState(false);
  const [notifFeedback, setNotifFeedback] = useState(true);

  useEffect(() => {
    if (loading) return;
    getMe()
      .then(api => {
        setInitialApiProfile(api);
        if (api.avatar_url) setAvatarUrl(api.avatar_url);
        syncStateFromApi(api, {
          setFirstName,
          setLastName,
          setEmail,
          setPhone,
          setTitle,
          setBio,
          setCompany,
          setIndustria,
          setTeamSize,
          setPais,
          setSelectedDolores,
          setNotifProduct,
          setNotifCommunity,
          setNotifFeedback,
        });
      })
      .catch((err) => {
        setApiError(err instanceof Error ? err.message : String(err));
      });
  }, [loading]);

  const handleAvatarChange = useCallback(async (file: File) => {
    setAvatarUploading(true);
    setApiError(null);
    try {
      const { avatar_url } = await uploadAvatar(file);
      setAvatarUrl(avatar_url);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setAvatarUploading(false);
    }
  }, []);

  const buildApiPayloadFromState = useCallback((): ProfilePayload => ({
    first_name: firstName.trim() || null,
    last_name: lastName.trim() || null,
    phone: phone.trim() || null,
    title: title.trim() || null,
    bio: bio.trim() || null,
    company: company.trim() || null,
    industry: industria || null,
    team_size: teamSize || null,
    country: pais || null,
    pain_points: selectedDolores.length ? selectedDolores : null,
    notif_product: notifProduct,
    notif_community: notifCommunity,
    notif_feedback: notifFeedback,
  }), [
    firstName,
    lastName,
    phone,
    title,
    bio,
    company,
    industria,
    teamSize,
    pais,
    selectedDolores,
    notifProduct,
    notifCommunity,
    notifFeedback,
  ]);

  const onSave = useCallback(async () => {
    setSaving(true);
    setApiError(null);
    const currentPayload = buildApiPayloadFromState();
    const original = initialApiProfile
      ? ({
          first_name: initialApiProfile.first_name ?? null,
          last_name: initialApiProfile.last_name ?? null,
          phone: initialApiProfile.phone ?? null,
          title: initialApiProfile.title ?? null,
          bio: initialApiProfile.bio ?? null,
          company: initialApiProfile.company ?? null,
          industry: initialApiProfile.industry ?? null,
          team_size: initialApiProfile.team_size ?? null,
          country: initialApiProfile.country ?? null,
          pain_points: initialApiProfile.pain_points ?? null,
          notif_product: initialApiProfile.notif_product ?? null,
          notif_community: initialApiProfile.notif_community ?? null,
          notif_feedback: initialApiProfile.notif_feedback ?? null,
        } as ProfilePayload)
      : null;
    const patch = diffProfilePayload(original, currentPayload);
    if (Object.keys(patch).length === 0) {
      setSaving(false);
      return;
    }
    try {
      const updated = await patchMe(patch as UserProfileUpdate);
      setInitialApiProfile(updated);
      syncStateFromApi(updated, {
        setFirstName,
        setLastName,
        setEmail,
        setPhone,
        setTitle,
        setBio,
        setCompany,
        setIndustria,
        setTeamSize,
        setPais,
        setSelectedDolores,
        setNotifProduct,
        setNotifCommunity,
        setNotifFeedback,
      });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }, [
    buildApiPayloadFromState,
    initialApiProfile,
    setFirstName,
    setLastName,
    setEmail,
    setPhone,
    setTitle,
    setBio,
    setCompany,
    setIndustria,
    setTeamSize,
    setPais,
    setSelectedDolores,
    setNotifProduct,
    setNotifCommunity,
    setNotifFeedback,
  ]);

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
  const displayName =
  (initialApiProfile?.full_name?.trim() ||
    `${firstName} ${lastName}`.trim() ||
    user?.name ||
    'Usuario');

  const fallbackUser = {
    ...(user ?? {
      id: initialApiProfile?.id ?? '',
      name: displayName,
      email: initialApiProfile?.email ?? email,
      role: 'user' as const,
      group: initialApiProfile?.group ?? 'Validación inicial',
      access_tier: initialApiProfile?.access_tier ?? 'Early Access',
    }),
    avatar_url: avatarUrl ?? user?.avatar_url ?? undefined,
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
        <ProfileHeader
          user={fallbackUser}
          title={initialApiProfile?.title ?? title}
          country={initialApiProfile?.country ?? pais}
          onAvatarChange={handleAvatarChange}
          uploading={avatarUploading}
        />

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
              {apiError && (
                <div
                  role="alert"
                  className="rounded-md border border-error bg-error/5 px-4 py-3 text-sm text-error"
                >
                  {apiError}
                </div>
              )}
              {/* Personal Info Section */}
              <SectionCard
                title="Información personal"
                subtitle="Así te verán los demás miembros"
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
                  <FieldGroup label="Correo electrónico">
                    <Input
                      value={email}
                      disabled
                      readOnly
                      placeholder="correo@ejemplo.com"
                    />
                  </FieldGroup>
                  <FieldGroup label="Teléfono">
                    <Input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+57 300 000 0000"
                    />
                  </FieldGroup>
                </div>
                <div className="mt-4">
                  <FieldGroup label="Título / Descripción">
                    <AIInput
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      onAIResult={text => setTitle(text)}
                      placeholder="CEO & Fundador"
                      className="flex h-10 w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-main font-[family-name:var(--font-main)] placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </FieldGroup>
                  <p className="text-[0.72rem] text-text-secondary mt-1.5">
                    Aparece debajo de tu nombre en la comunidad y en el sidebar.
                  </p>
                </div>
                <div className="mt-4">
                  <FieldGroup label="Sobre mí">
                    <AITextarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      onAIResult={text => setBio(text)}
                      placeholder="Describe quién eres, a qué te dedicas y qué esperas de JOIN.IA..."
                      className="flex w-full min-h-[90px] rounded-md border border-border bg-surface-0 px-3.5 py-2.5 text-sm text-text-main font-[family-name:var(--font-main)] placeholder:text-text-muted resize-y focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                    />
                  </FieldGroup>
                </div>
                <SectionFooter
                  hint="Los cambios se guardan automáticamente"
                  onSave={onSave}
                  saving={saving}
                  disabled={saving}
                />
              </SectionCard>

              {/* Company Section */}
              <SectionCard
                title="Tu empresa"
                subtitle="Contexto para personalizar JOIN.IA a tu negocio"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldGroup label="Nombre de la empresa">
                    <AIInput
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      onAIResult={text => setCompany(text)}
                      placeholder="Mi Empresa SAS"
                      className="flex h-10 w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-main font-[family-name:var(--font-main)] placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </FieldGroup>
                  <FieldGroup label="Industria">
                    <Select value={industria} onChange={e => setIndustria(e.target.value)}>
                      {INDUSTRIAS.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </Select>
                  </FieldGroup>
                  <FieldGroup label="Tamaño del equipo">
                    <Select value={teamSize} onChange={e => setTeamSize(e.target.value)}>
                      {TAMAÑOS.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </Select>
                  </FieldGroup>
                  <FieldGroup label="País">
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
                subtitle="Selecciona los que más te afectan hoy"
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
                <SectionFooter
                  hint="Puedes cambiar tu selección en cualquier momento"
                  onSave={onSave}
                  saving={saving}
                  disabled={saving}
                />
              </SectionCard>
            </div>
          )}

          {activeTab === 'Configuración' && (
            <div className="flex flex-col gap-8">
              <SectionCard title="Notificaciones" subtitle="Controla cómo te contactamos">
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

              <SectionCard title="Sesión" subtitle="Gestiona tu acceso">
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
                  Cerrar sesión
                </button>
              </SectionCard>
            </div>
          )}

          {activeTab === 'Early Access' && (
            <div className="flex flex-col gap-8">
              <SectionCard title="Tu acceso" subtitle="Detalles de tu membresía Early Access">
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

function SectionFooter({
  hint,
  onSave,
  saving = false,
  disabled = false,
}: {
  hint: string;
  onSave?: () => void;
  saving?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-between items-center mt-5 pt-4 border-t border-border">
      <span className="text-xs text-text-secondary">{hint}</span>
      <button
        type="button"
        onClick={onSave}
        disabled={disabled || saving}
        className={cn(
          'px-4 py-2 rounded-md border-none bg-text-main text-white',
          'text-[0.82rem] font-semibold font-[family-name:var(--font-main)] cursor-pointer',
          'transition-opacity duration-150 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
          (disabled || saving) && 'opacity-70 cursor-not-allowed'
        )}
      >
        {saving ? 'Guardando…' : 'Guardar cambios'}
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
