import { apiService } from '@/src/services/api/apiService';
import { CompanyRegisterRequest } from '@/src/types';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export const RegisterCompanyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    gstNumber: '',
    mobileNumber: '',
    companyAddress: '',
    password: '',
    confirmPassword: '',
    referCode: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const { companyName, companyEmail, gstNumber, mobileNumber, companyAddress, password, confirmPassword, referCode } = formData;

    if (!companyName || !companyEmail || !gstNumber || !mobileNumber || !companyAddress || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const registerData: CompanyRegisterRequest = {
        companyName,
        companyEmail,
        gstNumber,
        mobileNumber,
        companyAddress,
        password,
        confirmPassword,
        referCode: referCode || '',
      };

      const response = await apiService.registerCompany(registerData);

      if (response.success) {
        Alert.alert(
          'Success',
          'Company registered successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.back()
            }
          ]
        );
        // Reset form
        setFormData({
          companyName: '',
          companyEmail: '',
          gstNumber: '',
          mobileNumber: '',
          companyAddress: '',
          password: '',
          confirmPassword: '',
          referCode: '',
        });
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Register New Company</Text>
      </View>

      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="Company Name *"
          value={formData.companyName}
          onChangeText={(value) => updateField('companyName', value)}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Company Email *"
          value={formData.companyEmail}
          onChangeText={(value) => updateField('companyEmail', value)}
          editable={!loading}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="GST Number *"
          value={formData.gstNumber}
          onChangeText={(value) => updateField('gstNumber', value)}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Mobile Number *"
          value={formData.mobileNumber}
          onChangeText={(value) => updateField('mobileNumber', value)}
          editable={!loading}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Company Address *"
          value={formData.companyAddress}
          onChangeText={(value) => updateField('companyAddress', value)}
          editable={!loading}
          multiline
          numberOfLines={3}
        />

        <TextInput
          style={styles.input}
          placeholder="Password *"
          value={formData.password}
          onChangeText={(value) => updateField('password', value)}
          editable={!loading}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password *"
          value={formData.confirmPassword}
          onChangeText={(value) => updateField('confirmPassword', value)}
          editable={!loading}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Refer Code (Optional)"
          value={formData.referCode}
          onChangeText={(value) => updateField('referCode', value)}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register Company</Text>
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
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
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

