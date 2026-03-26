import AdminGuard from '@/components/admin/AdminGuard';
import { AdminFeed } from '@/components/admin/AdminFeed';

export default function AdminFeedPage() {
  return (
    <AdminGuard>
      <AdminFeed />
    </AdminGuard>
  );
}
