import AdminGuard from '@/components/admin/AdminGuard';
import { AdminDebates } from '@/components/admin/AdminDebates';

export default function AdminDebatesPage() {
  return (
    <AdminGuard>
      <AdminDebates />
    </AdminGuard>
  );
}
