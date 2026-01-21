import { useAuth } from "@/src/context/AuthContext";
import { apiService } from "@/src/services/api/apiService";
import { SiteVisit, Technician, TechnicianRegisterRequest } from "@/src/types";
import { getImageUrl } from "@/src/utils/imageUtils";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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
} from "react-native";

export const CompanyDashboard: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "register" | "technicians" | "siteVisits"
  >("register");
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVisitDetails, setSelectedVisitDetails] =
    useState<SiteVisit | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] =
    useState<Technician | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
 // Photo preview state
  const [selectedPhotoForPreview, setSelectedPhotoForPreview] = useState<{
    uri: string;
    date: string;
  } | null>(null);
  const [showPhotoPreviewModal, setShowPhotoPreviewModal] = useState(false);
  
  // Loading state for details modal
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Registration form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (activeTab === "technicians") {
      fetchCompanyTechnicians();
    } else if (activeTab === "siteVisits") {
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
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to fetch technicians"
      );
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
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to fetch site visits"
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewDetails = async (visitId: number) => {
    // Open modal immediately
    setShowDetailsModal(true);
    setDetailsLoading(true);
    
    try {
      const details = await apiService.getSiteVisitById(visitId, user?.id);
      setSelectedVisitDetails(details);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to fetch visit details"
      );
      // Close modal on error
      setShowDetailsModal(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedVisitDetails(null);
    setDetailsLoading(false);
  };

  const handleRegisterTechnician = async () => {
    const { name, email, mobileNumber, password, confirmPassword } = formData;

    if (!name || !email || !mobileNumber || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
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
        const response = await apiService.registerTechnician(
          user.id,
          registerData
        );

        if (response.success) {
          Alert.alert("Success", "Technician registered successfully!");
          setFormData({
            name: "",
            email: "",
            mobileNumber: "",
            password: "",
            confirmPassword: "",
          });
          // Refresh the list if we're on that tab
          if (activeTab === "technicians") {
            fetchCompanyTechnicians();
          }
        }
      }
    } catch (error: any) {
      Alert.alert(
        "Registration Failed",
        error.response?.data?.message || "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            await logout();
            navigation.replace("/landing");
          }
        }
      ]
    );
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateEditField = (field: keyof typeof editFormData, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditTechnician = (technician: Technician) => {
    setSelectedTechnician(technician);
    setEditFormData({
      name: technician.name,
      email: technician.email,
      mobileNumber: technician.mobileNumber,
      password: "",
      confirmPassword: "",
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedTechnician(null);
    setEditFormData({
      name: "",
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleSaveEditTechnician = async () => {
    if (!selectedTechnician || !user?.id) return;

    const { name, email, mobileNumber, password, confirmPassword } =
      editFormData;

    if (!name || !email || !mobileNumber) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (password && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const updateData: TechnicianRegisterRequest = {
        name,
        email,
        mobileNumber,
        password: password || "",
        confirmPassword: confirmPassword || "",
      };

      const response = await apiService.editTechnician(
        user.id,
        selectedTechnician.id,
        updateData
      );

      if (response.success) {
        Alert.alert("Success", "Technician updated successfully!");
        handleCloseEditModal();
        fetchCompanyTechnicians();
      }
    } catch (error: any) {
      Alert.alert(
        "Update Failed",
        error.response?.data?.message || "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTechnician = (technician: Technician) => {
    Alert.alert(
      "Delete Technician",
      `Are you sure you want to delete ${technician.name}? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => confirmDeleteTechnician(technician),
          style: "destructive",
        },
      ]
    );
  };

  const confirmDeleteTechnician = async (technician: Technician) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await apiService.deleteTechnician(
        user.id,
        technician.id
      );

      if (response.success) {
        Alert.alert("Success", "Technician deleted successfully!");
        fetchCompanyTechnicians();
      }
    } catch (error: any) {
      Alert.alert(
        "Delete Failed",
        error.response?.data?.message || "An error occurred"
      );
    } finally {
      setLoading(false);
    }
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

  const renderRegisterForm = () => (
    <View style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Register New Technician</Text>
        <Text style={styles.sectionSubtitle}>Add new technician to your company</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter technician's full name"
          placeholderTextColor="#999"
          value={formData.name}
          onChangeText={(value) => updateField("name", value)}
          editable={!loading}
        />

        <Text style={styles.inputLabel}>Email Address *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email address"
          placeholderTextColor="#999"
          value={formData.email}
          onChangeText={(value) => updateField("email", value)}
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
          onChangeText={(value) => updateField("mobileNumber", value)}
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
            onChangeText={(value) => updateField("password", value)}
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
            onChangeText={(value) => updateField("confirmPassword", value)}
            editable={!loading}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabled]}
          onPress={handleRegisterTechnician}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="person-add-outline" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Register Technician</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTechniciansList = () => (
    <View style={styles.listContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Technicians</Text>
        <Text style={styles.sectionSubtitle}>{technicians.length} technician{technicians.length !== 1 ? 's' : ''} registered</Text>
      </View>

      {refreshing ? (
        <ActivityIndicator size="large" color="#FF9500" style={styles.loader} />
      ) : technicians.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyStateTitle}>No technicians yet</Text>
          <Text style={styles.emptyStateText}>Register your first technician to get started</Text>
        </View>
      ) : (
        technicians.map((technician) => (
          <View key={technician.id} style={styles.technicianCard}>
            <View style={styles.technicianHeader}>
              <View style={styles.technicianIcon}>
                <Ionicons name="person-circle-outline" size={24} color="#FF9500" />
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
              
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
                <Text style={styles.detailText}>
                  Joined: {technician.createdAt ? new Date(technician.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                </Text>
              </View>
            </View>
            
            <View style={styles.technicianActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditTechnician(technician)}
                disabled={loading}
              >
                <Ionicons name="create-outline" size={18} color="#007AFF" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteTechnician(technician)}
                disabled={loading}
              >
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
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
        <ActivityIndicator size="large" color="#FF9500" style={styles.loader} />
      ) : siteVisits.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyStateTitle}>No visits yet</Text>
          <Text style={styles.emptyStateText}>Technicians will appear here once they start visiting sites</Text>
        </View>
      ) : (
        siteVisits.map((visit) => (
          <View key={visit.id} style={styles.visitCard}>
            <View style={styles.visitHeader}>
              <View style={styles.visitNumber}>
                <Text style={styles.visitNumberText}>#{siteVisits.indexOf(visit) + 1}</Text>
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
            
            <TouchableOpacity
              style={styles.viewDetailsButton}
              onPress={() => handleViewDetails(visit.id)}
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
              onPress={handleCloseDetails}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {detailsLoading ? (
              // Skeleton Loader
              <View style={styles.skeletonContainer}>
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

                {/* Technician Section Skeleton */}
                <View style={styles.skeletonSection}>
                  <View style={styles.skeletonTitle} />
                  <View style={styles.skeletonTechnicianCard} />
                </View>

                {/* Cable Connections Skeleton */}
                <View style={styles.skeletonSection}>
                  <View style={styles.skeletonTitle} />
                  {[...Array(2)].map((_, i) => (
                    <View key={i} style={styles.skeletonCableDetail}>
                      <View style={styles.skeletonCableHeader} />
                      <View style={styles.skeletonCableFlow} />
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
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ) : selectedVisitDetails && (
              <>
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

                {/* Technician Details */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Technician</Text>
                  <View style={styles.technicianDetailCard}>
                    <Ionicons name="person-circle-outline" size={20} color="#FF9500" />
                    <Text style={styles.technicianDetailName}>{selectedVisitDetails.technicianName}</Text>
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
                              <Text style={styles.colorLabel}>From</Text>
                              <Text style={styles.colorValue}>{cable.fromColor}</Text>
                            </View>
                            <Ionicons name="arrow-forward" size={20} color="#666" />
                            <View style={styles.colorBox}>
                              <Text style={styles.colorLabel}>To</Text>
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

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Technician</Text>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={handleCloseEditModal}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.editFormCard}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter technician's full name"
                placeholderTextColor="#999"
                value={editFormData.name}
                onChangeText={(value) => updateEditField("name", value)}
                editable={!loading}
              />

              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter email address"
                placeholderTextColor="#999"
                value={editFormData.email}
                onChangeText={(value) => updateEditField("email", value)}
                editable={!loading}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Mobile Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter mobile number"
                placeholderTextColor="#999"
                value={editFormData.mobileNumber}
                onChangeText={(value) => updateEditField("mobileNumber", value)}
                editable={!loading}
                keyboardType="phone-pad"
              />

              <View style={styles.sectionDivider}>
                <Text style={styles.sectionDividerTitle}>Change Password (Optional)</Text>
                <Text style={styles.sectionDividerSubtitle}>Leave password fields empty to keep current password</Text>
              </View>

              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter new password"
                  placeholderTextColor="#999"
                  value={editFormData.password}
                  onChangeText={(value) => updateEditField("password", value)}
                  editable={!loading}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm new password"
                  placeholderTextColor="#999"
                  value={editFormData.confirmPassword}
                  onChangeText={(value) => updateEditField("confirmPassword", value)}
                  editable={!loading}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCloseEditModal}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.disabled]}
              onPress={handleSaveEditTechnician}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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
          <Text style={styles.userName}>{user?.companyName || "Company"}</Text>
        </View>
        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FF9500" />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "register" && styles.activeTab]}
          onPress={() => setActiveTab("register")}
        >
          <Ionicons 
            name="person-add-outline" 
            size={20} 
            color={activeTab === "register" ? "#FF9500" : "#8E8E93"} 
          />
          <Text style={[styles.tabText, activeTab === "register" && styles.activeTabText]}>
            Register
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === "technicians" && styles.activeTab]}
          onPress={() => setActiveTab("technicians")}
        >
          <Ionicons 
            name="people-outline" 
            size={20} 
            color={activeTab === "technicians" ? "#FF9500" : "#8E8E93"} 
          />
          <Text style={[styles.tabText, activeTab === "technicians" && styles.activeTabText]}>
            Technicians ({technicians.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === "siteVisits" && styles.activeTab]}
          onPress={() => setActiveTab("siteVisits")}
        >
          <Ionicons 
            name="document-text-outline" 
            size={20} 
            color={activeTab === "siteVisits" ? "#FF9500" : "#8E8E93"} 
          />
          <Text style={[styles.tabText, activeTab === "siteVisits" && styles.activeTabText]}>
            Visits ({siteVisits.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === "register" && (
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {renderRegisterForm()}
        </ScrollView>
      )}
      
      {activeTab === "technicians" && (
        <ScrollView
          style={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchCompanyTechnicians}
              tintColor="#FF9500"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderTechniciansList()}
        </ScrollView>
      )}
      
      {activeTab === "siteVisits" && (
        <ScrollView
          style={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchCompanySiteVisits}
              tintColor="#FF9500"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderSiteVisitsList()}
        </ScrollView>
      )}

      {renderDetailsModal()}
      {renderEditModal()}
      {renderPhotoPreviewModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  welcome: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1D1D1F",
  },
  logout: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF9500",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E93",
  },
  activeTabText: {
    color: "#FF9500",
    fontWeight: "600",
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
    fontWeight: "700",
    color: "#1D1D1F",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  editFormCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1D1D1F",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#1D1D1F",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    marginBottom: 16,
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: "#1D1D1F",
  },
  eyeIcon: {
    padding: 12,
  },
  sectionDivider: {
    marginTop: 8,
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  sectionDividerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1D1D1F",
    marginBottom: 4,
  },
  sectionDividerSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 12,
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#FF9500",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    gap: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
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
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1D1D1F",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
  },
  technicianCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  technicianHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  technicianIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  technicianInfo: {
    flex: 1,
  },
  technicianName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D1D1F",
    marginBottom: 2,
  },
  technicianEmail: {
    fontSize: 14,
    color: "#8E8E93",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginBottom: 12,
  },
  technicianDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#1D1D1F",
  },
  referCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  referCodeLabel: {
    fontSize: 14,
    color: "#8E8E93",
  },
  referCodeBadge: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  referCodeText: {
    fontSize: 13,
    color: "#FF9500",
    fontWeight: "500",
  },
  technicianActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF3B30",
  },
  visitCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  visitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  visitNumber: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  visitNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF9500",
  },
  visitDateBadge: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  visitDateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
  },
  visitAddress: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D1D1F",
    marginBottom: 12,
  },
  visitInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  visitInfoText: {
    fontSize: 14,
    color: "#666",
  },
  viewDetailsButton: {
    flexDirection: "row",
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
  },
  viewDetailsButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1D1D1F",
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    padding: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1D1D1F",
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FF9500",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  modalSection: {
    marginBottom: 24,
  },
  photosSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1D1D1F",
    marginBottom: 16,
  },
  detailGrid: {
    gap: 12,
  },
  detailItem: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1D1D1F",
  },
  coordinates: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  coordinate: {
    flex: 1,
    alignItems: "center",
  },
  coordinateDivider: {
    width: 1,
    backgroundColor: "#E5E5EA",
    marginHorizontal: 16,
  },
  coordinateLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8E8E93",
    marginBottom: 4,
  },
  coordinateValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FF9500",
  },
  technicianDetailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  technicianDetailName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1D1D1F",
  },
  cableDetail: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#34C759",
  },
  cableDetailHeader: {
    marginBottom: 12,
  },
  cableDetailTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#34C759",
  },
  cableDetailContent: {
    gap: 8,
  },
  cableFlow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  colorBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  colorLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#8E8E93",
    marginBottom: 4,
  },
  colorValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1D1D1F",
  },
  reasonText: {
    fontSize: 13,
    color: "#8E8E93",
    fontStyle: "italic",
  },
  photoContainer: {
    marginRight: 12,
    alignItems: "center",
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#F1F1F1",
  },
  photoInfo: {
    marginTop: 8,
    alignItems: "center",
  },
  photoIndex: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FF9500",
    marginBottom: 2,
  },
  photoDate: {
    fontSize: 11,
    color: "#8E8E93",
  },
  // Photo Preview Modal Styles
  photoPreviewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  photoPreviewContainer: {
    width: "95%",
    height: "85%",
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
  },
  photoPreviewImage: {
    width: "100%",
    height: "80%",
  },
  photoPreviewHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  photoPreviewDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  photoPreviewCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  skeletonContainer: {
    padding: 4,
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
    borderWidth: 1,
    borderColor: '#E5E5EA',
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
  skeletonTechnicianCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    height: 56,
    gap: 8,
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
  },
  skeletonPhotos: {
    flexDirection: 'row',
  },
  skeletonPhotoContainer: {
    marginRight: 12,
  },
  skeletonPhoto: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
  },
});