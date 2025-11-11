import { RegisterCompanyScreen } from '@/src/screens/distributor/RegisterCompanyScreen';
import { useRouter } from 'expo-router';

export default function DistributorRegisterCompanyPage() {
  const router = useRouter();
  return <RegisterCompanyScreen navigation={router} />;
}

