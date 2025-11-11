import { useAuth } from '@/src/context/AuthContext';
import { apiService } from '@/src/services/api/apiService';
import { SiteVisit, Technician, TechnicianRegisterRequest } from '@/src/types';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export const CompanyDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'register' | 'technicians' | 'siteVisits'>('register');
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVisitDetails, setSelectedVisitDetails] = useState<SiteVisit | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Registration form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (activeTab === 'technicians') {
      fetchCompanyTechnicians();
    } else if (activeTab === 'siteVisits') {
      fetchCompanySiteVisits();
    }
  }, [activeTab]);

  const fetchCompanyTechnicians = async () => {
    try {
      setRefreshing(true);
      if (user?.id) {
        const data = await apiService.getCompanyTechnicians(user.id);
        setTechnicians(data);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch technicians');
    } finally {
      setRefreshing(false);
    }
  };

  const fetchCompanySiteVisits = async () => {
    try {
      setRefreshing(true);
      if (user?.id) {
        const data = await apiService.getSiteVisitsByCompany(user.id);
        setSiteVisits(data);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch site visits');
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewDetails = async (visitId: number) => {
    try {
      setLoading(true);
      const details = await apiService.getSiteVisitById(visitId, user?.id);
      setSelectedVisitDetails(details);
      setShowDetailsModal(true);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch visit details');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedVisitDetails(null);
  };

  const handleRegisterTechnician = async () => {
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
      const registerData: TechnicianRegisterRequest = {
        name,
        email,
        mobileNumber,
        password,
        confirmPassword,
      };

      if (user?.id) {
        const response = await apiService.registerTechnician(user.id, registerData);

        if (response.success) {
          Alert.alert('Success', 'Technician registered successfully!');
          setFormData({
            name: '',
            email: '',
            mobileNumber: '',
            password: '',
            confirmPassword: '',
          });
          // Refresh the list if we're on that tab
          if (activeTab === 'technicians') {
            fetchCompanyTechnicians();
          }
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
      <Text style={styles.formTitle}>Register New Technician</Text>

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
        onPress={handleRegisterTechnician}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.registerButtonText}>Register Technician</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderTechniciansList = () => (
    <View style={styles.listContainer}>
      <Text style={styles.listTitle}>My Technicians</Text>

      {refreshing ? (
        <ActivityIndicator size="large" color="#10B981" style={styles.loader} />
      ) : technicians.length === 0 ? (
        <Text style={styles.emptyText}>No technicians registered yet</Text>
      ) : (
        technicians.map((technician) => (
          <View key={technician.id} style={styles.technicianCard}>
            <View style={styles.technicianInfo}>
              <Text style={styles.technicianName}>Name: {technician.name}</Text>
              <Text style={styles.technicianEmail}>Email: {technician.email}</Text>
              <Text style={styles.technicianPhone}>Phone: {technician.mobileNumber}</Text>
              <Text style={styles.technicianPhone}>
                Created At: {new Date(technician.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
              {technician.referCode && (
                <Text style={styles.technicianCode}>Code: {technician.referCode}</Text>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderSiteVisitsList = () => (
    <View style={styles.listContainer}>
      <Text style={styles.listTitle}>Site Visits</Text>

      {refreshing ? (
        <ActivityIndicator size="large" color="#10B981" style={styles.loader} />
      ) : siteVisits.length === 0 ? (
        <Text style={styles.emptyText}>No site visits recorded yet</Text>
      ) : (
        siteVisits.map((visit) => (
          <View key={visit.id} style={styles.visitCard}>
            <View style={styles.visitInfo}>
              <Text style={styles.visitName}>{visit.houseNo || 'Site Name'}</Text>
              <Text style={styles.visitAddress}>Address: {visit.houseNo}, {visit.street}, {visit.landmark}, {visit.area}</Text>
              <Text style={styles.techName}>Technician: {visit.technicianName}</Text>
              {/* <Text style={styles.technicianName}>{visit.technicianName}</Text> */}
              <Text style={styles.visitDate}>
                Date: {new Date(visit.visitDateTime).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
              {/* <Text style={styles.visitStatus}>Status: {visit.visitStatus}</Text> */}
            </View>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => handleViewDetails(visit.id)}
            >
              <Text style={styles.viewButtonText}>👁️ View Details</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );

  const renderDetailsModal = () => (
    <Modal
      visible={showDetailsModal}
      transparent
      animationType="slide"
      onRequestClose={handleCloseDetails}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Site Visit Details</Text>
            <TouchableOpacity onPress={handleCloseDetails}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.detailsScroll}>
            {selectedVisitDetails && (
              <>
                <View style={styles.detailsSection}>
                  <Text style={styles.detailsLabel}>Location Information</Text>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsKey}>Site Name:</Text>
                    <Text style={styles.detailsValue}>{selectedVisitDetails.houseNo}</Text>
                  </View>
                  {/* {selectedVisitDetails.houseNo && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsKey}>Address:</Text>
                      <Text style={styles.detailsValue}>{selectedVisitDetails.houseNo}, {selectedVisitDetails.street}, {selectedVisitDetails.landmark}, {selectedVisitDetails.area}</Text>
                    </View>
                  )} */}
                  {selectedVisitDetails.area && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsKey}>Area:</Text>
                      <Text style={styles.detailsValue}>{selectedVisitDetails.area}</Text>
                    </View>
                  )}
                  {selectedVisitDetails.street && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsKey}>Street:</Text>
                      <Text style={styles.detailsValue}>{selectedVisitDetails.street}</Text>
                    </View>
                  )}
                  {selectedVisitDetails.landmark && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsKey}>Landmark:</Text>
                      <Text style={styles.detailsValue}>{selectedVisitDetails.landmark}</Text>
                    </View>
                  )}
                  {selectedVisitDetails.city && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsKey}>City:</Text>
                      <Text style={styles.detailsValue}>{selectedVisitDetails.city}</Text>
                    </View>
                  )}
                  {selectedVisitDetails.state && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsKey}>State:</Text>
                      <Text style={styles.detailsValue}>{selectedVisitDetails.state}</Text>
                    </View>
                  )}
                  {selectedVisitDetails.pincode && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsKey}>Pincode:</Text>
                      <Text style={styles.detailsValue}>{selectedVisitDetails.pincode}</Text>
                    </View>
                  )}
                  {selectedVisitDetails.latitude && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsKey}>Latitude:</Text>
                      <Text style={styles.detailsValue}>{selectedVisitDetails.latitude}</Text>
                    </View>
                  )}
                  {selectedVisitDetails.longitude && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsKey}>Longitude:</Text>
                      <Text style={styles.detailsValue}>{selectedVisitDetails.longitude}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.detailsSection}>
                  <Text style={styles.detailsLabel}>Visit Information</Text>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsKey}>Date:</Text>
                    <Text style={styles.detailsValue}>
                      {new Date(selectedVisitDetails.visitDateTime).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsKey}>Time:</Text>
                    <Text style={styles.detailsValue}>
                      {new Date(selectedVisitDetails.visitDateTime).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </Text>
                  </View>
                  {/* <View style={styles.detailsRow}>
                    <Text style={styles.detailsKey}>Reason:</Text>
                    <Text style={styles.detailsValue}>{selectedVisitDetails.visitReason}</Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsKey}>Status:</Text>
                    <Text style={styles.detailsValue}>{selectedVisitDetails.visitStatus}</Text>
                  </View> */}
                  {/* <View style={styles.detailsRow}>
                    <Text style={styles.detailsKey}>Remarks:</Text>
                    <Text style={styles.detailsValue}>{selectedVisitDetails.visitRemarks || 'N/A'}</Text>
                  </View> */}
                </View>

                {selectedVisitDetails.cableConnections && selectedVisitDetails.cableConnections.length > 0 && (
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsLabel}>Cable Connections</Text>
                    {selectedVisitDetails.cableConnections.map((cable, index) => (
                      <View key={index} style={styles.cableDetailsItem}>
                        <Text style={styles.cableDetailText}>Core #{cable.coreNumber}</Text>
                        <Text style={styles.cableDetailText}>{cable.fromColor} → {cable.toColor}</Text>
                        <Text style={styles.cableDetailText}>Reason: {cable.reason}</Text>
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
              </>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.closeModalButton} onPress={handleCloseDetails}>
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {user?.name || 'Company'}!</Text>
        <Text style={styles.role}>Company Account</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'register' && styles.activeTab]}
          onPress={() => setActiveTab('register')}
        >
          <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
            Register Technician
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
      </View>

      <ScrollView
        style={styles.scrollContent}
        refreshControl={
          activeTab !== 'register' ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={activeTab === 'technicians' ? fetchCompanyTechnicians : fetchCompanySiteVisits}
            />
          ) : undefined
        }
      >
        {activeTab === 'register' && renderRegisterForm()}
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
    backgroundColor: '#10B981',
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
    color: '#D1FAE5',
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
    borderBottomColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#10B981',
    fontWeight: '600',
  },
  scrollContent: {
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
    backgroundColor: '#10B981',
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
  technicianCard: {
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
  technicianInfo: {
    flex: 1,
  },
  technicianName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  technicianEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  technicianPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  technicianCode: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
    marginTop: 5,
  },
  visitCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  visitInfo: {
    flex: 1,
  },
  visitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  visitAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  techName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  visitDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  visitStatus: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
    marginTop: 5,
  },
  viewButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
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
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
  },
  detailsScroll: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  detailsSection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailsKey: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    width: '40%',
  },
  detailsValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  cableDetailsItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  cableDetailText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 3,
  },
  closeModalButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
  },
  closeModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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

