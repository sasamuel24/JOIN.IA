/**
 * Community API service.
 * Handles GET /api/v1/community/stats and GET /api/v1/community/members.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

function authHeaders(): Record<string, string> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('access_token') ??
        localStorage.getItem('token') ??
        localStorage.getItem('authToken')
      : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

// ---------------------------------------------------------------------------
// Types (match backend responses)
// ---------------------------------------------------------------------------

export interface CommunityStatsResponse {
  miembros: number;
  posts: number;
  activosAhora: number;
}

export interface CommunityMemberResponse {
  id: string;
  name: string;
  role: string | null;
  avatar_url: string | null;
  joined_at: string;
}

export interface CommunityMembersResponse {
  members: CommunityMemberResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CommunityMembersParams {
  search?: string;
  page?: number;
  page_size?: number;
}

export interface CommunityResourceResponse {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  category: string | null;
  thumbnail_url: string | null;
  resource_url: string | null;
  author_name: string | null;
  is_featured: boolean;
  published_at: string | null;
}

export interface CommunityResourcesResponse {
  resources: CommunityResourceResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CommunityResourcesParams {
  search?: string;
  type?: string;
  category?: string;
  page?: number;
  page_size?: number;
}

// ---------------------------------------------------------------------------
// Frontend types (match existing UI expectations)
// ---------------------------------------------------------------------------

export interface CommunityStats {
  miembros: number;
  posts: number;
  activosAhora: number;
}

export interface CommunityMemberUI {
  id: string;
  name: string;
  role: string;
  joined: string;
}

export interface CommunityResourceUI {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'template' | 'video' | 'article' | 'tool';
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

export async function getCommunityStats(): Promise<CommunityStats> {
  const res = await fetch(`${API_URL}/api/v1/community/stats`, {
    headers: authHeaders(),
  });
  
  if (!res.ok) {
    throw new Error('Error al cargar estadísticas de comunidad');
  }
  
  return res.json();
}

export async function getCommunityMembers(
  params: CommunityMembersParams = {}
): Promise<{ members: CommunityMemberUI[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.append('search', params.search);
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.page_size) searchParams.append('page_size', params.page_size.toString());

  const url = `${API_URL}/api/v1/community/members${
    searchParams.toString() ? `?${searchParams.toString()}` : ''
  }`;

  const res = await fetch(url, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('Error al cargar miembros de comunidad');
  }

  const data: CommunityMembersResponse = await res.json();

  // Map backend response to UI format
  const mappedMembers = data.members.map(member => ({
    id: member.id,
    name: member.name,
    role: member.role || 'Miembro', // Handle null role
    joined: formatJoinedDate(member.joined_at),
  }));

  return {
    members: mappedMembers,
    total: data.total,
  };
}

export async function getCommunityResources(
  params: CommunityResourcesParams = {}
): Promise<{ resources: CommunityResourceUI[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.append('search', params.search);
  if (params.type) searchParams.append('type', params.type);
  if (params.category) searchParams.append('category', params.category);
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.page_size) searchParams.append('page_size', params.page_size.toString());

  const url = `${API_URL}/api/v1/community/resources${
    searchParams.toString() ? `?${searchParams.toString()}` : ''
  }`;

  const res = await fetch(url, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('Error al cargar recursos de comunidad');
  }

  const data: CommunityResourcesResponse = await res.json();

  // Map backend response to UI format - keeping only fields the UI needs
  const mappedResources = data.resources.map(resource => ({
    id: resource.id,
    title: resource.title,
    description: resource.description,
    type: mapResourceType(resource.type),
  }));

  return {
    resources: mappedResources,
    total: data.total,
  };
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function formatJoinedDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('es-ES', { month: 'short' });
    const year = date.getFullYear();
    
    // Capitalize first letter and return format like "Feb 2026"
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
  } catch {
    return 'Fecha desconocida';
  }
}

function mapResourceType(backendType: string): 'guide' | 'template' | 'video' | 'article' | 'tool' {
  // Ensure the backend type is one of the expected UI types
  const validTypes = ['guide', 'template', 'video', 'article', 'tool'] as const;
  return validTypes.includes(backendType as any) ? (backendType as any) : 'guide';
}