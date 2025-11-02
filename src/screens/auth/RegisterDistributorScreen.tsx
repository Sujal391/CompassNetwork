import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/src/context/AuthContext';
import { authService } from '@/src/services/api/authService';
import { DistributorRegisterRequest } from '@/src/types';

export const RegisterDistributorScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuth();

  const handleRegister = async () => {
    const { name, email, mobileNumber, password, confirmPassword } = formData;

    if (!name || !email || !mobileNumber || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const registerData: DistributorRegisterRequest = {
        name,
        email,
        mobileNumber,
        password,
        confirmPassword,
      };

      const response = await authService.registerDistributor(registerData);

      if (response.data) {
        const { token, user } = response.data;
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Register as Distributor</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={formData.name}
          onChangeText={(value) => updateField('name', value)}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(value) => updateField('email', value)}
          editable={!loading}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          value={formData.mobileNumber}
          onChangeText={(value) => updateField('mobileNumber', value)}
          editable={!loading}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={formData.password}
          onChangeText={(value) => updateField('password', value)}
          editable={!loading}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(value) => updateField('confirmPassword', value)}
          editable={!loading}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 20,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

