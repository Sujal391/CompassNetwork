import { AdminDashboard } from '@/src/screens/admin/AdminDashboard';
import { useRouter } from 'expo-router';

export default function AdminDashboardPage() {
  const router = useRouter();
  return <AdminDashboard navigation={router} />;
}

