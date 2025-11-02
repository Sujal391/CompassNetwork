import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ActivityIndicator, View } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isLoading, isSignedIn, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {!isSignedIn ? (
          <>
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/role-selection" options={{ headerShown: false }} />
            <Stack.Screen name="auth/register-distributor" options={{ headerShown: false }} />
            <Stack.Screen name="auth/register-company" options={{ headerShown: false }} />
            <Stack.Screen name="auth/register-technician" options={{ headerShown: false }} />
          </>
        ) : (
          <>
            {user?.role === 'distributor' && (
              <Stack.Screen name="distributor/dashboard" options={{ headerShown: false }} />
            )}
            {user?.role === 'company' && (
              <Stack.Screen name="company/dashboard" options={{ headerShown: false }} />
            )}
            {user?.role === 'technician' && (
              <Stack.Screen name="technician/dashboard" options={{ headerShown: false }} />
            )}
          </>
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
