'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getCommunityStats,
  getCommunityMembers,
  getCommunityResources,
  getCommunityPosts,
  createCommunityPost,
  togglePostLike,
  getPostComments,
  createPostComment,
  deletePostComment,
  getCommunityDebates,
  createCommunityDebate,
  getDebateReplies,
  createDebateReply,
  type CommunityStats,
  type CommunityMemberUI,
  type CommunityMembersParams,
  type CommunityResourceUI,
  type CommunityResourcesParams,
  type FeedPostUI,
  type FeedPostsParams,
  type CreatePostPayload,
  type PostCommentUI,
  type CreateCommentPayload,
  type DebateUI,
  type DebatesParams,
  type CreateDebatePayload,
  type DebateReplyUI,
  type CreateDebateReplyPayload,
} from '@/services/communityService';

export function useCommunityStats() {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const data = await getCommunityStats();
        if (!cancelled) {
          setStats(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Error al cargar estadísticas'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading, error };
}

export function useCommunityMembers(params: CommunityMembersParams = {}) {
  const [members, setMembers] = useState<CommunityMemberUI[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async (fetchParams: CommunityMembersParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getCommunityMembers(fetchParams);
      setMembers(data.members);
      setTotal(data.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar miembros'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers(params);
  }, [fetchMembers, params.search, params.page, params.page_size]);

  return { 
    members, 
    total, 
    loading, 
    error, 
    refresh: () => fetchMembers(params) 
  };
}

export function useCommunityResources(params: CommunityResourcesParams = {}) {
  const [resources, setResources] = useState<CommunityResourceUI[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = useCallback(async (fetchParams: CommunityResourcesParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getCommunityResources(fetchParams);
      setResources(data.resources);
      setTotal(data.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar recursos'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources(params);
  }, [fetchResources, params.search, params.type, params.category, params.page, params.page_size]);

  return { 
    resources, 
    total, 
    loading, 
    error, 
    refresh: () => fetchResources(params) 
  };
}

export function useCommunityFeed(params: FeedPostsParams = {}) {
  const [posts, setPosts] = useState<FeedPostUI[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = useCallback(async (fetchParams: FeedPostsParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getCommunityPosts(fetchParams);
      setPosts(data.posts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar posts'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (payload: CreatePostPayload) => {
    setSubmitting(true);
    setError(null);
    
    try {
      const newPost = await createCommunityPost(payload);
      // Prepend the new post to the current list
      setPosts(prevPosts => [newPost, ...prevPosts]);
      setTotal(prevTotal => prevTotal + 1);
      return newPost;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el post';
      setError(errorMessage);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const toggleLike = useCallback(async (postId: string) => {
    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? {
            ...p,
            is_liked_by_me: !p.is_liked_by_me,
            likes_count: p.is_liked_by_me ? p.likes_count - 1 : p.likes_count + 1,
          }
        : p
    ));

    try {
      const result = await togglePostLike(postId);
      // Sync with server response
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, likes_count: result.likes_count, is_liked_by_me: result.is_liked_by_me }
          : p
      ));
    } catch {
      // Revert optimistic update on error
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? {
              ...p,
              is_liked_by_me: !p.is_liked_by_me,
              likes_count: p.is_liked_by_me ? p.likes_count - 1 : p.likes_count + 1,
            }
          : p
      ));
    }
  }, []);

  useEffect(() => {
    fetchPosts(params);
  }, [fetchPosts, params.page, params.page_size]);

  return {
    posts,
    total,
    totalPages,
    loading,
    error,
    submitting,
    createPost,
    toggleLike,
    refresh: () => fetchPosts(params),
  };
}

export function usePostComments(postId: string | null) {
  const [comments, setComments] = useState<PostCommentUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!postId) return;

    setLoading(true);
    setError(null);
    
    try {
      const data = await getPostComments(postId);
      setComments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar comentarios'
      );
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const createComment = useCallback(async (payload: CreateCommentPayload) => {
    if (!postId) return;

    setSubmitting(true);
    setError(null);
    
    try {
      const newComment = await createPostComment(postId, payload);
      // Append the new comment to the current list
      setComments(prevComments => [...prevComments, newComment]);
      return newComment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el comentario';
      setError(errorMessage);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [postId]);

  useEffect(() => {
    if (postId) {
      fetchComments();
    } else {
      // Reset comments when postId is null
      setComments([]);
      setLoading(false);
      setError(null);
    }
  }, [fetchComments]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!postId) return;
    // Optimistic update
    setComments(prev => prev.filter(c => c.id !== commentId));
    try {
      await deletePostComment(postId, commentId);
    } catch (err) {
      // Revert on error by refetching
      fetchComments();
      throw err;
    }
  }, [postId, fetchComments]);

  return {
    comments,
    loading,
    error,
    submitting,
    createComment,
    deleteComment,
    refresh: fetchComments,
  };
}

export function useCommunityDebates(params: DebatesParams = {}) {
  const [debates, setDebates] = useState<DebateUI[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchDebates = useCallback(async (fetchParams: DebatesParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getCommunityDebates(fetchParams);
      setDebates(data.debates);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar debates'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const createDebate = useCallback(async (payload: CreateDebatePayload) => {
    setSubmitting(true);
    setError(null);
    
    try {
      const newDebate = await createCommunityDebate(payload);
      // Prepend the new debate to the current list
      setDebates(prevDebates => [newDebate, ...prevDebates]);
      setTotal(prevTotal => prevTotal + 1);
      return newDebate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el debate';
      setError(errorMessage);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  useEffect(() => {
    fetchDebates(params);
  }, [fetchDebates, params.category, params.page, params.page_size]);

  return {
    debates,
    total,
    totalPages,
    loading,
    error,
    submitting,
    createDebate,
    refresh: () => fetchDebates(params),
  };
}

export function useDebateReplies(debateId: string | null) {
  const [replies, setReplies] = useState<DebateReplyUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchReplies = useCallback(async () => {
    if (!debateId) return;

    setLoading(true);
    setError(null);
    
    try {
      const data = await getDebateReplies(debateId);
      setReplies(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al cargar respuestas'
      );
    } finally {
      setLoading(false);
    }
  }, [debateId]);

  const createReply = useCallback(async (payload: CreateDebateReplyPayload) => {
    if (!debateId) return;

    setSubmitting(true);
    setError(null);
    
    try {
      const newReply = await createDebateReply(debateId, payload);
      // Append the new reply to the current list
      setReplies(prevReplies => [...prevReplies, newReply]);
      return newReply;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la respuesta';
      setError(errorMessage);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [debateId]);

  useEffect(() => {
    if (debateId) {
      fetchReplies();
    } else {
      // Reset replies when debateId is null
      setReplies([]);
      setLoading(false);
      setError(null);
    }
  }, [fetchReplies]);

  return {
    replies,
    loading,
    error,
    submitting,
    createReply,
    refresh: fetchReplies,
  };
}