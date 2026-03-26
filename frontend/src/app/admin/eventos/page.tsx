import AdminGuard from '@/components/admin/AdminGuard';
import { AdminEventos } from '@/components/admin/AdminEventos';

export default function AdminEventosPage() {
  return (
    <AdminGuard>
      <AdminEventos />
    </AdminGuard>
  );
}
