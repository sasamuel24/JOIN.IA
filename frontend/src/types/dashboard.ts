export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  group: string;
  access_tier: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export interface Invitado {
  id: string;
  email: string;
  name?: string;
  status: 'pendiente' | 'unido' | 'expirado';
  invited_at: string;
}

export interface InvitacionesStats {
  invitados: number;
  unidos: number;
  disponibles: number;
  meta: number;
}

export interface FeedbackData {
  rol: string;
  desgastes: string[];
  impacto: number;
  solucion_actual: string;
  herramientas: string[];
  vision_ia: string;
  resultados_deseados: string[];
}

export interface ChangelogItem {
  version: string;
  date: string;
  title: string;
  description: string;
  image_url?: string;
  tags: string[];
}

export interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar_url?: string;
    role: string;
  };
  content: string;
  likes: number;
  comments: number;
  created_at: string;
}

export interface CommunityMember {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
  joined_at: string;
}

export interface OpenDebate {
  id: string;
  title: string;
  category: string;
  replies: number;
  participants: number;
  last_activity: string;
}
