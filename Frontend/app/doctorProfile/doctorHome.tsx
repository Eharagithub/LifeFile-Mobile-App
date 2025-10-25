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
        // Prefer patient data if available (this is the patient home)
        let roleToUse: 'patient' | 'doctor' | null = null;
        if (roles.isPatient) roleToUse = 'patient';
        else if (roles.isDoctor) roleToUse = 'doctor';

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
              <Text style={styles.userName}>Dr. Nisuni Singhapura</Text>
              <Text style={styles.welcomeSubtitle}>Now connected with your patients today</Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statCircle}>
              <Text style={styles.statNumber}>6</Text>
            </View>
            <Text style={styles.statLabel}>Total Patients</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statCircle}>
              <Text style={styles.statNumber}>6</Text>
            </View>
            <Text style={styles.statLabel}>Upcomings</Text>
          </View>
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

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="home" />

    </View>
  );
}

  