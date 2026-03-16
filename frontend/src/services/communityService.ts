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
  avatar_url: string | null;
  joined: string;
}

export interface CommunityResourceUI {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'template' | 'video' | 'article' | 'tool';
}

// Feed Posts Types
export interface FeedPostAuthorResponse {
  id: string;
  name: string;
  role: string | null;
  avatar_url: string | null;
}

export interface FeedPostResponse {
  id: string;
  content: string;
  created_at: string;
  comments_count: number;
  author: FeedPostAuthorResponse;
}

export interface FeedPostsResponse {
  posts: FeedPostResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface FeedPostsParams {
  page?: number;
  page_size?: number;
}

export interface CreatePostPayload {
  content: string;
}

// Comments Types
export interface CommentAuthorResponse {
  id: string;
  name: string;
  role: string | null;
  avatar_url: string | null;
}

export interface PostCommentResponse {
  id: string;
  content: string;
  created_at: string;
  author: CommentAuthorResponse;
}

export interface PostCommentsResponse {
  comments: PostCommentResponse[];
}

export interface CreateCommentPayload {
  content: string;
}

// Frontend UI Types for Feed
export interface FeedPostUI {
  id: string;
  author: {
    name: string;
    role: string;
    avatar_url: string | null;
  };
  content: string;
  comments_count: number;
  created_at: string;
  time: string; // formatted time like "Hace 2h"
}

export interface PostCommentUI {
  id: string;
  author: {
    name: string;
    role: string;
    avatar_url: string | null;
  };
  content: string;
  created_at: string;
  time: string; // formatted time like "Hace 2h"
}

// Debates Types
export interface DebateAuthorResponse {
  id: string;
  name: string;
  role: string | null;
  avatar_url: string | null;
}

export interface DebateResponse {
  id: string;
  slug: string;
  title: string;
  category: string;
  content: string;
  created_at: string;
  last_activity_at: string;
  replies_count: number;
  participants_count: number;
  author: DebateAuthorResponse;
}

export interface DebatesResponse {
  debates: DebateResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DebatesParams {
  category?: string;
  page?: number;
  page_size?: number;
}

export interface CreateDebatePayload {
  title: string;
  category: string;
  content: string;
}

// Debate Replies Types
export interface DebateReplyAuthorResponse {
  id: string;
  name: string;
  role: string | null;
  avatar_url: string | null;
}

export interface DebateReplyResponse {
  id: string;
  content: string;
  created_at: string;
  author: DebateReplyAuthorResponse;
}

export interface DebateRepliesResponse {
  replies: DebateReplyResponse[];
}

export interface CreateDebateReplyPayload {
  content: string;
}

// Frontend UI Types for Debates
export interface DebateUI {
  id: string;
  slug: string;
  title: string;
  category: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatar_url: string | null;
  };
  replies_count: number;
  participants_count: number;
  created_at: string;
  last_activity_at: string;
  lastActivity: string; // formatted time like "Hace 2h"
}

export interface DebateReplyUI {
  id: string;
  author: {
    name: string;
    role: string;
    avatar_url: string | null;
  };
  content: string;
  created_at: string;
  time: string; // formatted time like "Hace 2h"
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
    role: member.role || 'Miembro',
    avatar_url: member.avatar_url,
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

// ---------------------------------------------------------------------------
// Feed Posts API calls
// ---------------------------------------------------------------------------

export async function getCommunityPosts(
  params: FeedPostsParams = {}
): Promise<{ posts: FeedPostUI[]; total: number; totalPages: number }> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.page_size) searchParams.append('page_size', params.page_size.toString());

  const url = `${API_URL}/api/v1/community/posts${
    searchParams.toString() ? `?${searchParams.toString()}` : ''
  }`;

  const res = await fetch(url, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('Error al cargar posts de la comunidad');
  }

  const data: FeedPostsResponse = await res.json();

  // Map backend response to UI format
  const mappedPosts = data.posts.map(post => ({
    id: post.id,
    author: {
      name: post.author.name,
      role: post.author.role || 'Miembro',
      avatar_url: post.author.avatar_url,
    },
    content: post.content,
    comments_count: post.comments_count,
    created_at: post.created_at,
    time: formatTimeAgo(post.created_at),
  }));

  return {
    posts: mappedPosts,
    total: data.total,
    totalPages: data.total_pages,
  };
}

export async function createCommunityPost(payload: CreatePostPayload): Promise<FeedPostUI> {
  const res = await fetch(`${API_URL}/api/v1/community/posts`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Error al crear el post');
  }

  const data: FeedPostResponse = await res.json();

  // Map backend response to UI format
  return {
    id: data.id,
    author: {
      name: data.author.name,
      role: data.author.role || 'Miembro',
      avatar_url: data.author.avatar_url,
    },
    content: data.content,
    comments_count: data.comments_count,
    created_at: data.created_at,
    time: formatTimeAgo(data.created_at),
  };
}

export async function getPostComments(postId: string): Promise<PostCommentUI[]> {
  const res = await fetch(`${API_URL}/api/v1/community/posts/${postId}/comments`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('Error al cargar comentarios');
  }

  const data: PostCommentsResponse = await res.json();

  // Map backend response to UI format
  return data.comments.map(comment => ({
    id: comment.id,
    author: {
      name: comment.author.name,
      role: comment.author.role || 'Miembro',
      avatar_url: comment.author.avatar_url,
    },
    content: comment.content,
    created_at: comment.created_at,
    time: formatTimeAgo(comment.created_at),
  }));
}

export async function createPostComment(
  postId: string, 
  payload: CreateCommentPayload
): Promise<PostCommentUI> {
  const res = await fetch(`${API_URL}/api/v1/community/posts/${postId}/comments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Error al crear el comentario');
  }

  const data: PostCommentResponse = await res.json();

  // Map backend response to UI format
  return {
    id: data.id,
    author: {
      name: data.author.name,
      role: data.author.role || 'Miembro',
      avatar_url: data.author.avatar_url,
    },
    content: data.content,
    created_at: data.created_at,
    time: formatTimeAgo(data.created_at),
  };
}

function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Ahora';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes}min`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours}h`;
    } else if (diffInSeconds < 2592000) { // 30 days
      const days = Math.floor(diffInSeconds / 86400);
      return `Hace ${days}d`;
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
  } catch {
    return 'Fecha desconocida';
  }
}

// ---------------------------------------------------------------------------
// Debates API calls
// ---------------------------------------------------------------------------

export async function getCommunityDebates(
  params: DebatesParams = {}
): Promise<{ debates: DebateUI[]; total: number; totalPages: number }> {
  const searchParams = new URLSearchParams();
  if (params.category) searchParams.append('category', params.category);
  if (params.page) searchParams.append('page', params.page.toString());
  if (params.page_size) searchParams.append('page_size', params.page_size.toString());

  const url = `${API_URL}/api/v1/community/debates${
    searchParams.toString() ? `?${searchParams.toString()}` : ''
  }`;

  const res = await fetch(url, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('Error al cargar debates de la comunidad');
  }

  const data: DebatesResponse = await res.json();

  // Map backend response to UI format
  const mappedDebates = data.debates.map(debate => ({
    id: debate.id,
    slug: debate.slug,
    title: debate.title,
    category: debate.category,
    content: debate.content,
    author: {
      name: debate.author.name,
      role: debate.author.role || 'Miembro',
      avatar_url: debate.author.avatar_url,
    },
    replies_count: debate.replies_count,
    participants_count: debate.participants_count,
    created_at: debate.created_at,
    last_activity_at: debate.last_activity_at,
    lastActivity: formatTimeAgo(debate.last_activity_at),
  }));

  return {
    debates: mappedDebates,
    total: data.total,
    totalPages: data.total_pages,
  };
}

export async function createCommunityDebate(payload: CreateDebatePayload): Promise<DebateUI> {
  const res = await fetch(`${API_URL}/api/v1/community/debates`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Error al crear el debate');
  }

  const data: DebateResponse = await res.json();

  // Map backend response to UI format
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    category: data.category,
    content: data.content,
    author: {
      name: data.author.name,
      role: data.author.role || 'Miembro',
      avatar_url: data.author.avatar_url,
    },
    replies_count: data.replies_count,
    participants_count: data.participants_count,
    created_at: data.created_at,
    last_activity_at: data.last_activity_at,
    lastActivity: formatTimeAgo(data.last_activity_at),
  };
}

export async function getDebateReplies(debateId: string): Promise<DebateReplyUI[]> {
  const res = await fetch(`${API_URL}/api/v1/community/debates/${debateId}/replies`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('Error al cargar respuestas del debate');
  }

  const data: DebateRepliesResponse = await res.json();

  // Map backend response to UI format
  return data.replies.map(reply => ({
    id: reply.id,
    author: {
      name: reply.author.name,
      role: reply.author.role || 'Miembro',
      avatar_url: reply.author.avatar_url,
    },
    content: reply.content,
    created_at: reply.created_at,
    time: formatTimeAgo(reply.created_at),
  }));
}

export async function createDebateReply(
  debateId: string, 
  payload: CreateDebateReplyPayload
): Promise<DebateReplyUI> {
  const res = await fetch(`${API_URL}/api/v1/community/debates/${debateId}/replies`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Error al crear la respuesta');
  }

  const data: DebateReplyResponse = await res.json();

  // Map backend response to UI format
  return {
    id: data.id,
    author: {
      name: data.author.name,
      role: data.author.role || 'Miembro',
    },
    content: data.content,
    created_at: data.created_at,
    time: formatTimeAgo(data.created_at),
  };
}