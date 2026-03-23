'use client';

export function VideoPlaceholder() {
  return (
    <div className="relative aspect-video rounded-xl overflow-hidden shadow-sm">
      <video
        src="/VideoJOIN.mp4"
        controls
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  );
}
