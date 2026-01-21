import { useAuth } from '@/src/context/AuthContext';
import { apiService } from '@/src/services/api/apiService';
import { Company, Distributor, DistributorRegisterRequest, SiteVisit, Technician } from '@/src/types';
import { getImageUrl } from '@/src/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
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
  TouchableWithoutFeedback,
  View,
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
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // Photo preview state
  const [selectedPhotoForPreview, setSelectedPhotoForPreview] = useState<{
    uri: string;
    date: string;
  } | null>(null);
  const [showPhotoPreviewModal, setShowPhotoPreviewModal] = useState(false);
  
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
    // Open modal immediately
    setSelectedVisitDetails(visit);
    setShowDetailsModal(true);
    setDetailsLoading(true);
    
    try {
      const details = await apiService.getSiteVisitById(visit.id);
      setSelectedVisitDetails(details);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch site visit details');
      console.error('Failed to load full details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedVisitDetails(null);
    setDetailsLoading(false);
  };

  // Photo preview functions
  const handleOpenPhotoPreview = (photo: any) => {
    const imageUri = photo.base64Data || getImageUrl(photo.photoUrl);
    const photoDate = new Date(photo.uploadedAt).toLocaleDateString('en-IN');
    
    setSelectedPhotoForPreview({
      uri: imageUri,
      date: photoDate
    });
    setShowPhotoPreviewModal(true);
  };

  const handleClosePhotoPreview = () => {
    setShowPhotoPreviewModal(false);
    setSelectedPhotoForPreview(null);
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

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderRegisterForm = () => (
    <View style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Register New Distributor</Text>
        <Text style={styles.sectionSubtitle}>Add new distributor to the system</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter distributor's full name"
          placeholderTextColor="#999"
          value={formData.name}
          onChangeText={(value) => updateField('name', value)}
          editable={!loading}
        />

        <Text style={styles.inputLabel}>Email Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email address"
          placeholderTextColor="#999"
          value={formData.email}
          onChangeText={(value) => updateField('email', value)}
          editable={!loading}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.inputLabel}>Mobile Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter mobile number"
          placeholderTextColor="#999"
          value={formData.mobileNumber}
          onChangeText={(value) => updateField('mobileNumber', value)}
          editable={!loading}
          keyboardType="phone-pad"
        />

        <Text style={styles.inputLabel}>Password *</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter password"
            placeholderTextColor="#999"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            editable={!loading}
            secureTextEntry
          />
        </View>

        <Text style={styles.inputLabel}>Confirm Password *</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm password"
            placeholderTextColor="#999"
            value={formData.confirmPassword}
            onChangeText={(value) => updateField('confirmPassword', value)}
            editable={!loading}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabled]}
          onPress={handleRegisterDistributor}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="person-add-outline" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Register Distributor</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDistributorList = () => (
    <View style={styles.listContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Distributors</Text>
        <Text style={styles.sectionSubtitle}>{distributors.length} distributor{distributors.length !== 1 ? 's' : ''} registered</Text>
      </View>

      {refreshing ? (
        <ActivityIndicator size="large" color="#EF4444" style={styles.loader} />
      ) : distributors.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyStateTitle}>No distributors yet</Text>
          <Text style={styles.emptyStateText}>Register your first distributor to get started</Text>
        </View>
      ) : (
        distributors.map((distributor) => (
          <View key={distributor.id} style={styles.distributorCard}>
            <View style={styles.distributorHeader}>
              <View style={styles.distributorIcon}>
                <Ionicons name="person-circle-outline" size={24} color="#EF4444" />
              </View>
              <View style={styles.distributorInfo}>
                <Text style={styles.distributorName}>{distributor.name}</Text>
                <Text style={styles.distributorEmail}>{distributor.email}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.distributorDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={16} color="#8E8E93" />
                <Text style={styles.detailText}>{distributor.mobileNumber}</Text>
              </View>
              
              {distributor.referCode && (
                <View style={styles.referCodeContainer}>
                  <Text style={styles.referCodeLabel}>Referral Code:</Text>
                  <View style={styles.referCodeBadge}>
                    <Text style={styles.referCodeText}>{distributor.referCode}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderCompaniesList = () => (
    <View style={styles.listContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Companies</Text>
        <Text style={styles.sectionSubtitle}>{companies.length} compan{companies.length !== 1 ? 'ies' : 'y'} registered</Text>
      </View>

      {refreshing ? (
        <ActivityIndicator size="large" color="#EF4444" style={styles.loader} />
      ) : companies.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="business-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyStateTitle}>No companies yet</Text>
          <Text style={styles.emptyStateText}>Companies will appear here once distributors register them</Text>
        </View>
      ) : (
        companies.map((company) => (
          <View key={company.id} style={styles.companyCard}>
            <View style={styles.companyHeader}>
              <View style={styles.companyIcon}>
                <Ionicons name="business" size={20} color="#EF4444" />
              </View>
              <View style={styles.companyTitleContainer}>
                <Text style={styles.companyName} numberOfLines={1}>
                  {company.companyName}
                </Text>
                <Text style={styles.companyEmail}>{company.companyEmail}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.companyDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={16} color="#8E8E93" />
                <Text style={styles.detailText}>{company.mobileNumber}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={16} color="#8E8E93" />
                <Text style={styles.detailText} numberOfLines={1}>
                  {company.companyAddress}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="document-outline" size={16} color="#8E8E93" />
                <Text style={styles.detailText}>GST: {company.gstNumber}</Text>
              </View>
              
              {company.referCode && (
                <View style={styles.referCodeContainer}>
                  <Text style={styles.referCodeLabel}>Referral Code:</Text>
                  <View style={styles.referCodeBadge}>
                    <Text style={styles.referCodeText}>{company.referCode}</Text>
                  </View>
                </View>
              )}
              
              <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={16} color="#8E8E93" />
                <Text style={styles.detailText}>
                  {company.technicianCount} technician{company.technicianCount !== 1 ? 's' : ''}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="person-outline" size={16} color="#8E8E93" />
                <Text style={styles.detailText}>
                  Distributor: {company.distributorName || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderTechniciansList = () => (
    <View style={styles.listContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Technicians</Text>
        <Text style={styles.sectionSubtitle}>{technicians.length} technician{technicians.length !== 1 ? 's' : ''} registered</Text>
      </View>

      {refreshing ? (
        <ActivityIndicator size="large" color="#EF4444" style={styles.loader} />
      ) : technicians.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="construct-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyStateTitle}>No technicians yet</Text>
          <Text style={styles.emptyStateText}>Technicians will appear here once companies register them</Text>
        </View>
      ) : (
        technicians.map((technician) => (
          <View key={technician.id} style={styles.technicianCard}>
            <View style={styles.technicianHeader}>
              <View style={styles.technicianIcon}>
                <Ionicons name="person-circle-outline" size={24} color="#EF4444" />
              </View>
              <View style={styles.technicianInfo}>
                <Text style={styles.technicianName}>{technician.name}</Text>
                <Text style={styles.technicianEmail}>{technician.email}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.technicianDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={16} color="#8E8E93" />
                <Text style={styles.detailText}>{technician.mobileNumber}</Text>
              </View>
              
              {technician.referCode && (
                <View style={styles.referCodeContainer}>
                  <Text style={styles.referCodeLabel}>Referral Code:</Text>
                  <View style={styles.referCodeBadge}>
                    <Text style={styles.referCodeText}>{technician.referCode}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderSiteVisitsList = () => (
    <View style={styles.listContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Site Visits</Text>
        <Text style={styles.sectionSubtitle}>{siteVisits.length} visit{siteVisits.length !== 1 ? 's' : ''} recorded</Text>
      </View>

      {refreshing ? (
        <ActivityIndicator size="large" color="#EF4444" style={styles.loader} />
      ) : siteVisits.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyStateTitle}>No visits yet</Text>
          <Text style={styles.emptyStateText}>Site visits will appear here once technicians start visiting</Text>
        </View>
      ) : (
        siteVisits.map((visit, index) => (
          <View key={visit.id} style={styles.visitCard}>
            <View style={styles.visitHeader}>
              <View style={styles.visitNumber}>
                <Text style={styles.visitNumberText}>#{siteVisits.length - index}</Text>
              </View>
              <View style={styles.visitDateBadge}>
                <Text style={styles.visitDateText}>
                  {new Date(visit.visitDateTime).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short'
                  })}
                </Text>
              </View>
            </View>
            
            <Text style={styles.visitAddress}>{visit.houseNo}</Text>
            
            <View style={styles.visitInfo}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.visitInfoText}>
                {visit.street}, {visit.area}
              </Text>
            </View>
            
            <View style={styles.visitInfo}>
              <Ionicons name="person-outline" size={16} color="#666" />
              <Text style={styles.visitInfoText}>{visit.technicianName}</Text>
            </View>
            
            <View style={styles.visitInfo}>
              <Ionicons name="business-outline" size={16} color="#666" />
              <Text style={styles.visitInfoText}>Company: {visit.companyName}</Text>
            </View>
            
            {visit.cableConnections && visit.cableConnections.length > 0 && (
              <View style={styles.visitInfo}>
                <Ionicons name="git-branch-outline" size={16} color="#666" />
                <Text style={styles.visitInfoText}>
                  {visit.cableConnections.length} cable connection{visit.cableConnections.length > 1 ? 's' : ''}
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => handleViewSiteVisitDetails(visit)}
            >
              <Ionicons name="eye-outline" size={16} color="#007AFF" />
              <Text style={styles.viewDetailsButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );

  const renderPhotoPreviewModal = () => (
    <Modal
      visible={showPhotoPreviewModal}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClosePhotoPreview}
    >
      <TouchableWithoutFeedback onPress={handleClosePhotoPreview}>
        <View style={styles.photoPreviewOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.photoPreviewContainer}>
              {selectedPhotoForPreview && (
                <>
                  <Image
                    source={{ uri: selectedPhotoForPreview.uri }}
                    style={styles.photoPreviewImage}
                    resizeMode="contain"
                  />
                  <View style={styles.photoPreviewHeader}>
                    <Text style={styles.photoPreviewDate}>
                      Uploaded: {selectedPhotoForPreview.date}
                    </Text>
                    <TouchableOpacity
                      style={styles.photoPreviewCloseButton}
                      onPress={handleClosePhotoPreview}
                    >
                      <Ionicons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderDetailsModal = () => (
    <Modal
      visible={showDetailsModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Visit Details</Text>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={handleCloseDetailsModal}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {detailsLoading ? (
              // Skeleton Loader
              <View style={styles.skeletonContainer}>
                {/* Basic Info Skeleton */}
                {selectedVisitDetails && (
                  <View style={styles.skeletonBasicInfo}>
                    <View style={styles.skeletonAddress}>
                      <View style={styles.skeletonAddressTitle} />
                      <View style={styles.skeletonAddressText} />
                    </View>
                    <View style={styles.skeletonTechnicianInfo}>
                      <View style={styles.skeletonTechnicianItem} />
                      <View style={styles.skeletonTechnicianItem} />
                    </View>
                  </View>
                )}

                {/* Location Section Skeleton */}
                <View style={styles.skeletonSection}>
                  <View style={styles.skeletonTitle} />
                  <View style={styles.skeletonGrid}>
                    {[...Array(7)].map((_, i) => (
                      <View key={i} style={styles.skeletonItem}>
                        <View style={styles.skeletonLabel} />
                        <View style={styles.skeletonValue} />
                      </View>
                    ))}
                  </View>
                  <View style={styles.skeletonCoordinates}>
                    <View style={styles.skeletonCoordinate} />
                    <View style={styles.skeletonDivider} />
                    <View style={styles.skeletonCoordinate} />
                  </View>
                </View>

                {/* Cable Connections Skeleton */}
                <View style={styles.skeletonSection}>
                  <View style={styles.skeletonTitle} />
                  {[...Array(2)].map((_, i) => (
                    <View key={i} style={styles.skeletonCableDetail}>
                      <View style={styles.skeletonCableHeader} />
                      <View style={styles.skeletonCableFlow} />
                      <View style={styles.skeletonCableReason} />
                    </View>
                  ))}
                </View>

                {/* Photos Section Skeleton */}
                <View style={styles.skeletonSection}>
                  <View style={styles.skeletonTitle} />
                  <View style={styles.skeletonPhotos}>
                    {[...Array(3)].map((_, i) => (
                      <View key={i} style={styles.skeletonPhotoContainer}>
                        <View style={styles.skeletonPhoto} />
                        <View style={styles.skeletonPhotoDate} />
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ) : selectedVisitDetails && (
              <>
                {/* Basic Info */}
                <View style={styles.basicInfoSection}>
                  <Text style={styles.basicInfoTitle}>{selectedVisitDetails.houseNo}</Text>
                  <Text style={styles.basicInfoSubtitle}>
                    {selectedVisitDetails.street}, {selectedVisitDetails.city}
                  </Text>
                  <Text style={styles.basicInfoDate}>
                    Created: {selectedVisitDetails.createdAt ? new Date(selectedVisitDetails.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                  </Text>
                  <View style={styles.basicInfoRow}>
                    <Text style={styles.basicInfoLabel}>Technician:</Text>
                    <Text style={styles.basicInfoValue}>{selectedVisitDetails.technicianName}</Text>
                  </View>
                  <View style={styles.basicInfoRow}>
                    <Text style={styles.basicInfoLabel}>Company:</Text>
                    <Text style={styles.basicInfoValue}>{selectedVisitDetails.companyName}</Text>
                  </View>
                </View>

                {/* Location Details */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Location</Text>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>House No</Text>
                      <Text style={styles.detailValue}>{selectedVisitDetails.houseNo}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Street</Text>
                      <Text style={styles.detailValue}>{selectedVisitDetails.street}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Area</Text>
                      <Text style={styles.detailValue}>{selectedVisitDetails.area}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Landmark</Text>
                      <Text style={styles.detailValue}>{selectedVisitDetails.landmark || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>City</Text>
                      <Text style={styles.detailValue}>{selectedVisitDetails.city}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>State</Text>
                      <Text style={styles.detailValue}>{selectedVisitDetails.state}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Pincode</Text>
                      <Text style={styles.detailValue}>{selectedVisitDetails.pincode}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.coordinates}>
                    <View style={styles.coordinate}>
                      <Text style={styles.coordinateLabel}>Latitude</Text>
                      <Text style={styles.coordinateValue}>{selectedVisitDetails.latitude}</Text>
                    </View>
                    <View style={styles.coordinateDivider} />
                    <View style={styles.coordinate}>
                      <Text style={styles.coordinateLabel}>Longitude</Text>
                      <Text style={styles.coordinateValue}>{selectedVisitDetails.longitude}</Text>
                    </View>
                  </View>
                </View>

                {/* Cable Connections */}
                {selectedVisitDetails.cableConnections && selectedVisitDetails.cableConnections.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>
                      Cable Connections ({selectedVisitDetails.cableConnections.length})
                    </Text>
                    {selectedVisitDetails.cableConnections.map((cable, index) => (
                      <View key={index} style={styles.cableDetail}>
                        <View style={styles.cableDetailHeader}>
                          <Text style={styles.cableDetailTitle}>Core {cable.coreNumber}</Text>
                        </View>
                        <View style={styles.cableDetailContent}>
                          <View style={styles.cableFlow}>
                            <View style={styles.colorBox}>
                              <Text style={styles.colorLabel}>FROM</Text>
                              <Text style={styles.colorValue}>{cable.fromColor}</Text>
                            </View>
                            <Ionicons name="arrow-forward" size={20} color="#666" />
                            <View style={styles.colorBox}>
                              <Text style={styles.colorLabel}>TO</Text>
                              <Text style={styles.colorValue}>{cable.toColor}</Text>
                            </View>
                          </View>
                          <Text style={styles.reasonText}>{cable.reason}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Photos */}
                {selectedVisitDetails.photos && selectedVisitDetails.photos.length > 0 && (
                  <View style={styles.modalSection}>
                    <View style={styles.photosSectionHeader}>
                      <Text style={styles.modalSectionTitle}>
                        Photos ({selectedVisitDetails.photos.length})
                      </Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {selectedVisitDetails.photos.map((photo, index) => {
                        const imageUri = photo.base64Data || getImageUrl(photo.photoUrl);
                        const photoDate = new Date(photo.uploadedAt).toLocaleDateString('en-IN');
                        
                        return (
                          <TouchableOpacity
                            key={index}
                            style={styles.photoContainer}
                            onPress={() => handleOpenPhotoPreview(photo)}
                            activeOpacity={0.8}
                          >
                            <Image
                              source={{ uri: imageUri }}
                              style={styles.photo}
                              onError={(error) => console.error('Failed to load image:', error.nativeEvent)}
                            />
                            <View style={styles.photoInfo}>
                              <Text style={styles.photoIndex}>#{index + 1}</Text>
                              <Text style={styles.photoDate}>{photoDate}</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome back</Text>
          <Text style={styles.userName}>{user?.name || "Admin"}</Text>
        </View>
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <ScrollView
          ref={tabScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContentContainer}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === 'register' && styles.activeTab]}
            onPress={() => setActiveTab('register')}
          >
            <Ionicons 
              name="person-add-outline" 
              size={20} 
              color={activeTab === 'register' ? "#EF4444" : "#8E8E93"} 
            />
            <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
              Register
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'distributors' && styles.activeTab]}
            onPress={() => setActiveTab('distributors')}
          >
            <Ionicons 
              name="people-outline" 
              size={20} 
              color={activeTab === 'distributors' ? "#EF4444" : "#8E8E93"} 
            />
            <Text style={[styles.tabText, activeTab === 'distributors' && styles.activeTabText]}>
              Distributors ({distributors.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'companies' && styles.activeTab]}
            onPress={() => setActiveTab('companies')}
          >
            <Ionicons 
              name="business-outline" 
              size={20} 
              color={activeTab === 'companies' ? "#EF4444" : "#8E8E93"} 
            />
            <Text style={[styles.tabText, activeTab === 'companies' && styles.activeTabText]}>
              Companies ({companies.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'technicians' && styles.activeTab]}
            onPress={() => setActiveTab('technicians')}
          >
            <Ionicons 
              name="construct-outline" 
              size={20} 
              color={activeTab === 'technicians' ? "#EF4444" : "#8E8E93"} 
            />
            <Text style={[styles.tabText, activeTab === 'technicians' && styles.activeTabText]}>
              Technicians ({technicians.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'siteVisits' && styles.activeTab]}
            onPress={() => setActiveTab('siteVisits')}
          >
            <Ionicons 
              name="document-text-outline" 
              size={20} 
              color={activeTab === 'siteVisits' ? "#EF4444" : "#8E8E93"} 
            />
            <Text style={[styles.tabText, activeTab === 'siteVisits' && styles.activeTabText]}>
              Visits ({siteVisits.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      {activeTab === 'register' && (
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {renderRegisterForm()}
        </ScrollView>
      )}
      
      {activeTab === 'distributors' && (
        <ScrollView
          style={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchDistributors}
              tintColor="#EF4444"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderDistributorList()}
        </ScrollView>
      )}
      
      {activeTab === 'companies' && (
        <ScrollView
          style={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchCompanies}
              tintColor="#EF4444"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderCompaniesList()}
        </ScrollView>
      )}
      
      {activeTab === 'technicians' && (
        <ScrollView
          style={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchTechnicians}
              tintColor="#EF4444"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderTechniciansList()}
        </ScrollView>
      )}
      
      {activeTab === 'siteVisits' && (
        <ScrollView
          style={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchAllSiteVisits}
              tintColor="#EF4444"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderSiteVisitsList()}
        </ScrollView>
      )}

      {renderDetailsModal()}
      {renderPhotoPreviewModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  welcome: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  logout: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tabContentContainer: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#EF4444',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  content: {
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
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1D1D1F',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 16,
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: '#1D1D1F',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
  listContainer: {
    padding: 20,
  },
  loader: {
    marginTop: 60,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  distributorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  distributorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  distributorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  distributorInfo: {
    flex: 1,
  },
  distributorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  distributorEmail: {
    fontSize: 14,
    color: '#8E8E93',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginBottom: 12,
  },
  distributorDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#1D1D1F',
  },
  referCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  referCodeLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  referCodeBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  referCodeText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '500',
  },
  companyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyTitleContainer: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  companyEmail: {
    fontSize: 14,
    color: '#8E8E93',
  },
  companyDetails: {
    gap: 8,
  },
  technicianCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  technicianHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  technicianIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  technicianInfo: {
    flex: 1,
  },
  technicianName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  technicianEmail: {
    fontSize: 14,
    color: '#8E8E93',
  },
  technicianDetails: {
    gap: 8,
    marginBottom: 12,
  },
  visitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  visitNumber: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  visitNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  visitDateBadge: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  visitDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  visitAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  visitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  visitInfoText: {
    fontSize: 14,
    color: '#666',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  viewDetailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
  },
  // Skeleton Loader Styles
  skeletonContainer: {
    padding: 4,
  },
  skeletonBasicInfo: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  skeletonAddress: {
    marginBottom: 12,
  },
  skeletonAddressTitle: {
    height: 24,
    backgroundColor: '#E5E5EA',
    borderRadius: 6,
    marginBottom: 8,
    width: '60%',
  },
  skeletonAddressText: {
    height: 16,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    width: '80%',
  },
  skeletonTechnicianInfo: {
    gap: 8,
  },
  skeletonTechnicianItem: {
    height: 14,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    width: '50%',
  },
  skeletonSection: {
    marginBottom: 24,
  },
  skeletonTitle: {
    height: 24,
    backgroundColor: '#E5E5EA',
    borderRadius: 6,
    marginBottom: 16,
    width: '40%',
  },
  skeletonGrid: {
    gap: 12,
  },
  skeletonItem: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
  },
  skeletonLabel: {
    height: 12,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginBottom: 8,
    width: '30%',
  },
  skeletonValue: {
    height: 16,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    width: '70%',
  },
  skeletonCoordinates: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
  },
  skeletonCoordinate: {
    flex: 1,
    height: 40,
    backgroundColor: '#E5E5EA',
    borderRadius: 6,
  },
  skeletonDivider: {
    width: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  skeletonCableDetail: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#E5E5EA',
  },
  skeletonCableHeader: {
    height: 16,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginBottom: 12,
    width: '40%',
  },
  skeletonCableFlow: {
    height: 40,
    backgroundColor: '#E5E5EA',
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonCableReason: {
    height: 12,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    width: '60%',
  },
  skeletonPhotos: {
    flexDirection: 'row',
  },
  skeletonPhotoContainer: {
    marginRight: 12,
    alignItems: 'center',
  },
  skeletonPhoto: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
  },
  skeletonPhotoDate: {
    height: 12,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginTop: 6,
    width: 80,
  },
  
  // Basic Info Section Styles
  basicInfoSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  basicInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  basicInfoSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  basicInfoDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  basicInfoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  basicInfoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    width: 80,
  },
  basicInfoValue: {
    fontSize: 13,
    color: '#1D1D1F',
    flex: 1,
  },
  
  // Modal Content Styles
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  detailGrid: {
    gap: 12,
  },
  detailItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  coordinates: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  coordinate: {
    flex: 1,
    alignItems: 'center',
  },
  coordinateDivider: {
    width: 1,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
  },
  coordinateLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 4,
  },
  coordinateValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  cableDetail: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#34C759',
  },
  cableDetailHeader: {
    marginBottom: 12,
  },
  cableDetailTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#34C759',
  },
  cableDetailContent: {
    gap: 8,
  },
  cableFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  colorLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 4,
  },
  colorValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  reasonText: {
    fontSize: 13,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  photosSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoContainer: {
    marginRight: 12,
    alignItems: 'center',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#F1F1F1',
  },
  photoInfo: {
    marginTop: 8,
    alignItems: 'center',
  },
  photoIndex: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 2,
  },
  photoDate: {
    fontSize: 11,
    color: '#8E8E93',
  },
  
  // Photo Preview Modal Styles
  photoPreviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPreviewContainer: {
    width: '95%',
    height: '85%',
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoPreviewImage: {
    width: '100%',
    height: '80%',
  },
  photoPreviewHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  photoPreviewDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  photoPreviewCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});