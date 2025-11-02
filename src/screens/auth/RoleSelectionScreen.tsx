import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

export const RoleSelectionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const roles = [
    {
      id: 'distributor',
      title: 'Distributor',
      description: 'Register as a distributor',
      icon: '📦',
    },
    {
      id: 'company',
      title: 'Company',
      description: 'Register your company',
      icon: '🏢',
    },
    {
      id: 'technician',
      title: 'Technician',
      description: 'Register as a technician',
      icon: '🔧',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Select Your Role</Text>
        <Text style={styles.subtitle}>Choose how you want to register</Text>

        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={styles.roleCard}
            onPress={() => navigation.navigate(`auth/register-${role.id}`)}
          >
            <Text style={styles.roleIcon}>{role.icon}</Text>
            <View style={styles.roleInfo}>
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleDescription}>{role.description}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('auth/login')}>
            <Text style={styles.linkText}>Login</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  roleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  roleDescription: {
    fontSize: 14,
    color: '#999',
  },
  arrow: {
    fontSize: 20,
    color: '#007AFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

