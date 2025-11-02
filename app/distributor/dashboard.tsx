import { DistributorDashboard } from '@/src/screens/distributor/DistributorDashboard';
import { useRouter } from 'expo-router';

export default function DistributorDashboardPage() {
  const router = useRouter();
  return <DistributorDashboard navigation={router} />;
}

