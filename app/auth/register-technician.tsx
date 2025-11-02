import { RegisterTechnicianScreen } from '@/src/screens/auth/RegisterTechnicianScreen';
import { useRouter } from 'expo-router';

export default function RegisterTechnicianPage() {
  const router = useRouter();
  return <RegisterTechnicianScreen navigation={router} />;
}

