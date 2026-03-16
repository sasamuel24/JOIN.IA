'use client';

import { useState, useEffect } from 'react';

export interface NextEvent {
  id: string;
  type: string;
  title: string;
  description: string | null;
  event_date: string;
  timezone_label: string;
  registration_url: string | null;
}

export function useNextEvent() {
  const [event, setEvent] = useState<NextEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/events/next`)
      .then((res) => (res.status === 204 ? null : res.ok ? res.json() : null))
      .then((data) => setEvent(data))
      .finally(() => setLoading(false));
  }, []);

  return { event, loading };
}
