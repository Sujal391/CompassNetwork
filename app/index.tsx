import { Redirect } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isLoading, isSignedIn, userType } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/landing" />;
  }

  // Redirect to appropriate dashboard based on userType
  if (userType === 'Distributor') {
    return <Redirect href="/distributor/dashboard" />;
  }

  if (userType === 'Company') {
    return <Redirect href="/company/dashboard" />;
  }

  if (userType === 'Technician') {
    return <Redirect href="/technician/dashboard" />;
  }

  // Fallback to landing if no userType
  return <Redirect href="/landing" />;
}

