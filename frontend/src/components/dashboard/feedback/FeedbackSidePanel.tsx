'use client';

import { useCommunityStats } from '@/hooks/useCommunityStats';

export function FeedbackSidePanel() {
  const { data, loading } = useCommunityStats();

  return (
    <div className="bg-surface-1 rounded-xl p-6 flex flex-col gap-5 h-full">
      <h3 className="text-base font-bold text-text-main">Comunidad Early Access</h3>

      {/* Pain points */}
      <div>
        <p className="text-[0.72rem] font-semibold text-text-secondary uppercase tracking-wider mb-2">
          Lo que más duele
        </p>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-surface-0 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          (data?.top_pain_points ?? []).map((item) => (
            <div key={item.label} className="flex justify-between text-[0.8rem] text-text-secondary mb-1">
              <span>{item.label}</span>
              <span className="font-semibold">{item.pct}%</span>
            </div>
          ))
        )}
      </div>

      {/* Testimonios */}
      {!loading && (data?.testimonios ?? []).length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-text-main mb-2">Lo que dicen</h4>
          {(data?.testimonios ?? []).map((t, i) => (
            <div key={i} className="bg-surface-0 border border-border rounded-lg p-3 mb-2">
              <p className="text-[0.82rem] italic text-text-main leading-relaxed mb-1">{t.quote}</p>
              <p className="text-[0.72rem] text-text-secondary">— {t.author}</p>
            </div>
          ))}
        </div>
      )}

      {/* Counter */}
      <div className="border-t border-border pt-4 text-center mt-auto">
        <p className="text-[0.72rem] font-semibold text-text-secondary uppercase tracking-wider mb-1">
          Feedbacks recibidos
        </p>
        {loading ? (
          <div className="h-8 w-16 bg-surface-0 rounded animate-pulse mx-auto" />
        ) : (
          <p className="text-2xl font-bold text-text-main">{data?.total ?? 0}</p>
        )}
        <p className="text-xs text-text-secondary">de usuarios en Early Access</p>
      </div>
    </div>
  );
}
