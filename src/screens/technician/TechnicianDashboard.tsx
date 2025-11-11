import { useAuth } from '@/src/context/AuthContext';
import { apiService } from '@/src/services/api/apiService';
import apiClient from '@/src/services/api/client';
import { CableConnection, SiteVisit, SiteVisitPhase1Request } from '@/src/types';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
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

export const TechnicianDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'newVisit' | 'myVisits'>('newVisit');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [selectedVisitForPhotos, setSelectedVisitForPhotos] = useState<SiteVisit | null>(null);
  const [showPhase2Modal, setShowPhase2Modal] = useState(false);
  const [selectedVisitDetails, setSelectedVisitDetails] = useState<SiteVisit | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Phase 1 form state
  const [phase1Data, setPhase1Data] = useState({
    latitude: '',
    longitude: '',
    houseNo: '',
    area: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [cableConnections, setCableConnections] = useState<CableConnection[]>([]);
  const [currentCable, setCurrentCable] = useState({
    coreNumber: '',
    fromColor: '',
    toColor: '',
    reason: '',
  });

  // Phase 2 form state
  const [photosData, setPhotosData] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [uploadedVisitIds, setUploadedVisitIds] = useState<number[]>([]);

  useEffect(() => {
    if (activeTab === 'myVisits') {
      fetchTechnicianVisits();
    }
  }, [activeTab]);

  const fetchTechnicianVisits = async () => {
    try {
      setRefreshing(true);
      if (user?.id) {
        const data = await apiService.getSiteVisitsByTechnician(user.id);
        setVisits(data);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch visits');
    } finally {
      setRefreshing(false);
    }
  };

  const handlePhase1Submit = async () => {
    const { latitude, longitude, houseNo, area, street, landmark, city, state, pincode } = phase1Data;

    if (!latitude || !longitude || !houseNo || !area || !street || !city || !state || !pincode) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (cableConnections.length === 0) {
      Alert.alert('Error', 'Please add at least one cable connection');
      return;
    }

    setLoading(true);
    try {
      const payload: SiteVisitPhase1Request = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        houseNo,
        area,
        street,
        landmark,
        city,
        state,
        pincode,
        cableConnections,
      };

      if (user?.id) {
        const response = await apiService.createSiteVisit(user.id, payload as any);

        if (response) {
          Alert.alert('Success', 'Site visit created successfully!');
          // Reset form
          setPhase1Data({
            latitude: '',
            longitude: '',
            houseNo: '',
            area: '',
            street: '',
            landmark: '',
            city: '',
            state: '',
            pincode: '',
          });
          setCableConnections([]);
          setCurrentCable({
            coreNumber: '',
            fromColor: '',
            toColor: '',
            reason: '',
          });
          // Refresh visits list
          fetchTechnicianVisits();
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create site visit');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCableConnection = () => {
    const { coreNumber, fromColor, toColor, reason } = currentCable;

    if (!coreNumber || !fromColor || !toColor || !reason) {
      Alert.alert('Error', 'Please fill in all cable connection fields');
      return;
    }

    const newConnection: CableConnection = {
      coreNumber: parseInt(coreNumber),
      fromColor,
      toColor,
      reason,
    };

    setCableConnections([...cableConnections, newConnection]);
    setCurrentCable({
      coreNumber: '',
      fromColor: '',
      toColor: '',
      reason: '',
    });
  };

  const handleRemoveCableConnection = (index: number) => {
    setCableConnections(cableConnections.filter((_, i) => i !== index));
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedPhotos(result.assets);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const handlePhase2Submit = async () => {
    if (!selectedVisitForPhotos) {
      Alert.alert('Error', 'Please select a site visit first');
      return;
    }

    if (selectedPhotos.length === 0) {
      Alert.alert('Error', 'Please select at least one photo');
      return;
    }

    setLoading(true);
    try {
      // Convert selected photos to File objects
      const formData = new FormData();

      for (const photo of selectedPhotos) {
        const filename = photo.uri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('photos', {
          uri: photo.uri,
          name: filename,
          type: type,
        } as any);
      }

      const response = await apiClient.post(
        `/api/SiteVisits/${selectedVisitForPhotos.id}/photos`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response) {
        Alert.alert('Success', 'Photos uploaded successfully!');
        setSelectedPhotos([]);
        setPhotosData('');
        setSelectedVisitForPhotos(null);
        setShowPhase2Modal(false);
        // Mark this visit as uploaded
        setUploadedVisitIds([...uploadedVisitIds, selectedVisitForPhotos.id]);
        // Refresh the visits list
        fetchTechnicianVisits();
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to upload photos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPhase2 = (visit: SiteVisit) => {
    setSelectedVisitForPhotos(visit);
    setPhotosData('');
    setShowPhase2Modal(true);
  };

  const handleClosePhase2 = () => {
    setShowPhase2Modal(false);
    setSelectedVisitForPhotos(null);
    setPhotosData('');
    setSelectedPhotos([]);
  };

  const handleViewDetails = async (visit: SiteVisit) => {
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

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedVisitDetails(null);
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('/landing');
  };

  const updatePhase1Field = (field: keyof typeof phase1Data, value: string) => {
    setPhase1Data((prev) => ({ ...prev, [field]: value }));
  };

  const updateCableField = (field: keyof typeof currentCable, value: string) => {
    setCurrentCable((prev) => ({ ...prev, [field]: value }));
  };

  const renderPhase1Form = () => (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formTitle}>📍 Phase 1: Site Location & Cable Details</Text>

      <Text style={styles.sectionLabel}>Location Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Latitude"
        placeholderTextColor="#999"
        value={phase1Data.latitude}
        onChangeText={(value) => updatePhase1Field('latitude', value)}
        keyboardType="decimal-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Longitude"
        placeholderTextColor="#999"
        value={phase1Data.longitude}
        onChangeText={(value) => updatePhase1Field('longitude', value)}
        keyboardType="decimal-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="House No & Society Name"
        placeholderTextColor="#999"
        value={phase1Data.houseNo}
        onChangeText={(value) => updatePhase1Field('houseNo', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Street"
        placeholderTextColor="#999"
        value={phase1Data.street}
        onChangeText={(value) => updatePhase1Field('street', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Landmark"
        placeholderTextColor="#999"
        value={phase1Data.landmark}
        onChangeText={(value) => updatePhase1Field('landmark', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Area"
        placeholderTextColor="#999"
        value={phase1Data.area}
        onChangeText={(value) => updatePhase1Field('area', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="City"
        placeholderTextColor="#999"
        value={phase1Data.city}
        onChangeText={(value) => updatePhase1Field('city', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="State"
        placeholderTextColor="#999"
        value={phase1Data.state}
        onChangeText={(value) => updatePhase1Field('state', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Pincode"
        placeholderTextColor="#999"
        value={phase1Data.pincode}
        onChangeText={(value) => updatePhase1Field('pincode', value)}
        keyboardType="numeric"
      />

      <Text style={styles.sectionLabel}>Cable Connections</Text>
      <TextInput
        style={styles.input}
        placeholder="Core Number"
        placeholderTextColor="#999"
        value={currentCable.coreNumber}
        onChangeText={(value) => updateCableField('coreNumber', value)}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="From Color"
        placeholderTextColor="#999"
        value={currentCable.fromColor}
        onChangeText={(value) => updateCableField('fromColor', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="To Color"
        placeholderTextColor="#999"
        value={currentCable.toColor}
        onChangeText={(value) => updateCableField('toColor', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Reason"
        placeholderTextColor="#999"
        value={currentCable.reason}
        onChangeText={(value) => updateCableField('reason', value)}
      />

      <TouchableOpacity
        style={[styles.addButton, loading && styles.buttonDisabled]}
        onPress={handleAddCableConnection}
        disabled={loading}
      >
        <Text style={styles.addButtonText}>+ Add Cable Connection</Text>
      </TouchableOpacity>

      {cableConnections.length > 0 && (
        <View style={styles.cableListContainer}>
          <Text style={styles.cableListTitle}>Added Connections ({cableConnections.length})</Text>
          {cableConnections.map((cable, index) => (
            <View key={index} style={styles.cableItem}>
              <View style={styles.cableInfo}>
                <Text style={styles.cableText}>Core: {cable.coreNumber}</Text>
                <Text style={styles.cableText}>{cable.fromColor} → {cable.toColor}</Text>
                <Text style={styles.cableText}>Reason: {cable.reason}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleRemoveCableConnection(index)}
              >
                <Text style={styles.deleteButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.registerButton, loading && styles.buttonDisabled]}
        onPress={handlePhase1Submit}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.registerButtonText}>Complete Phase 1</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderMyVisitsList = () => (
    <View style={styles.listContainer}>
      <Text style={styles.listTitle}>📋 My Site Visits</Text>

      {refreshing ? (
        <ActivityIndicator size="large" color="#F59E0B" style={styles.loader} />
      ) : visits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No site visits yet</Text>
          <Text style={styles.emptySubtext}>Create a new site visit to get started</Text>
        </View>
      ) : (
        visits.map((visit, index) => (
          <View key={visit.id} style={styles.visitCard}>
            <View style={styles.visitHeader}>
              <View style={styles.visitNumberBadge}>
                <Text style={styles.visitNumberText}>#{visits.length - index}</Text>
              </View>
            </View>

            <View style={styles.visitInfo}>
              <Text style={styles.visitSite}>{visit.houseNo}</Text>
              <Text style={styles.visitDate}>📌 {visit.street}</Text>
              <Text style={styles.visitCompany}>📍 {visit.city}, {visit.state}</Text>
              {visit.cableConnections && visit.cableConnections.length > 0 && (
                <Text style={styles.visitRemarks}>
                  🔌 {visit.cableConnections.length} cable connection(s)
                </Text>
              )}
            </View>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.viewButton]}
                onPress={() => handleViewDetails(visit)}
              >
                <Text style={styles.actionButtonText}>👁️ View</Text>
              </TouchableOpacity>
              {uploadedVisitIds.includes(visit.id) ? (
                <View style={[styles.actionButton, styles.completedButton]}>
                  <Text style={styles.actionButtonText}>✅ Completed</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.actionButton, styles.uploadButton]}
                  onPress={() => handleOpenPhase2(visit)}
                >
                  <Text style={styles.actionButtonText}>📸 Upload</Text>
                </TouchableOpacity>
              )}
            </View>
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
            onPress={handleCloseDetails}
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
                  <Text style={styles.detailsKey}>Street:</Text>
                  <Text style={styles.detailsValue}>{selectedVisitDetails.street}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsKey}>Landmark:</Text>
                  <Text style={styles.detailsValue}>{selectedVisitDetails.landmark}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsKey}>Area:</Text>
                  <Text style={styles.detailsValue}>{selectedVisitDetails.area}</Text>
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
            style={styles.cancelButton}
            onPress={handleCloseDetails}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  const renderPhase2Modal = () => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>📸 Upload Photos</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClosePhase2}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody}>
          {selectedVisitForPhotos && (
            <View style={styles.selectedVisitInfo}>
              <Text style={styles.selectedVisitTitle}>Site Visit Details:</Text>
              <Text style={styles.selectedVisitText}>
                📍 {selectedVisitForPhotos.houseNo}, {selectedVisitForPhotos.area}
              </Text>
              <Text style={styles.selectedVisitText}>
                📌 {selectedVisitForPhotos.street}
              </Text>
              <Text style={styles.selectedVisitText}>
                🏙️ {selectedVisitForPhotos.city}, {selectedVisitForPhotos.state}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.pickPhotosButton, loading && styles.buttonDisabled]}
            onPress={pickImages}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.pickPhotosButtonText}>📁 Select Photos from Device</Text>
          </TouchableOpacity>

          {selectedPhotos.length > 0 && (
            <View style={styles.selectedPhotosContainer}>
              <Text style={styles.sectionLabel}>Selected Photos ({selectedPhotos.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
                {selectedPhotos.map((photo, index) => (
                  <View key={index} style={styles.photoPreviewContainer}>
                    <Image
                      source={{ uri: photo.uri }}
                      style={styles.photoPreview}
                    />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => {
                        setSelectedPhotos(selectedPhotos.filter((_, i) => i !== index));
                      }}
                    >
                      <Text style={styles.removePhotoButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <TouchableOpacity
            style={[styles.registerButton, (loading || selectedPhotos.length === 0) && styles.buttonDisabled]}
            onPress={handlePhase2Submit}
            disabled={loading || selectedPhotos.length === 0}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Upload Images</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClosePhase2}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Hello, {user?.name || 'Technician'} 👷‍♂️</Text>
          <Text style={styles.role}>Site Visit Management</Text>
        </View>
        <View style={styles.headerDecoration} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'newVisit' && styles.activeTab]}
          onPress={() => setActiveTab('newVisit')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'newVisit' && styles.activeTabText]}>
            ➕  New Visit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'myVisits' && styles.activeTab]}
          onPress={() => setActiveTab('myVisits')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'myVisits' && styles.activeTabText]}>
            📋 My Visits
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scrollContent}>
        {activeTab === 'newVisit' && renderPhase1Form()}
        {activeTab === 'myVisits' && (
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={fetchTechnicianVisits}
                tintColor="#F59E0B"
                colors={['#F59E0B']}
              />
            }
          >
            {renderMyVisitsList()}
          </ScrollView>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>

      {showPhase2Modal && renderPhase2Modal()}
      {showDetailsModal && renderDetailsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  header: {
    backgroundColor: '#F59E0B',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    zIndex: 1,
  },
  headerDecoration: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(251, 146, 60, 0.3)',
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  role: {
    fontSize: 14,
    color: '#FEF3C7',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE4CC',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#F59E0B',
    backgroundColor: '#FFF7ED',
  },
  tabText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#F59E0B',
    fontWeight: '700',
  },
  scrollContent: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#FFE4CC',
    color: '#333',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cableListContainer: {
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FFE4CC',
  },
  cableListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  cableItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  cableInfo: {
    flex: 1,
  },
  cableText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
    elevation: 0,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  listContainer: {
    padding: 20,
  },
  listTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 15,
    opacity: 0.5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#bbb',
    fontSize: 14,
  },
  visitCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  visitNumberBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  visitNumberText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
  },
  visitInfo: {
    flex: 1,
    marginBottom: 12,
  },
  visitSite: {
    fontSize: 19,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  visitCompany: {
    fontSize: 15,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  visitDate: {
    fontSize: 15,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  visitRemarks: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
    fontStyle: 'italic',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#3B82F6',
  },
  uploadButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  selectedVisitInfo: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  selectedVisitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectedVisitText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
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
    borderBottomColor: '#FFE4CC',
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
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logoutText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detailsSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
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
    borderBottomColor: '#E5E7EB',
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
  pickPhotosButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#1E40AF',
  },
  pickPhotosButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedPhotosContainer: {
    marginBottom: 15,
  },
  photosScroll: {
    marginVertical: 10,
  },
  photoPreviewContainer: {
    position: 'relative',
    marginRight: 10,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  completedButton: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
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

