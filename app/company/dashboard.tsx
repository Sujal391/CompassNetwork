import { CompanyDashboard } from '@/src/screens/company/CompanyDashboard';
import { useRouter } from 'expo-router';

export default function CompanyDashboardPage() {
  const router = useRouter();
  return <CompanyDashboard navigation={router} />;
}

