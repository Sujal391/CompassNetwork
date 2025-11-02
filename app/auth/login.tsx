import { LoginScreen } from '@/src/screens/auth/LoginScreen';
import { useRouter } from 'expo-router';

export default function LoginPage() {
  const router = useRouter();
  return <LoginScreen navigation={router} />;
}

