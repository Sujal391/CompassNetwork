import { RoleSelectionScreen } from '@/src/screens/auth/RoleSelectionScreen';
import { useRouter } from 'expo-router';

export default function RoleSelectionPage() {
  const router = useRouter();
  return <RoleSelectionScreen navigation={router} />;
}

