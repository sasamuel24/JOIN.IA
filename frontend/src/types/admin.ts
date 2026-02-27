// ─── Admin Panel Types — JOIN.IA ───────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  group: string;
  access_tier: string;
  created_at: string;
  feedback_completed: boolean;
  invitations_sent: number;
  status: 'activo' | 'inactivo';
}

export interface AdminFeedbackEntry {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  rol: string;
  desgastes: string[];
  impacto: number;
  solucion_actual: string;
  herramientas: string[];
  vision_ia: string;
  resultados_deseados: string[];
  created_at: string;
}

export interface AdminInvitacion {
  id: string;
  inviter_id: string;
  inviter_name: string;
  inviter_email: string;
  invited_email: string;
  invited_name?: string;
  status: 'pendiente' | 'unido' | 'expirado';
  invited_at: string;
  joined_at?: string;
}

export interface AdminUsersStats {
  total: number;
  activos: number;
  nuevos_semana: number;
  con_feedback: number;
  por_grupo: { grupo: string; count: number }[];
  por_tier: { tier: string; count: number }[];
}

export interface AdminFeedbackStats {
  total: number;
  promedio_impacto: number;
  top_desgastes: { label: string; count: number }[];
  top_herramientas: { label: string; count: number }[];
  por_rol: { rol: string; count: number }[];
  top_resultados: { label: string; count: number }[];
}

export interface AdminInvitacionesStats {
  total_enviadas: number;
  pendientes: number;
  unidas: number;
  expiradas: number;
  conversion_rate: number;
  top_inviters: { name: string; email: string; count: number; converted: number }[];
}
