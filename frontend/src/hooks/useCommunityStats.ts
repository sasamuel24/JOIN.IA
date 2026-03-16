'use client';

import { useState, useEffect } from 'react';

export interface PainPointStat {
  label: string;
  pct: number;
}

export interface Testimonio {
  quote: string;
  author: string;
}

export interface CommunityStats {
  total: number;
  top_pain_points: PainPointStat[];
  testimonios: Testimonio[];
}

export function useCommunityStats() {
  const [data, setData] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/feedback/community-stats`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => { if (json) setData(json); })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
