import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import styles from './MyProfile.styles';

// Import the new EditProfileModal component
import EditProfileModal from './editProfile/personalinfooredit';

// Firebase imports from firebaseConfig.ts
import { db, storage, auth } from '../../../../config/firebaseConfig';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

interface UserData {
  fullName: string;
  email: string;
  profilePicture?: string;
  contactNumber?: string;
  dateOfBirth?: string;
  bloodType?: string;
  emergencyContact?: string;
}

interface ProfileItemProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackgroundColor: string;
  onPress: () => void;
  showEditIcon?: boolean;
}

const ProfileItem: React.FC<ProfileItemProps> = ({
  title,
  icon,
  iconColor,
  iconBackgroundColor,
  onPress,
  showEditIcon = true,
}) => {
  return (
    <TouchableOpacity
      style={styles.profileItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <LinearGradient
          colors={[iconBackgroundColor, iconBackgroundColor + '80']}
          style={styles.itemIcon}
        >
          <Ionicons name={icon} size={20} color={iconColor} />
        </LinearGradient>
        <Text style={styles.itemTitle}>{title}</Text>
      </View>
      {showEditIcon && (
        <View >
          <MaterialIcons name="edit" size={16}  />
        </View>
      )}
    </TouchableOpacity>
  );
};

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={[styles.sectionDivider, { backgroundColor: '#8B5CF6' }]} />
    </View>
  );
};

const FirestoreMyProfileScreen: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const router = useRouter();

  // Get current user ID from Firebase Auth
  const currentUser = auth.currentUser;
  const userId = currentUser ? currentUser.uid : null;

  useEffect(() => {
    // Fetch user data from Firestore when component mounts
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) {
      console.error("No user is signed in");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userDocRef = db.collection("users").doc(userId);
      const userDoc = await userDocRef.get();

      if (userDoc.exists) {
        const data = userDoc.data() as UserData;
        setUserData(data);
      } else {
        // If user document doesn't exist, create one with default values
        const defaultUserData: UserData = {
          fullName: currentUser?.displayName || "User",
          email: currentUser?.email || "",
          profilePicture: currentUser?.photoURL || "",
        };
        
        await userDocRef.set(defaultUserData);
        setUserData(defaultUserData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updatedData: Partial<UserData>) => {
    if (!userId) {
      Alert.alert("Error", "You must be logged in to update your profile.");
      return;
    }

    try {
      const userDocRef = db.collection("users").doc(userId);
      await userDocRef.update(updatedData);
      
      // Update local state
      setUserData(prev => prev ? { ...prev, ...updatedData } : null);
      
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const uploadProfileImage = async (uri: string): Promise<string> => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      setUploading(true);
      
      // Convert URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Create a reference to the storage location
      const fileExtension = uri.split('.').pop();
      const fileName = `profile_${userId}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, `profileImages/${fileName}`);
      
      // Upload the blob
      await uploadBytes(storageRef, blob);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteOldProfileImage = async (imageUrl: string) => {
    if (!imageUrl || !imageUrl.includes('firebasestorage')) return;
    
    try {
      // Extract the path from the URL
      const storageRef = ref(storage, imageUrl);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Error deleting old profile image:", error);
      // Continue even if deletion fails
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleProfileImagePress = async () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { 
          text: 'Take Photo', 
          onPress: () => takePhoto() 
        },
        { 
          text: 'Choose from Gallery', 
          onPress: () => pickImage() 
        },
        { 
          text: 'Remove Photo', 
          onPress: () => removePhoto(),
          style: 'destructive'
        },
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
      ]
    );
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        try {
          const downloadURL = await uploadProfileImage(imageUri);
          
          // Delete old profile image if exists
          if (userData?.profilePicture) {
            await deleteOldProfileImage(userData.profilePicture);
          }
          
          // Update Firestore with new profile image URL
          await updateUserProfile({ profilePicture: downloadURL });
        } catch (error) {
          Alert.alert('Error', 'Failed to upload profile picture.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Gallery permission is required to select photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        try {
          const downloadURL = await uploadProfileImage(imageUri);
          
          // Delete old profile image if exists
          if (userData?.profilePicture) {
            await deleteOldProfileImage(userData.profilePicture);
          }
          
          // Update Firestore with new profile image URL
          await updateUserProfile({ profilePicture: downloadURL });
        } catch (error) {
          Alert.alert('Error', 'Failed to upload profile picture.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const removePhoto = async () => {
    if (userData?.profilePicture) {
      try {
        await deleteOldProfileImage(userData.profilePicture);
        await updateUserProfile({ profilePicture: '' });
      } catch (error) {
        Alert.alert('Error', 'Failed to remove profile picture.');
      }
    }
  };

  // Updated handleUpdateProfile function to show the modal
  const handleUpdateProfile = () => {
    setEditModalVisible(true);
  };

  // Function to handle modal close
  const handleCloseEditModal = () => {
    setEditModalVisible(false);
  };

  // Function to handle profile save from modal
  const handleSaveProfile = async (updatedData: Partial<UserData>) => {
    await updateUserProfile(updatedData);
  };

  const handleChangePassword = () => {
    // Navigate to change password screen
    console.log('Change Password pressed');
  };

  const handleContactInformation = () => {
    // Navigate to contact info screen
    console.log('Contact Information pressed');
  };

  const handleUpdateHealthProfile = () => {
    // Navigate to health profile screen
    console.log('Update Health Profile pressed');
  };

  const handleLifeStyle = () => {
    // Navigate to lifestyle screen
    console.log('Life Style pressed');
  };

  const handleHealthCompanion = () => {
    // Navigate to health companion screen
    console.log('Your Health Companion pressed');
  };

  const handlePreCheckRecommendations = () => {
    // Navigate to recommendations screen
    console.log('Pre-Check Recommendations pressed');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={{ marginTop: 10, color: '#8B5CF6' }}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header - Keeping original as requested */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Feather name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section with enhanced design */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={handleProfileImagePress}
            activeOpacity={0.8}
            disabled={uploading}
          >
            <LinearGradient
              colors={['#8B5CF6', '#A855F7']}
              style={styles.profileImageGradient}
            >
              {uploading ? (
                <ActivityIndicator size="large" color="#ffffff" />
              ) : userData?.profilePicture ? (
                <Image source={{ uri: userData.profilePicture }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person" size={40} color="#ffffff" />
                </View>
              )}
            </LinearGradient>
            <View style={[styles.cameraIcon, { backgroundColor: '#8B5CF6' }]}>
              <Ionicons name="camera" size={16} color="#ffffff" />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.userName}>{userData?.fullName || 'User'}</Text>
          <Text style={styles.userEmail}>{userData?.email || 'No email provided'}</Text>
          
        
          
          {/* Health Status Indicator */}
          <View style={[styles.healthStatusContainer, { backgroundColor: '#8B5CF620' }]}>
            <View style={[styles.healthStatusDot, { backgroundColor: '#8B5CF6' }]} />
            <Text style={[styles.healthStatusText, { color: '#8B5CF6' }]}>Health Profile Active</Text>
          </View>
        </View>

        {/* Personal Information Section */}
        <SectionHeader title="Personal Information" />
        <View style={styles.section}>
          <ProfileItem
            title="Update My Profile"
            icon="person-outline"
            iconColor="#8B5CF6"
            iconBackgroundColor="#F3E8FF"
            onPress={handleUpdateProfile}
          />
          <ProfileItem
            title="Change Password"
            icon="lock-closed-outline"
            iconColor="#A855F7"
            iconBackgroundColor="#EDE9FE"
            onPress={handleChangePassword}
          />
          <ProfileItem
            title="Contact Information"
            icon="call-outline"
            iconColor="#C084FC"
            iconBackgroundColor="#F5F3FF"
            onPress={handleContactInformation}
          />
        </View>

        {/* Medical Information Section */}
        <SectionHeader title="Medical Information" />
        <View style={styles.section}>
          <ProfileItem
            title="Update Health Profile"
            icon="medical-outline"
            iconColor="#8B5CF6"
            iconBackgroundColor="#F3E8FF"
            onPress={handleUpdateHealthProfile}
          />
          <ProfileItem
            title="Life Style"
            icon="fitness-outline"
            iconColor="#A855F7"
            iconBackgroundColor="#EDE9FE"
            onPress={handleLifeStyle}
          />
        </View>

        {/* Health Preferences Section */}
        <SectionHeader title="Health Preferences" />
        <View style={styles.section}>
          <ProfileItem
            title="Your Health Companion"
            icon="heart-outline"
            iconColor="#8B5CF6"
            iconBackgroundColor="#F3E8FF"
            onPress={handleHealthCompanion}
          />
          <ProfileItem
            title="Pre-Check Recommendations"
            icon="checkmark-circle-outline"
            iconColor="#A855F7"
            iconBackgroundColor="#EDE9FE"
            onPress={handlePreCheckRecommendations}
          />
        </View>

        {/* Quick Stats Section
        <View style={[styles.quickStatsContainer]}>
          <Text style={[styles.quickStatsTitle]}>Quick Health Stats</Text>
          <View style={styles.quickStatsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#8B5CF6' }]}>12</Text>
              <Text style={styles.statLabel}>Reports</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#8B5CF6' }]}>8</Text>
              <Text style={styles.statLabel}>Appointments</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#8B5CF6' }]}>95%</Text>
              <Text style={styles.statLabel}>Health Score</Text>
            </View>
          </View>
        </View> */}
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editModalVisible}
        userData={userData}
        onClose={handleCloseEditModal}
       
      />
    </SafeAreaView>
  );
};

export default FirestoreMyProfileScreen;