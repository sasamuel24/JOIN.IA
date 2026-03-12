'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getCommunityStats,
  getCommunityMembers,
  getCommunityResources,
  type CommunityStats,
  type CommunityMemberUI,
  type CommunityMembersParams,
  type CommunityResourceUI,
  type CommunityResourcesParams,
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