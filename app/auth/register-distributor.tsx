import { RegisterDistributorScreen } from '@/src/screens/auth/RegisterDistributorScreen';
import { useRouter } from 'expo-router';

export default function RegisterDistributorPage() {
  const router = useRouter();
  return <RegisterDistributorScreen navigation={router} />;
}

