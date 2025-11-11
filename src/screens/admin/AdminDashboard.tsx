import { useAuth } from '@/src/context/AuthContext';
import { apiService } from '@/src/services/api/apiService';
import { Company, Distributor, DistributorRegisterRequest, SiteVisit, Technician } from '@/src/types';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export const AdminDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'register' | 'distributors' | 'companies' | 'technicians' | 'siteVisits'>('register');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [selectedVisitDetails, setSelectedVisitDetails] = useState<SiteVisit | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const tabScrollRef = useRef<ScrollView>(null);

  // Registration form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (activeTab === 'distributors') {
      fetchDistributors();
    } else if (activeTab === 'companies') {
      fetchCompanies();
    } else if (activeTab === 'technicians') {
      fetchTechnicians();
    } else if (activeTab === 'siteVisits') {
      fetchAllSiteVisits();
    }
  }, [activeTab]);

  const fetchDistributors = async () => {
    try {
      setRefreshing(true);
      const data = await apiService.getDistributors();
      setDistributors(data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch distributors');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      setRefreshing(true);
      const data = await apiService.getCompanies();
      setCompanies(data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch companies');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      setRefreshing(true);
      const data = await apiService.getTechnicians();
      setTechnicians(data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch technicians');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchAllSiteVisits = async () => {
    try {
      setRefreshing(true);
      const data = await apiService.getAllSiteVisits();
      setSiteVisits(data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch site visits');
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewSiteVisitDetails = async (visit: SiteVisit) => {
    setLoading(true);
    try {
      const details = await apiService.getSiteVisitById(visit.id);
      setSelectedVisitDetails(details);
      setShowDetailsModal(true);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch site visit details');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedVisitDetails(null);
  };

  const handleRegisterDistributor = async () => {
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

      const response = await apiService.registerDistributor(registerData);

      if (response.success) {
        Alert.alert('Success', 'Distributor registered successfully!');
        setFormData({
          name: '',
          email: '',
          mobileNumber: '',
          password: '',
          confirmPassword: '',
        });
        // Refresh the list if we're on that tab
        if (activeTab === 'distributors') {
          fetchDistributors();
        }
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('/landing');
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderRegisterForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Register New Distributor</Text>

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
        style={[styles.registerButton, loading && styles.buttonDisabled]}
        onPress={handleRegisterDistributor}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.registerButtonText}>Register Distributor</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderDistributorList = () => (
    <View style={styles.listContainer}>
      <Text style={styles.listTitle}>Registered Distributors</Text>

      {refreshing ? (
        <ActivityIndicator size="large" color="#e74c3c" style={styles.loader} />
      ) : distributors.length === 0 ? (
        <Text style={styles.emptyText}>No distributors registered yet</Text>
      ) : (
        distributors.map((distributor) => (
          <View key={distributor.id} style={styles.distributorCard}>
            <View style={styles.distributorInfo}>
              <Text style={styles.distributorName}>{distributor.name}</Text>
              <Text style={styles.distributorEmail}>{distributor.email}</Text>
              <Text style={styles.distributorPhone}>{distributor.mobileNumber}</Text>
              {distributor.referCode && (
                <Text style={styles.distributorCode}>Code: {distributor.referCode}</Text>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderCompaniesList = () => (
    <View style={styles.listContainer}>
      <Text style={styles.listTitle}>All Companies</Text>

      {refreshing ? (
        <ActivityIndicator size="large" color="#e74c3c" style={styles.loader} />
      ) : companies.length === 0 ? (
        <Text style={styles.emptyText}>No companies registered yet</Text>
      ) : (
        companies.map((company) => (
          <View key={company.id} style={styles.distributorCard}>
            <View style={styles.distributorInfo}>
              <Text style={styles.distributorName}>{company.companyName}</Text>
              <Text style={styles.distributorEmail}>Email: {company.companyEmail}</Text>
              <Text style={styles.distributorPhone}>Ph no: {company.mobileNumber}</Text>
              <Text style={styles.distributorEmail}>GST: {company.gstNumber}</Text>
              <Text style={styles.distributorEmail}>Address: {company.companyAddress}</Text>
              <Text style={styles.distributorEmail}>Refer Code: {company.referCode || 'N/A'}</Text>
              <Text style={styles.distributorEmail}>Distributor ID: {company.distributorId || 'N/A'}</Text>
              <Text style={styles.distributorEmail}>Distributor Name: {company.distributorName || 'N/A'}</Text>
              <Text style={styles.distributorEmail}>
                Created At: {new Date(company.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
              <Text style={styles.distributorEmail}>Technician Count: {company.technicianCount}</Text>
              {company.referCode && (
                <Text style={styles.distributorCode}>Code: {company.referCode}</Text>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderTechniciansList = () => (
    <View style={styles.listContainer}>
      <Text style={styles.listTitle}>All Technicians</Text>

      {refreshing ? (
        <ActivityIndicator size="large" color="#e74c3c" style={styles.loader} />
      ) : technicians.length === 0 ? (
        <Text style={styles.emptyText}>No technicians registered yet</Text>
      ) : (
        technicians.map((technician) => (
          <View key={technician.id} style={styles.distributorCard}>
            <View style={styles.distributorInfo}>
              <Text style={styles.distributorName}>{technician.name}</Text>
              <Text style={styles.distributorEmail}>{technician.email}</Text>
              <Text style={styles.distributorPhone}>{technician.mobileNumber}</Text>
              {technician.referCode && (
                <Text style={styles.distributorCode}>Code: {technician.referCode}</Text>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderSiteVisitsList = () => (
    <View style={styles.content}>
      <Text style={styles.listTitle}>📍 All Site Visits</Text>

      {refreshing ? (
        <ActivityIndicator size="large" color="#e74c3c" style={styles.loader} />
      ) : siteVisits.length === 0 ? (
        <Text style={styles.emptyText}>No site visits recorded yet</Text>
      ) : (
        siteVisits.map((visit, index) => (
          <View key={visit.id} style={styles.visitCard}>
            <View style={styles.visitHeader}>
              <View style={styles.visitNumberBadge}>
                <Text style={styles.visitNumberText}>#{siteVisits.length - index}</Text>
              </View>
            </View>

            <View style={styles.visitInfo}>
              <Text style={styles.visitSite}>{visit.houseNo}, {visit.area}</Text>
              <Text style={styles.visitCompany}>📍 {visit.city}, {visit.state}</Text>
              <Text style={styles.visitDate}>📌 {visit.street}</Text>
              {visit.cableConnections && visit.cableConnections.length > 0 && (
                <Text style={styles.visitRemarks}>
                  🔌 {visit.cableConnections.length} cable connection(s)
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => handleViewSiteVisitDetails(visit)}
            >
              <Text style={styles.viewButtonText}>👁️ View Details</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );

  const renderDetailsModal = () => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>📍 Site Visit Details</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseDetailsModal}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody}>
          {selectedVisitDetails && (
            <View>
              <View style={styles.detailsSection}>
                <Text style={styles.detailsLabel}>Location Information</Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsKey}>House No:</Text>
                  <Text style={styles.detailsValue}>{selectedVisitDetails.houseNo}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsKey}>Area:</Text>
                  <Text style={styles.detailsValue}>{selectedVisitDetails.area}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsKey}>Street:</Text>
                  <Text style={styles.detailsValue}>{selectedVisitDetails.street}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsKey}>Landmark:</Text>
                  <Text style={styles.detailsValue}>{selectedVisitDetails.landmark}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsKey}>City:</Text>
                  <Text style={styles.detailsValue}>{selectedVisitDetails.city}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsKey}>State:</Text>
                  <Text style={styles.detailsValue}>{selectedVisitDetails.state}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsKey}>Pincode:</Text>
                  <Text style={styles.detailsValue}>{selectedVisitDetails.pincode}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsKey}>Latitude:</Text>
                  <Text style={styles.detailsValue}>{selectedVisitDetails.latitude}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsKey}>Longitude:</Text>
                  <Text style={styles.detailsValue}>{selectedVisitDetails.longitude}</Text>
                </View>
              </View>

              {selectedVisitDetails.cableConnections && selectedVisitDetails.cableConnections.length > 0 && (
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsLabel}>Cable Connections</Text>
                  {selectedVisitDetails.cableConnections.map((cable, index) => (
                    <View key={index} style={styles.cableDetailsItem}>
                      <View style={styles.detailsRow}>
                        <Text style={styles.detailsKey}>Core #{cable.coreNumber}</Text>
                      </View>
                      <View style={styles.detailsRow}>
                        <Text style={styles.detailsKey}>From:</Text>
                        <Text style={styles.detailsValue}>{cable.fromColor}</Text>
                      </View>
                      <View style={styles.detailsRow}>
                        <Text style={styles.detailsKey}>To:</Text>
                        <Text style={styles.detailsValue}>{cable.toColor}</Text>
                      </View>
                      <View style={styles.detailsRow}>
                        <Text style={styles.detailsKey}>Reason:</Text>
                        <Text style={styles.detailsValue}>{cable.reason}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {selectedVisitDetails.photos && selectedVisitDetails.photos.length > 0 && (
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsLabel}>📸 Uploaded Photos ({selectedVisitDetails.photos.length})</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosGallery}>
                    {selectedVisitDetails.photos.map((photo, index) => (
                      <View key={index} style={styles.photoGalleryItem}>
                        <Image
                          source={{ uri: `https://compassnetwork.runasp.net${photo.photoUrl}` }}
                          style={styles.photoGalleryImage}
                        />
                        <Text style={styles.photoUploadedAt}>
                          {new Date(photo.uploadedAt).toLocaleDateString('en-IN')}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={handleCloseDetailsModal}
            disabled={loading}
          >
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {user?.name || 'Admin'}!</Text>
        <Text style={styles.role}>Administrator Panel</Text>
      </View>

      <View style={styles.tabContainerWrapper}>
        <ScrollView
          ref={tabScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabContainer}
          contentContainerStyle={styles.tabContentContainer}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === 'register' && styles.activeTab]}
            onPress={() => setActiveTab('register')}
          >
            <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
              Register
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'distributors' && styles.activeTab]}
            onPress={() => setActiveTab('distributors')}
          >
            <Text style={[styles.tabText, activeTab === 'distributors' && styles.activeTabText]}>
              Distributors
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'companies' && styles.activeTab]}
            onPress={() => setActiveTab('companies')}
          >
            <Text style={[styles.tabText, activeTab === 'companies' && styles.activeTabText]}>
              Companies
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'technicians' && styles.activeTab]}
            onPress={() => setActiveTab('technicians')}
          >
            <Text style={[styles.tabText, activeTab === 'technicians' && styles.activeTabText]}>
              Technicians
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'siteVisits' && styles.activeTab]}
            onPress={() => setActiveTab('siteVisits')}
          >
            <Text style={[styles.tabText, activeTab === 'siteVisits' && styles.activeTabText]}>
              Site Visits
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          activeTab !== 'register' ? (
            <RefreshControl refreshing={refreshing} onRefresh={() => {
              if (activeTab === 'distributors') fetchDistributors();
              else if (activeTab === 'companies') fetchCompanies();
              else if (activeTab === 'technicians') fetchTechnicians();
              else if (activeTab === 'siteVisits') fetchAllSiteVisits();
            }} />
          ) : undefined
        }
      >
        {activeTab === 'register' && renderRegisterForm()}
        {activeTab === 'distributors' && renderDistributorList()}
        {activeTab === 'companies' && renderCompaniesList()}
        {activeTab === 'technicians' && renderTechniciansList()}
        {activeTab === 'siteVisits' && renderSiteVisitsList()}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {showDetailsModal && renderDetailsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#e74c3c',
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
    color: '#ffd7d7',
  },
  tabContainerWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tabContainer: {
    flexGrow: 0,
  },
  tabContentContainer: {
    paddingHorizontal: 10,
  },
  tab: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minWidth: 100,
  },
  activeTab: {
    borderBottomColor: '#e74c3c',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#e74c3c',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
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
  registerButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  loader: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 20,
  },
  distributorCard: {
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
  distributorInfo: {
    flex: 1,
  },
  distributorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  distributorEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  distributorPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  distributorCode: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '500',
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    margin: 20,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  logoutText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
  visitCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  visitNumberBadge: {
    backgroundColor: '#ffe4e1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  visitNumberText: {
    color: '#e74c3c',
    fontSize: 12,
    fontWeight: '700',
  },
  visitInfo: {
    marginBottom: 12,
  },
  visitSite: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  visitCompany: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  visitDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  visitRemarks: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
  },
  viewButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ffe4e1',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffe4e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  detailsSection: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  detailsLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  detailsKey: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  detailsValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  cableDetailsItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  closeModalButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  closeModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  photosGallery: {
    marginVertical: 10,
  },
  photoGalleryItem: {
    marginRight: 12,
    alignItems: 'center',
  },
  photoGalleryImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  photoUploadedAt: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontWeight: '500',
  },
});

