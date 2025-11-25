import { useAuth } from "@/src/context/AuthContext";
import { apiService } from "@/src/services/api/apiService";
import { SiteVisit, Technician, TechnicianRegisterRequest } from "@/src/types";
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
    try {
      setLoading(true);
      const details = await apiService.getSiteVisitById(visitId, user?.id);
      setSelectedVisitDetails(details);
      setShowDetailsModal(true);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to fetch visit details"
      );
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
    await logout();
    navigation.replace("/landing");
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
          onPress: () => {},
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

  const renderRegisterForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Register New Technician</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={formData.name}
        onChangeText={(value) => updateField("name", value)}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(value) => updateField("email", value)}
        editable={!loading}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        value={formData.mobileNumber}
        onChangeText={(value) => updateField("mobileNumber", value)}
        editable={!loading}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={formData.password}
        onChangeText={(value) => updateField("password", value)}
        editable={!loading}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChangeText={(value) => updateField("confirmPassword", value)}
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
              <Text style={styles.technicianEmail}>
                Email: {technician.email}
              </Text>
              <Text style={styles.technicianPhone}>
                Phone: {technician.mobileNumber}
              </Text>
              <Text style={styles.technicianPhone}>
                Created At:{" "}
                {technician?.createdAt
                  ? new Date(technician.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "--"}
              </Text>
              {technician.referCode && (
                <Text style={styles.technicianCode}>
                  Code: {technician.referCode}
                </Text>
              )}
            </View>
            <View style={styles.technicianActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditTechnician(technician)}
                disabled={loading}
              >
                <Text style={styles.editButtonText}>✏️ Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteTechnician(technician)}
                disabled={loading}
              >
                <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
              </TouchableOpacity>
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
              <Text style={styles.visitName}>
                {visit.houseNo || "Site Name"}
              </Text>
              <Text style={styles.visitAddress}>
                Address: {visit.houseNo}, {visit.street}, {visit.landmark},{" "}
                {visit.area}
              </Text>
              <Text style={styles.techName}>
                Technician: {visit.technicianName}
              </Text>
              {/* <Text style={styles.technicianName}>{visit.technicianName}</Text> */}
              <Text style={styles.visitDate}>
                Date:{" "}
                {new Date(visit.visitDateTime).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
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
                    <Text style={styles.detailsValue}>
                      {selectedVisitDetails.houseNo}
                    </Text>
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
                      <Text style={styles.detailsValue}>
                        {selectedVisitDetails.area}
                      </Text>
                    </View>
                  )}
                  {selectedVisitDetails.street && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsKey}>Street:</Text>
                      <Text style={styles.detailsValue}>
                        {selectedVisitDetails.street}
                      </Text>
                    </View>
                  )}
                  {selectedVisitDetails.landmark && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsKey}>Landmark:</Text>
                      <Text style={styles.detailsValue}>
                        {selectedVisitDetails.landmark}
                      </Text>
                    </View>
                  )}
                  {selectedVisitDetails.city && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsKey}>City:</Text>
                      <Text style={styles.detailsValue}>
                        {selectedVisitDetails.city}
                      </Text>
                    </View>
                  )}
                  {selectedVisitDetails.state && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsKey}>State:</Text>
                      <Text style={styles.detailsValue}>
                        {selectedVisitDetails.state}
                      </Text>
                    </View>
                  )}
                  {selectedVisitDetails.pincode && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsKey}>Pincode:</Text>
                      <Text style={styles.detailsValue}>
                        {selectedVisitDetails.pincode}
                      </Text>
                    </View>
                  )}
                  {selectedVisitDetails.latitude && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsKey}>Latitude:</Text>
                      <Text style={styles.detailsValue}>
                        {selectedVisitDetails.latitude}
                      </Text>
                    </View>
                  )}
                  {selectedVisitDetails.longitude && (
                    <View style={styles.detailsRow}>
                      <Text style={styles.detailsKey}>Longitude:</Text>
                      <Text style={styles.detailsValue}>
                        {selectedVisitDetails.longitude}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.detailsSection}>
                  <Text style={styles.detailsLabel}>Visit Information</Text>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsKey}>Date:</Text>
                    <Text style={styles.detailsValue}>
                      {new Date(
                        selectedVisitDetails.visitDateTime
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsKey}>Time:</Text>
                    <Text style={styles.detailsValue}>
                      {new Date(
                        selectedVisitDetails.visitDateTime
                      ).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
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

                {selectedVisitDetails.cableConnections &&
                  selectedVisitDetails.cableConnections.length > 0 && (
                    <View style={styles.detailsSection}>
                      <Text style={styles.detailsLabel}>Cable Connections</Text>
                      {selectedVisitDetails.cableConnections.map(
                        (cable, index) => (
                          <View key={index} style={styles.cableDetailsItem}>
                            <Text style={styles.cableDetailText}>
                              Core #{cable.coreNumber}
                            </Text>
                            <Text style={styles.cableDetailText}>
                              {cable.fromColor} → {cable.toColor}
                            </Text>
                            <Text style={styles.cableDetailText}>
                              Reason: {cable.reason}
                            </Text>
                          </View>
                        )
                      )}
                    </View>
                  )}

                {selectedVisitDetails.photos &&
                  selectedVisitDetails.photos.length > 0 && (
                    <View style={styles.detailsSection}>
                      <Text style={styles.detailsLabel}>
                        📸 Uploaded Photos ({selectedVisitDetails.photos.length}
                        )
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.photosGallery}
                      >
                        {selectedVisitDetails.photos.map((photo, index) => (
                          <View key={index} style={styles.photoGalleryItem}>
                            <Image
                              source={{
                                uri: `https://compassnetwork.runasp.net${photo.photoUrl}`,
                              }}
                              style={styles.photoGalleryImage}
                            />
                            <Text style={styles.photoUploadedAt}>
                              {new Date(photo.uploadedAt).toLocaleDateString(
                                "en-IN"
                              )}
                            </Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  )}
              </>
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={handleCloseDetails}
          >
            <Text style={styles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      transparent
      animationType="slide"
      onRequestClose={handleCloseEditModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Technician</Text>
            <TouchableOpacity onPress={handleCloseEditModal}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.detailsScroll}>
            <View style={styles.formContainer}>
              {/* Full Name Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={editFormData.name}
                  onChangeText={(value) => updateEditField("name", value)}
                  editable={!loading}
                />
              </View>

              {/* Email Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={editFormData.email}
                  onChangeText={(value) => updateEditField("email", value)}
                  editable={!loading}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Mobile Number Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Mobile Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your mobile number"
                  value={editFormData.mobileNumber}
                  onChangeText={(value) =>
                    updateEditField("mobileNumber", value)
                  }
                  editable={!loading}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Password Section Divider */}
              <View style={styles.sectionDivider}>
                <Text style={styles.sectionTitle}>
                  Change Password (Optional)
                </Text>
                <Text style={styles.passwordNote}>
                  Leave password fields empty to keep your current password
                </Text>
              </View>

              {/* New Password Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter new password"
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
                      size={24}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm new password"
                    value={editFormData.confirmPassword}
                    onChangeText={(value) =>
                      updateEditField("confirmPassword", value)
                    }
                    editable={!loading}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={24}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={handleCloseEditModal}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.saveButton,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleSaveEditTechnician}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {user?.name || "Company"}!</Text>
        <Text style={styles.role}>Company Account</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "register" && styles.activeTab]}
          onPress={() => setActiveTab("register")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "register" && styles.activeTabText,
            ]}
          >
            Register Technician
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "technicians" && styles.activeTab]}
          onPress={() => setActiveTab("technicians")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "technicians" && styles.activeTabText,
            ]}
          >
            Technicians
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "siteVisits" && styles.activeTab]}
          onPress={() => setActiveTab("siteVisits")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "siteVisits" && styles.activeTabText,
            ]}
          >
            Site Visits
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContent}
        refreshControl={
          activeTab !== "register" ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={
                activeTab === "technicians"
                  ? fetchCompanyTechnicians
                  : fetchCompanySiteVisits
              }
            />
          ) : undefined
        }
      >
        {activeTab === "register" && renderRegisterForm()}
        {activeTab === "technicians" && renderTechniciansList()}
        {activeTab === "siteVisits" && renderSiteVisitsList()}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {showDetailsModal && renderDetailsModal()}
      {showEditModal && renderEditModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#10B981",
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  role: {
    fontSize: 14,
    color: "#D1FAE5",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#10B981",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#10B981",
    fontWeight: "600",
  },
  scrollContent: {
    flex: 1,
  },
  formContainer: {
    padding: 10,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 5,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  registerButton: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    padding: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    marginTop: 20,
  },
  technicianCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
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
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  technicianEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  technicianPhone: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  technicianCode: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500",
    marginTop: 5,
  },
  visitCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  visitInfo: {
    flex: 1,
  },
  visitName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  visitAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  techName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  visitDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  visitStatus: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500",
    marginTop: 5,
  },
  viewButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    fontSize: 24,
    color: "#999",
  },
  detailsScroll: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  detailsSection: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailsLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  detailsKey: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    width: "40%",
  },
  detailsValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    fontWeight: "500",
  },
  cableDetailsItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  cableDetailText: {
    fontSize: 13,
    color: "#333",
    marginBottom: 3,
  },
  closeModalButton: {
    backgroundColor: "#10B981",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
  },
  closeModalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
    margin: 20,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  photosGallery: {
    marginVertical: 10,
  },
  photoGalleryItem: {
    marginRight: 12,
    alignItems: "center",
  },
  photoGalleryImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  photoUploadedAt: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
    fontWeight: "500",
  },
  technicianActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  editButton: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  passwordNote: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 10,
    marginTop: -5,
  },
  modalButtonContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#e0e0e0",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#10B981",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  fieldContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  // input: {
  //   borderWidth: 1,
  //   borderColor: '#ddd',
  //   borderRadius: 8,
  //   padding: 12,
  //   fontSize: 16,
  //   backgroundColor: '#fff',
  // },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
  },
  sectionDivider: {
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 6,
  },
  // passwordNote: {
  //   fontSize: 13,
  //   color: '#666',
  //   fontStyle: 'italic',
  // },
});
