import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useAuth } from '@/src/context/AuthContext';

export const DistributorDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const menuItems = [
    { id: 1, title: 'View Orders', icon: '📋', color: '#FF6B6B' },
    { id: 2, title: 'Manage Inventory', icon: '📦', color: '#4ECDC4' },
    { id: 3, title: 'Sales Report', icon: '📊', color: '#45B7D1' },
    { id: 4, title: 'Profile Settings', icon: '⚙️', color: '#FFA07A' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {user?.name || 'Distributor'}!</Text>
        <Text style={styles.role}>Distributor Account</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        {menuItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuCard}>
            <View style={[styles.iconBox, { backgroundColor: item.color }]}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  role: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    fontSize: 24,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  arrow: {
    fontSize: 18,
    color: '#007AFF',
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

