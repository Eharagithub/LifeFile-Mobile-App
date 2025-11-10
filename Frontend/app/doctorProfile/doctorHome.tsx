import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './doctorHome.styles';
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

interface Consultation {
  id: string;
  name: string;
  time: string;
  date: string;
}

export default function DoctorHome() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: '',
    firstName: '',
    lastName: '',
    profilePicture: ''
  });
  // (navigation handlers can be added here if needed)
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
        // Prefer doctor data if available for the doctor home
        let roleToUse: 'patient' | 'doctor' | null = null;
        if (roles.isDoctor) roleToUse = 'doctor';
        else if (roles.isPatient) roleToUse = 'patient';

        if (!roleToUse) {
          setUserProfile({ fullName: 'Guest User', firstName: 'Guest', lastName: 'User', profilePicture: '' });
          return;
        }

        const userResult = await AuthService.getUserData(userId, roleToUse);
        if (userResult.success && userResult.data) {
          const data = userResult.data as any;
          const personalData = data.personal || {} as any;
          // fallback chain for fullName: personal.fullName -> data.fullName -> auth.displayName -> email local-part
          let fullName = personalData.fullName || data.fullName || '';
          if (!fullName && auth.currentUser?.displayName) fullName = auth.currentUser.displayName;
          if (!fullName && data.email) fullName = (data.email.split('@')[0] || '');

          const nameParts = (fullName || '').trim().split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

          setUserProfile({
            fullName,
            firstName,
            lastName,
            profilePicture: personalData.profilePicture || data.profilePicture || ''
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



  const consultations: Consultation[] = [
    {
      id: '1',
      name: 'Sachini Ilanrika',
      time: 'Late appointment',
      date: 'Jun 10, 2023',
    },
    {
      id: '2',
      name: 'Sumith Singhapura',
      time: '10:30am',
      date: 'Jun 10, 2023',
    },
    {
      id: '3',
      name: 'Shashiri Sudeshini',
      time: '11:00am',
      date: 'Jun 10, 2023',
    },
    {
      id: '4',
      name: 'Jamuli Kehara',
      time: '11:30am',
      date: 'Jun 10, 2023',
    },
  ];

  // Navigate to create patient screen (adjust route as needed)
  const handleCreatePatient = () => {
    // Update the route target if your create-patient screen lives elsewhere
    router.push('./createpatient');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8D5F2" />

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
            <Text style={styles.userName}>{
              (userProfile.fullName && userProfile.fullName.trim())
                ? (userProfile.fullName.trim().toLowerCase().startsWith('dr') ? userProfile.fullName : `Dr. ${userProfile.fullName}`)
                : (userProfile.firstName ? `Dr. ${userProfile.firstName}` : 'Doctor')
            }</Text>
            <Text style={styles.welcomeSubtitle}>Now connected with your patients today</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
        // onPress={handleViewHistory}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.statNumber}>6</Text>
          </View>
          <Text style={styles.actionText}>Total Patients</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
        // onPress={handleMedications}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.statNumber}>6</Text>
          </View>
          <Text style={styles.actionText}>Upcomings</Text>
        </TouchableOpacity>

      </View>



      {/* Consultations Section */}
      <View style={styles.consultationsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Consultations</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#B8B8B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Name..."
            placeholderTextColor="#B8B8B8"
          />
        </View>

        {/* Consultations List */}
        <ScrollView style={styles.consultationsList} showsVerticalScrollIndicator={false}>
          {consultations.map((consultation) => (
            <View key={consultation.id} style={styles.consultationItem}>
              <View style={styles.consultationLeft}>
                <View style={styles.avatar}>
                  <Ionicons name="person-outline" size={28} color="#9E9E9E" />
                </View>
                <View style={styles.consultationInfo}>
                  <Text style={styles.patientName}>{consultation.name}</Text>
                  <Text style={styles.appointmentTime}>{consultation.time}</Text>
                  <Text style={styles.appointmentDate}>{consultation.date}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.bookmarkButton}>
                <Ionicons name="bookmark-outline" size={22} color="#8B7BA8" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Floating action button: create patient */}
      <TouchableOpacity
        onPress={handleCreatePatient}
        accessibilityLabel="Create patient"
        style={{
          position: 'absolute',
          right: 20,
          bottom: 80, // place above bottom navigation
          backgroundColor: '#874691',
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 6,
          zIndex: 20,
        }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
  
      {/* Bottom Navigation */}
      <BottomNavigation activeTab="home" />

    </View>
  );
}

