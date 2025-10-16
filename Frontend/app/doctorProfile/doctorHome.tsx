import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  Alert,
  Linking,
  RefreshControl,
  StatusBar
} from 'react-native';
import { FontAwesome, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import styles from '../doctorProfile/doctorHome.styles';
import BottomNavigation from '../common/BottomNavigation';
import { useRouter } from 'expo-router';
import { auth } from '../../config/firebaseConfig';
import AuthService from '../../services/authService';

interface UserProfile {
  fullName: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
}


export default function DoctortHome() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: '',
    firstName: '',
    lastName: '',
    profilePicture: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Navigation handlers
  const handleViewHistory = () => {
    router.push('./viewHistory/viewhistory');
  };

  const handleMedications = () => {
    router.push('./activemedications');
  };

  const handleLabResults = () => {
    router.push('./labReports/labresults ');
  };

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.log("No user is signed in");
          router.replace('../login');
          return;
        }

        const userId = currentUser.uid;
        // Determine role and fetch from the correct collection
        const roles = await AuthService.determineRoles(userId);

        if (roles.error === 'permission-denied') {
          console.error('Permission denied when fetching role information');
          // fallback to guest
          setUserProfile({ fullName: 'Guest User', firstName: 'Guest', lastName: 'User', profilePicture: '' });
          return;
        }

        // Prefer doctor data if available (this is the doctor home)
        let roleToUse: 'doctor' | 'patient' | null = null;
        if (roles.isDoctor) roleToUse = 'doctor';
        else if (roles.isPatient) roleToUse = 'patient';

        if (!roleToUse) {
          setUserProfile({ fullName: 'Guest User', firstName: 'Guest', lastName: 'User', profilePicture: '' });
          return;
        }

        const userResult = await AuthService.getUserData(userId, roleToUse);
        if (userResult.success && userResult.data) {
          const personalData = userResult.data.personal || {} as any;
          const fullName = personalData.fullName || 'Guest';
          const nameParts = fullName.trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

          setUserProfile({
            fullName,
            firstName,
            lastName,
            profilePicture: personalData.profilePicture || ''
          });
        } else {
          console.error('Error fetching user data:', userResult.error);
          setUserProfile({ fullName: 'Guest User', firstName: 'Guest', lastName: 'User', profilePicture: '' });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserProfile({
          fullName: 'Guest User',
          firstName: 'Guest',
          lastName: 'User',
          profilePicture: ''
        });
      }
    };

    fetchUserProfile();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserProfile();
      }
    });

    return () => unsubscribe();
  }, [router]);


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          {userProfile.profilePicture ? (
            <Image
              source={{ uri: userProfile.profilePicture }}
              style={styles.profileImage}
              defaultSource={require('../../assets/images/profile.jpg')}
            />
          ) : (
            <Image
              source={require('../../assets/images/profile.jpg')}
              style={styles.profileImage}
            />
          )}
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>Welcome!</Text>
            <Text style={styles.userName}>Dr. {userProfile.firstName || 'User'}</Text>
            <Text style={styles.welcomeSubtitle}>Stay updated with your Patients</Text>
          </View>
        </View>
      </View>


      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleViewHistory}
        >
          <View style={styles.actionIconContainer}>
            <FontAwesome name="stethoscope" size={22} color="#fff" />
          </View>
          <Text style={styles.actionText}>Health Timeline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleMedications}
        >
          <View style={styles.actionIconContainer}>
            <MaterialCommunityIcons name="pill" size={24} color="#fff" />
          </View>
          <Text style={styles.actionText}>Active Medications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLabResults}
        >
          <View style={styles.actionIconContainer}>
            <FontAwesome name="file-text-o" size={22} color="#fff" />
          </View>
          <Text style={styles.actionText}>Lab Results</Text>
        </TouchableOpacity>
      </View>


      {/* Main Content */}
      <ScrollView>
              <View style={styles.lastUpdatedContainer}>
        <Ionicons name="time" size={16} color="#666" />
        <Text style={styles.lastUpdatedText}>
          Last updated: Ptient List
        </Text>
      </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="home" />
    </SafeAreaView>
  );
}