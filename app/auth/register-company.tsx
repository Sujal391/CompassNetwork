import { RegisterCompanyScreen } from '@/src/screens/auth/RegisterCompanyScreen';
import { useRouter } from 'expo-router';

export default function RegisterCompanyPage() {
  const router = useRouter();
  return <RegisterCompanyScreen navigation={router} />;
}

