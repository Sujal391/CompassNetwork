import { useAuth } from '@/src/context/AuthContext';
import { apiService } from '@/src/services/api/apiService';
import apiClient from '@/src/services/api/client';
import { CableConnection, SiteVisit, SiteVisitPhase1Request } from '@/src/types';
import { getImageUrl } from '@/src/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

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
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Photo preview state
  const [selectedPhotoForPreview, setSelectedPhotoForPreview] = useState<{
    uri: string;
    date: string;
  } | null>(null);
  const [showPhotoPreviewModal, setShowPhotoPreviewModal] = useState(false);

  // Loading state for details modal
  const [detailsLoading, setDetailsLoading] = useState(false);

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
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission Required', 'Media library permission is required to select images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: true,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedPhotos(prev => [...prev, ...result.assets]);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  };

  const captureImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to capture images.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedPhotos(prev => [...prev, result.assets[0]]);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Location permission denied.');
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      updatePhase1Field('latitude', latitude.toString());
      updatePhase1Field('longitude', longitude.toString());
      Alert.alert('Location Captured', `Latitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}`);
      setLocationLoading(false);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to get current location.');
      setLocationLoading(false);
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
      const formData = new FormData();

      for (let i = 0; i < selectedPhotos.length; i++) {
        const photo = selectedPhotos[i];
        const filename = photo.fileName || `photo_${Date.now()}_${i}.jpg`;
        const mimeType = photo.mimeType || 'image/jpeg';

        formData.append('photos', {
          uri: photo.uri,
          name: filename,
          type: mimeType,
        } as any);
      }

      const token = apiClient.defaults.headers.common['Authorization'];
      const uploadUrl = `${apiClient.defaults.baseURL}/api/SiteVisits/${selectedVisitForPhotos.id}/photos`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          ...(token && { 'Authorization': token as string }),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
      }

      Alert.alert('Success', `${selectedPhotos.length} photo(s) uploaded successfully!`);
      
      setSelectedPhotos([]);
      setSelectedVisitForPhotos(null);
      setShowPhase2Modal(false);
      setUploadedVisitIds(prev => [...prev, selectedVisitForPhotos.id]);
      await fetchTechnicianVisits();

    } catch (error: any) {
      let errorMessage = 'Failed to upload photos. ';
      
      if (error.message.includes('Network request failed')) {
        errorMessage += 'Please check your internet connection.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      Alert.alert('Upload Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPhase2 = (visit: SiteVisit) => {
    setSelectedVisitForPhotos(visit);
    setSelectedPhotos([]);
    setShowPhase2Modal(true);
  };

  const handleClosePhase2 = () => {
    setShowPhase2Modal(false);
    setSelectedVisitForPhotos(null);
    setSelectedPhotos([]);
  };

   const handleViewDetails = async (visit: SiteVisit) => {
    // Open modal immediately
    setSelectedVisitDetails(visit); // Set basic visit info immediately
    setShowDetailsModal(true);
    setDetailsLoading(true);
    
    try {
      const details = await apiService.getSiteVisitById(visit.id);
      setSelectedVisitDetails(details);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch details');
      // Keep modal open with basic info, just show error in console
      console.error('Failed to load full details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
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

  const updatePhase1Field = (field: keyof typeof phase1Data, value: string) => {
    setPhase1Data((prev) => ({ ...prev, [field]: value }));
  };

  const updateCableField = (field: keyof typeof currentCable, value: string) => {
    setCurrentCable((prev) => ({ ...prev, [field]: value }));
  };

  const renderPhase1Form = () => (
    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
      {/* Form Header */}
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>New Site Visit</Text>
        <Text style={styles.formSubtitle}>Fill in location and cable details</Text>
      </View>

      {/* Location Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Ionicons name="location-outline" size={20} color="#007AFF" />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Location Information</Text>
            <Text style={styles.sectionDescription}>Site address and coordinates</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.locationButton, locationLoading && styles.disabled]}
          onPress={getCurrentLocation}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator color="#007AFF" size="small" />
          ) : (
            <>
              <Ionicons name="locate-outline" size={20} color="#007AFF" />
              <Text style={styles.locationButtonText}>Get Current Location</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Latitude *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.000000"
              placeholderTextColor="#999"
              value={phase1Data.latitude}
              onChangeText={(value) => updatePhase1Field('latitude', value)}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Longitude *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.000000"
              placeholderTextColor="#999"
              value={phase1Data.longitude}
              onChangeText={(value) => updatePhase1Field('longitude', value)}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <Text style={styles.inputLabel}>House No & Society *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter house number and society name"
          placeholderTextColor="#999"
          value={phase1Data.houseNo}
          onChangeText={(value) => updatePhase1Field('houseNo', value)}
        />

        <Text style={styles.inputLabel}>Street *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter street name"
          placeholderTextColor="#999"
          value={phase1Data.street}
          onChangeText={(value) => updatePhase1Field('street', value)}
        />

        <Text style={styles.inputLabel}>Landmark</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter nearby landmark"
          placeholderTextColor="#999"
          value={phase1Data.landmark}
          onChangeText={(value) => updatePhase1Field('landmark', value)}
        />

        <Text style={styles.inputLabel}>Area *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter area name"
          placeholderTextColor="#999"
          value={phase1Data.area}
          onChangeText={(value) => updatePhase1Field('area', value)}
        />

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>City *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter city"
              placeholderTextColor="#999"
              value={phase1Data.city}
              onChangeText={(value) => updatePhase1Field('city', value)}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>State *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter state"
              placeholderTextColor="#999"
              value={phase1Data.state}
              onChangeText={(value) => updatePhase1Field('state', value)}
            />
          </View>
        </View>

        <Text style={styles.inputLabel}>Pincode *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter pincode"
          placeholderTextColor="#999"
          value={phase1Data.pincode}
          onChangeText={(value) => updatePhase1Field('pincode', value)}
          keyboardType="numeric"
        />
      </View>

      {/* Cable Connections Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIcon}>
            <Ionicons name="git-branch-outline" size={20} color="#34C759" />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Cable Connections</Text>
            <Text style={styles.sectionDescription}>Add cable connection details</Text>
          </View>
        </View>

        <Text style={styles.inputLabel}>Core Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter core number"
          placeholderTextColor="#999"
          value={currentCable.coreNumber}
          onChangeText={(value) => updateCableField('coreNumber', value)}
          keyboardType="numeric"
        />

        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>From Color</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter color"
              placeholderTextColor="#999"
              value={currentCable.fromColor}
              onChangeText={(value) => updateCableField('fromColor', value)}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>To Color</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter color"
              placeholderTextColor="#999"
              value={currentCable.toColor}
              onChangeText={(value) => updateCableField('toColor', value)}
            />
          </View>
        </View>

        <Text style={styles.inputLabel}>Reason</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter reason for connection"
          placeholderTextColor="#999"
          value={currentCable.reason}
          onChangeText={(value) => updateCableField('reason', value)}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddCableConnection}
        >
          <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
          <Text style={styles.addButtonText}>Add Cable Connection</Text>
        </TouchableOpacity>

        {cableConnections.length > 0 && (
          <View style={styles.cableList}>
            <View style={styles.cableListHeader}>
              <Text style={styles.cableListTitle}>Added Connections</Text>
              <View style={styles.cableCount}>
                <Text style={styles.cableCountText}>{cableConnections.length}</Text>
              </View>
            </View>
            
            {cableConnections.map((cable, index) => (
              <View key={index} style={styles.cableItem}>
                <View style={styles.cableHeader}>
                  <View style={styles.cableCore}>
                    <Text style={styles.cableCoreText}>Core {cable.coreNumber}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveCableConnection(index)}
                  >
                    <Ionicons name="close-circle" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
                <View style={styles.cableDetails}>
                  <View style={styles.cableConnection}>
                    <Text style={styles.cableColor}>{cable.fromColor}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#666" />
                    <Text style={styles.cableColor}>{cable.toColor}</Text>
                  </View>
                  <Text style={styles.cableReason}>Reason: {cable.reason}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabled]}
        onPress={handlePhase1Submit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.submitButtonText}>Create Site Visit</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderMyVisitsList = () => (
    <View style={styles.listContainer}>
      {refreshing ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : visits.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyStateTitle}>No site visits yet</Text>
          <Text style={styles.emptyStateText}>Create your first site visit to get started</Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => setActiveTab('newVisit')}
          >
            <Text style={styles.emptyStateButtonText}>Create Visit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {visits.map((visit, index) => (
            <View key={visit.id} style={styles.visitCard}>
              <View style={styles.visitHeader}>
                <View style={styles.visitNumber}>
                  <Text style={styles.visitNumberText}>#{visits.length - index}</Text>
                </View>
                <View style={styles.visitStatus}>
                  {uploadedVisitIds.includes(visit.id) ? (
                    <View style={[styles.statusBadge, styles.completedBadge]}>
                      <Ionicons name="checkmark-circle" size={12} color="#34C759" />
                      <Text style={styles.statusText}>Completed</Text>
                    </View>
                  ) : (
                    <View style={[styles.statusBadge, styles.pendingBadge]}>
                      <Ionicons name="time-outline" size={12} color="#FF9500" />
                      <Text style={styles.statusText}>Pending Photos</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={styles.visitAddress}>{visit.houseNo}</Text>
              
              <View style={styles.visitInfo}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.visitInfoText}>
                  {visit.street}, {visit.city}
                </Text>
              </View>

              <View style={styles.visitInfo}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.visitInfoText}>
                  {visit.createdAt ? new Date(visit.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                </Text>
              </View>

              {visit.cableConnections && visit.cableConnections.length > 0 && (
                <View style={styles.visitInfo}>
                  <Ionicons name="git-branch-outline" size={16} color="#666" />
                  <Text style={styles.visitInfoText}>
                    {visit.cableConnections.length} cable connection{visit.cableConnections.length > 1 ? 's' : ''}
                  </Text>
                </View>
              )}

              <View style={styles.visitActions}>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => handleViewDetails(visit)}
                >
                  <Ionicons name="eye-outline" size={16} color="#007AFF" />
                  <Text style={styles.detailsButtonText}>Details</Text>
                </TouchableOpacity>
                
                {!uploadedVisitIds.includes(visit.id) && (
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => handleOpenPhase2(visit)}
                  >
                    <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.uploadButtonText}>Upload Photos</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
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
                  <View style={styles.photoPreviewActions}>
                    <TouchableOpacity style={styles.photoPreviewActionButton}>
                      <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.photoPreviewActionText}>Download</Text>
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
            onPress={handleCloseDetails}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {detailsLoading ? (
            // Skeleton Loader
            <View style={styles.skeletonContainer}>
              {/* Basic Info Skeleton (shown immediately from visit prop) */}
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
              {/* Basic Info (from visit prop, available immediately) */}
              <View style={styles.basicInfoSection}>
                <Text style={styles.basicInfoTitle}>{selectedVisitDetails.houseNo}</Text>
                <Text style={styles.basicInfoSubtitle}>
                  {selectedVisitDetails.street}, {selectedVisitDetails.city}
                </Text>
                <Text style={styles.basicInfoDate}>
                  Created: {selectedVisitDetails.createdAt ? new Date(selectedVisitDetails.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                </Text>
              </View>

              {/* Location Details */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>📍 Location</Text>
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
                    <Text style={styles.detailValue}>{selectedVisitDetails.landmark}</Text>
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
                    <Text style={styles.coordinateLabel}>LAT</Text>
                    <Text style={styles.coordinateValue}>{selectedVisitDetails.latitude}</Text>
                  </View>
                  <View style={styles.coordinateDivider} />
                  <View style={styles.coordinate}>
                    <Text style={styles.coordinateLabel}>LNG</Text>
                    <Text style={styles.coordinateValue}>{selectedVisitDetails.longitude}</Text>
                  </View>
                </View>
              </View>

              {selectedVisitDetails.cableConnections && selectedVisitDetails.cableConnections.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>🔌 Cable Connections</Text>
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

              {selectedVisitDetails.photos && selectedVisitDetails.photos.length > 0 && (
                <View style={styles.modalSection}>
                  <View style={styles.photosSectionHeader}>
                    <Text style={styles.modalSectionTitle}>
                      📸 Photos ({selectedVisitDetails.photos.length})
                    </Text>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {selectedVisitDetails.photos.map((photo, index) => {
                      const imageUri = photo.base64Data || getImageUrl(photo.photoUrl);
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
                            <Text style={styles.photoDate}>
                              {new Date(photo.uploadedAt).toLocaleDateString('en-IN')}
                            </Text>
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

  const renderPhase2Modal = () => (
    <Modal
      visible={showPhase2Modal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Upload Photos</Text>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={handleClosePhase2}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedVisitForPhotos && (
              <View style={styles.selectedVisit}>
                <Text style={styles.selectedVisitLabel}>Selected Visit</Text>
                <Text style={styles.selectedVisitTitle}>{selectedVisitForPhotos.houseNo}</Text>
                <Text style={styles.selectedVisitAddress}>
                  {selectedVisitForPhotos.street}, {selectedVisitForPhotos.city}
                </Text>
              </View>
            )}

            <View style={styles.photoActions}>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={pickImages}
                disabled={loading}
              >
                <Ionicons name="images-outline" size={28} color="#5856D6" />
                <Text style={styles.photoButtonText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.photoButton}
                onPress={captureImage}
                disabled={loading}
              >
                <Ionicons name="camera-outline" size={28} color="#FF9500" />
                <Text style={styles.photoButtonText}>Camera</Text>
              </TouchableOpacity>
            </View>

            {selectedPhotos.length > 0 && (
              <View style={styles.selectedPhotos}>
                <View style={styles.selectedPhotosHeader}>
                  <Text style={styles.selectedPhotosTitle}>Selected Photos</Text>
                  <View style={styles.photoCount}>
                    <Text style={styles.photoCountText}>{selectedPhotos.length}</Text>
                  </View>
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {selectedPhotos.map((photo, index) => (
                    <View key={index} style={styles.photoPreview}>
                      <Image source={{ uri: photo.uri }} style={styles.photoPreviewImage} />
                      <TouchableOpacity
                        style={styles.removePhoto}
                        onPress={() => setSelectedPhotos(selectedPhotos.filter((_, i) => i !== index))}
                      >
                        <Ionicons name="close-circle" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            <TouchableOpacity
              style={[styles.uploadButton, (loading || selectedPhotos.length === 0) && styles.disabled]}
              onPress={handlePhase2Submit}
              disabled={loading || selectedPhotos.length === 0}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                  <Text style={styles.uploadButtonText}>Upload {selectedPhotos.length} Photos</Text>
                </>
              )}
            </TouchableOpacity>
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
          <Text style={styles.userName}>{user?.name || 'Technician'}</Text>
        </View>
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'newVisit' && styles.activeTab]}
          onPress={() => setActiveTab('newVisit')}
        >
          <Ionicons 
            name="add-circle-outline" 
            size={20} 
            color={activeTab === 'newVisit' ? '#007AFF' : '#8E8E93'} 
          />
          <Text style={[styles.tabText, activeTab === 'newVisit' && styles.activeTabText]}>
            New Visit
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'myVisits' && styles.activeTab]}
          onPress={() => setActiveTab('myVisits')}
        >
          <Ionicons 
            name="document-text-outline" 
            size={20} 
            color={activeTab === 'myVisits' ? '#007AFF' : '#8E8E93'} 
          />
          <Text style={[styles.tabText, activeTab === 'myVisits' && styles.activeTabText]}>
            My Visits ({visits.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'newVisit' && renderPhase1Form()}
      {activeTab === 'myVisits' && (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchTechnicianVisits}
              tintColor="#007AFF"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderMyVisitsList()}
        </ScrollView>
      )}

      {renderPhase2Modal()}
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
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  formHeader: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  sectionDescription: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  locationButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputGroup: {
    flex: 1,
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
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  cableList: {
    marginTop: 16,
  },
  cableListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cableListTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  cableCount: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  cableCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cableItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#34C759',
  },
  cableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cableCore: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  cableCoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34C759',
  },
  deleteButton: {
    padding: 4,
  },
  cableDetails: {
    gap: 6,
  },
  cableConnection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cableColor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  cableReason: {
    fontSize: 13,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
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
    flex: 1,
    padding: 16,
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
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
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
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  visitNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
  },
  visitStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  completedBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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
  visitActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
  modalSection: {
    marginBottom: 24,
  },
  photosSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: '#007AFF',
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
    color: '#007AFF',
    marginBottom: 2,
  },
  photoDate: {
    fontSize: 11,
    color: '#8E8E93',
  },
  selectedVisit: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.2)',
  },
  selectedVisitLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
    marginBottom: 6,
  },
  selectedVisitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  selectedVisitAddress: {
    fontSize: 14,
    color: '#8E8E93',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  selectedPhotos: {
    marginBottom: 20,
  },
  selectedPhotosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedPhotosTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  photoCount: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  photoPreview: {
    position: 'relative',
    marginRight: 12,
  },
  removePhoto: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    borderRadius: 8,
    // backgroundColor: '#F1F1F1',
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
  photoPreviewActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  photoPreviewActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  photoPreviewActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Skeleton Loader Styles (keep as is)
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
  },
});