import { TechnicianDashboard } from '@/src/screens/technician/TechnicianDashboard';
import { useRouter } from 'expo-router';

export default function TechnicianDashboardPage() {
  const router = useRouter();
  return <TechnicianDashboard navigation={router} />;
}

