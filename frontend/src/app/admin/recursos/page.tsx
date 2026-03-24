import AdminGuard from '@/components/admin/AdminGuard';
import { AdminRecursos } from '@/components/admin/AdminRecursos';

export default function AdminRecursosPage() {
  return (
    <AdminGuard>
      <AdminRecursos />
    </AdminGuard>
  );
}
