export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  role?: 'user' | 'admin';
  group?: string;
  access_tier?: string;
  avatar_url?: string;
}

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
  rolOtherText: string;
  desgastes: string[];
  desgastesOtherText: string;
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

export interface CommunityComment {
  id: string;
  author: {
    name: string;
    role: string;
    avatar_url?: string;
  };
  content: string;
  created_at: string;
  time: string;
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

export interface CommunityDebate {
  id: string;
  slug: string;
  title: string;
  category: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatar_url?: string;
  };
  replies_count: number;
  participants_count: number;
  created_at: string;
  last_activity_at: string;
  lastActivity: string;
}

export interface DebateReply {
  id: string;
  author: {
    name: string;
    role: string;
    avatar_url?: string;
  };
  content: string;
  created_at: string;
  time: string;
}

export interface CommunityResource {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: 'guide' | 'template' | 'video' | 'article' | 'tool';
  category: string | null;
  thumbnail_url: string | null;
  resource_url: string | null;
  author_name: string | null;
  is_featured: boolean;
  published_at: string | null;
}
