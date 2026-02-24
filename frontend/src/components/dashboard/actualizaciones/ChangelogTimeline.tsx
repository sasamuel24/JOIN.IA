import type { ChangelogItem } from '@/types/dashboard';
import { TimelineItem } from './TimelineItem';

interface ChangelogTimelineProps {
  items: ChangelogItem[];
}

export function ChangelogTimeline({ items }: ChangelogTimelineProps) {
  return (
    <div className="relative">
      {items.map((item, i) => (
        <TimelineItem key={item.version} item={item} index={i} />
      ))}
    </div>
  );
}
