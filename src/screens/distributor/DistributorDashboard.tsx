import { useAuth } from '@/src/context/AuthContext';
import { apiService } from '@/src/services/api/apiService';
import { Company } from '@/src/types';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export const DistributorDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'register' | 'companies'>('register');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (activeTab === 'companies') {
      fetchDistributorCompanies();
    }
  }, [activeTab]);

  const fetchDistributorCompanies = async () => {
    try {
      setRefreshing(true);
      if (user?.id) {
        const data = await apiService.getDistributorCompanies(user.id);
        setCompanies(data);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch companies');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('/landing');
  };

  const menuItems = [
    { id: 1, title: 'Register Company', icon: '🏢', color: '#10B981', route: '/distributor/register-company' },
  ];

  const renderRegisterForm = () => (
    <View style={styles.content}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.menuCard}
          onPress={() => item.route && navigation.push(item.route)}
          disabled={!item.route}
        >
          <View style={[styles.iconBox, { backgroundColor: item.color }]}>
            <Text style={styles.icon}>{item.icon}</Text>
          </View>
          <View style={styles.menuInfo}>
            <Text style={styles.menuTitle}>{item.title}</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCompaniesList = () => (
    <View style={styles.listContainer}>
      <Text style={styles.listTitle}>My Companies</Text>

      {refreshing ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : companies.length === 0 ? (
        <Text style={styles.emptyText}>No companies registered yet</Text>
      ) : (
        companies.map((company) => (
          <View key={company.id} style={styles.companyCard}>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{company.companyName}</Text>
              <Text style={styles.companyEmail}>Email: {company.companyEmail}</Text>
              <Text style={styles.companyPhone}>Ph no: {company.mobileNumber}</Text>
              <Text style={styles.companyEmail}>GST: {company.gstNumber}</Text>
              <Text style={styles.companyEmail}>Address: {company.companyAddress}</Text>
              <Text style={styles.companyEmail}>Technician Count: {company.technicianCount}</Text>
              <Text style={styles.companyEmail}>Created At: {new Date(company.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}</Text>
              {company.referCode && (
                <Text style={styles.companyCode}>Code: {company.referCode}</Text>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {user?.name || 'Distributor'}!</Text>
        <Text style={styles.role}>Distributor Account</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'register' && styles.activeTab]}
          onPress={() => setActiveTab('register')}
        >
          <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
            Register Company
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'companies' && styles.activeTab]}
          onPress={() => setActiveTab('companies')}
        >
          <Text style={[styles.tabText, activeTab === 'companies' && styles.activeTabText]}>
            My Companies
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContent}
        refreshControl={
          activeTab === 'companies' ? (
            <RefreshControl refreshing={refreshing} onRefresh={fetchDistributorCompanies} />
          ) : undefined
        }
      >
        {activeTab === 'register' && renderRegisterForm()}
        {activeTab === 'companies' && renderCompaniesList()}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  listContainer: {
    padding: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
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
  companyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  companyEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  companyPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  companyCode: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 5,
  },
  loader: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
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
    margin: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

