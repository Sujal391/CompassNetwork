import { useAuth } from '@/src/context/AuthContext';
import { apiService } from '@/src/services/api/apiService';
import { Company } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
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
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('/landing');
          }
        }
      ]
    );
  };

  const menuItems = [
    { 
      id: 1, 
      title: 'Register New Company', 
      description: 'Add a new company to your portfolio',
      icon: 'business-outline' as const, 
      route: '/distributor/register-company' 
    },
  ];

  const renderRegisterForm = () => (
    <View style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Text style={styles.sectionSubtitle}>Manage your distributor account</Text>
      </View>

      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.actionCard}
          onPress={() => item.route && navigation.push(item.route)}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name={item.icon} size={24} color="#007AFF" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>{item.title}</Text>
            <Text style={styles.actionDescription}>{item.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCompaniesList = () => (
    <View style={styles.listContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Companies</Text>
        <Text style={styles.sectionSubtitle}>{companies.length} companies registered</Text>
      </View>

      {refreshing ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : companies.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="business-outline" size={48} color="#C7C7CC" />
          <Text style={styles.emptyTitle}>No companies yet</Text>
          <Text style={styles.emptyDescription}>Register your first company to get started</Text>
        </View>
      ) : (
        companies.map((company) => (
          <TouchableOpacity 
            key={company.id} 
            style={styles.companyCard}
            onPress={() => {/* Add navigation to company details if needed */}}
          >
            <View style={styles.companyHeader}>
              <View style={styles.companyIcon}>
                <Ionicons name="business" size={20} color="#007AFF" />
              </View>
              <View style={styles.companyTitleContainer}>
                <Text style={styles.companyName} numberOfLines={1}>
                  {company.companyName}
                </Text>
                <Text style={styles.companyGST}>GST: {company.gstNumber}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.companyDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="mail-outline" size={16} color="#8E8E93" />
                <Text style={styles.detailText} numberOfLines={1}>
                  {company.companyEmail}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={16} color="#8E8E93" />
                <Text style={styles.detailText}>{company.mobileNumber}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={16} color="#8E8E93" />
                <Text style={styles.detailText}>
                  {company.technicianCount} technician{company.technicianCount !== 1 ? 's' : ''}
                </Text>
              </View>
              
              {company.referCode && (
                <View style={styles.referCodeContainer}>
                  <Text style={styles.referCodeLabel}>Referral Code:</Text>
                  <View style={styles.referCodeBadge}>
                    <Text style={styles.referCodeText}>{company.referCode}</Text>
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Distributor'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Distributor</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'register' && styles.activeTab]}
          onPress={() => setActiveTab('register')}
        >
          <Ionicons 
            name="add-circle-outline" 
            size={20} 
            color={activeTab === 'register' ? '#007AFF' : '#8E8E93'} 
          />
          <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
            Register
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'companies' && styles.activeTab]}
          onPress={() => setActiveTab('companies')}
        >
          <Ionicons 
            name="business-outline" 
            size={20} 
            color={activeTab === 'companies' ? '#007AFF' : '#8E8E93'} 
          />
          <Text style={[styles.tabText, activeTab === 'companies' && styles.activeTabText]}>
            Companies ({companies.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContent}
        refreshControl={
          activeTab === 'companies' ? (
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={fetchDistributorCompanies}
              tintColor="#007AFF"
            />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'register' && renderRegisterForm()}
        {activeTab === 'companies' && renderCompaniesList()}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Need help? Contact support
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 8,
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#8E8E93',
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
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  companyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyTitleContainer: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  companyGST: {
    fontSize: 13,
    color: '#8E8E93',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginBottom: 16,
  },
  companyDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#1D1D1F',
    flex: 1,
  },
  referCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  referCodeLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  referCodeBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  referCodeText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#8E8E93',
  },
});