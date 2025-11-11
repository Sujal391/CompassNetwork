import { AdminLoginScreen } from '@/src/screens/admin/AdminLoginScreen';
import { useRouter } from 'expo-router';

export default function AdminLoginPage() {
  const router = useRouter();
  return <AdminLoginScreen navigation={router} />;
}

