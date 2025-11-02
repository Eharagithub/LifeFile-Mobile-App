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

// Import the profile edit components
import EditProfileScreen from './editProfile/personalinfooredit';
import { ChangePw } from './editProfile/changepw';
import ContactInforScreen from './editProfile/contactInfor';
import UpdateHealthScreen from './editProfile/updateHealth';
import LifeStyleScreen from './editProfile/lifeStyle';

// Firebase imports from firebaseConfig.ts
import { storage, auth } from '../../../../config/firebaseConfig';
import AuthService from '../../../../services/authService';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import useUserProfile from '../../../../hooks/useUserProfile';

interface UserData {
  fullName: string;
  email: string;
  profilePicture?: string;
  contactNumber?: string;
  dateOfBirth?: string;
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
          <MaterialIcons name="edit" size={16} />
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
  const [uploading, setUploading] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [changePwVisible, setChangePwVisible] = useState<boolean>(false);
  const [contactInfor, setContactInfor] = useState<boolean>(false);
  const [updateHealth, setupdateHealth] = useState<boolean>(false);
  const [lifeStyle, setlifeStyle] = useState<boolean>(false);
  const router = useRouter();

  // Use central hook which listens for auth state and loads the Firestore profile
  const { uid, data, loading, refresh } = useUserProfile();

  // derived small profile for UI and child components
  const userProfile = {
    fullName: data?.personal?.fullName || auth.currentUser?.displayName || data?.fullName || 'User',
    email: data?.email || auth.currentUser?.email || '',
    profilePicture: data?.personal?.profilePicture || auth.currentUser?.photoURL || '',
  };
  const editUserData = {
    fullName: data?.personal?.fullName || '',
    dateOfBirth: data?.personal?.dateOfBirth || '',
    nic: data?.personal?.nic || '',
    gender: data?.personal?.gender || '',
    email: data?.email || auth.currentUser?.email || '',
    weight: data?.personal?.weight || '',
    height: data?.personal?.height || '',
    bmi: data?.personal?.bmi || '',
  };

  const updateUserProfile = async (updatedData: Partial<UserData>) => {
    if (!uid) {
      Alert.alert('Error', 'You must be logged in to update your profile.');
      return;
    }

    try {
      const roles = await AuthService.determineRoles(uid);
      if (roles.error === 'permission-denied') {
        Alert.alert('Error', 'Missing permissions to update your profile. Please contact support.');
        return;
      }

      const roleToUse: 'patient' | 'doctor' | null = roles.isPatient ? 'patient' : roles.isDoctor ? 'doctor' : null;
      if (!roleToUse) {
        Alert.alert('Error', 'No profile exists to update for this account.');
        return;
      }

      const res = await AuthService.updateUserProfile(uid, { personal: updatedData as any }, roleToUse);
      if (res.success) {
        await refresh();
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        console.error('Error updating profile:', res.error);
        Alert.alert('Error', res.error || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const uploadProfileImage = async (uri: string): Promise<string> => {
    if (!uid) {
      throw new Error('User not authenticated');
    }

    try {
      setUploading(true);

      // Convert URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create a reference to the storage location
      const fileExtension = uri.split('.').pop();
      const fileName = `profile_${uid}_${Date.now()}.${fileExtension}`;
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
          if (data?.personal?.profilePicture) {
            await deleteOldProfileImage(data.personal.profilePicture);
          }

          // Update Firestore with new profile image URL
          await updateUserProfile({ profilePicture: downloadURL });
        } catch (error: any) {
          console.error('Failed to upload profile picture:', error?.message || error);
          Alert.alert('Error', 'Failed to upload profile picture.');
        }
      }
    } catch (error: any) {
      console.error('Failed to take photo:', error?.message || error);
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
          if (data?.personal?.profilePicture) {
            await deleteOldProfileImage(data.personal.profilePicture);
          }

          // Update Firestore with new profile image URL
          await updateUserProfile({ profilePicture: downloadURL });
        } catch (error: any) {
          console.error('Failed to upload profile picture:', error?.message || error);
          Alert.alert('Error', 'Failed to upload profile picture.');
        }
      }
    } catch (error: any) {
      console.error('Failed to select image:', error?.message || error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const removePhoto = async () => {
    const existing = data?.personal?.profilePicture || userProfile.profilePicture;
    if (existing) {
      try {
        await deleteOldProfileImage(existing);
        await updateUserProfile({ profilePicture: '' });
      } catch (error: any) {
        console.error('Failed to remove profile picture:', error?.message || error);
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

  // Navigate to change password screen
  const handleChangePassword = () => {
    setChangePwVisible(true);
  };

  // Function to handle modal close
  const handleClosechangePw = () => {
    setChangePwVisible(false);
  };

  // Navigate to contact info screen
  const handleContactInformation = () => {
    setContactInfor(true);
  };

  // Function to handle modal close
  const handleCloseContactInformation = () => {
    setContactInfor(false);
  };

  // Navigate to contact info screen
  const handleupdateHealth = () => {
    setupdateHealth(true);
  };

  // Function to handle modal close
  const handleCloseupdateHealth = () => {
    setupdateHealth(false);
  };

  // Navigate to contact info screen
  const handleUpdateLifeStyle = () => {
    setlifeStyle(true);
  };

  const handleCloseLifeStyle = () => {
    setlifeStyle(false);
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
              ) : userProfile.profilePicture ? (
                <Image source={{ uri: userProfile.profilePicture }} style={styles.profileImage} />
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

          <Text style={styles.userName}>{userProfile.fullName || 'User'}</Text>
          <Text style={styles.userEmail}>{userProfile.email || 'No email provided'}</Text>



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
            onPress={handleupdateHealth}
          />
          <ProfileItem
            title="Life Style"
            icon="fitness-outline"
            iconColor="#A855F7"
            iconBackgroundColor="#EDE9FE"
            onPress={handleUpdateLifeStyle}
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


      </ScrollView>

      {/* Edit Profile Modal */}
      {/* Render modal components defensively to avoid invalid element errors
          that occur when an import resolves to a module object instead of the
          component function (wrong default/named import). */}
      {(() => {
        // helper to resolve default vs named exports
        const resolve = (C: any) => C && (typeof C === 'function' ? C : (C && C.default ? C.default : null));

        const EditComp = resolve(EditProfileScreen);
        const ChangeComp = resolve(ChangePw as any);
        const ContactComp = resolve(ContactInforScreen);
        const HealthComp = resolve(UpdateHealthScreen);
        const LifeComp = resolve(LifeStyleScreen as any);

        return (
          <>
            {EditComp ? <EditComp visible={editModalVisible} userData={editUserData} onClose={handleCloseEditModal} /> : null}
            {ChangeComp ? <ChangeComp visible={changePwVisible} onClose={handleClosechangePw} /> : null}
            {ContactComp ? <ContactComp visible={contactInfor} userData={editUserData} onClose={handleCloseContactInformation} /> : null}
            {HealthComp ? <HealthComp visible={updateHealth} userData={editUserData} onClose={handleCloseupdateHealth} /> : null}
            {LifeComp ? <LifeComp visible={lifeStyle} userData={editUserData} onClose={handleCloseLifeStyle} /> : null}
          </>
        );
      })()}
    </SafeAreaView>
  );
};

export default FirestoreMyProfileScreen;