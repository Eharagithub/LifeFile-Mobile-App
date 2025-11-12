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
import { Ionicons , Feather} from '@expo/vector-icons';
import styles from './doctorHome.styles';
import BottomNavigation from '../common/BottomNavigation';
import { useRouter } from 'expo-router';
import { auth, db } from '../../config/firebaseConfig';
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
  status?: string;
  patientId?: string;
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



  const [consultations, setConsultations] = useState<Consultation[]>([]);

  // Listen to patients created by this doctor and update the list in real-time
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      // Listen to the doctor's patients subcollection: Doctor/{doctorId}/patients
      const q = db.collection('Doctor').doc(currentUser.uid).collection('patients');
      const unsubscribe = q.onSnapshot((snapshot) => {
        const items: Consultation[] = snapshot.docs.map((doc) => {
          const data: any = doc.data();
          // createdAt may be stored as ISO string — attempt to format
          let date = '';
          try {
            if (data.createdAt) {
              // Handle Firestore Timestamp or ISO string
              let d: Date;
              if (data.createdAt.toDate) {
                d = data.createdAt.toDate();
              } else {
                d = new Date(data.createdAt);
              }
              date = d.toLocaleDateString();
            }
          } catch {
            date = '';
          }

          return {
            id: doc.id,
            name: data.fullName || '',
            time: data.time || '',
            date,
            status: data.status || '',
            patientId: data.patientId || undefined,
          };
        });
        setConsultations(items);
      }, (err) => {
        console.error('Error listening to patients:', err);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up patients listener:', err);
    }
  }, []);

  // Navigate to create patient page (keeps form and logic in createPatient.tsx)
  const handleCreatePatient = () => {
    router.push('./createPatient');
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
            <Text style={styles.statNumber}>{consultations.length}</Text>
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
            <TouchableOpacity
              key={consultation.id}
              style={styles.consultationItem}
              onPress={() => {
                // Navigate to patient dashboard, pass patientId (fallback to consultation id)
                const pid = consultation.patientId || consultation.id;
                try {
                  router.push({ pathname: './patientDashboard', params: { patientId: pid } });
                } catch (e) {
                  // Fallback to string path with query param and log the error
                  console.warn('router.push with params failed, falling back to query string:', e);
                  router.push(`./patientDashboard?patientId=${encodeURIComponent(pid)}`);
                }
              }}
            >
              <View style={styles.consultationLeft}>
                <View style={styles.avatar}>
                  <Ionicons name="person-outline" size={28} color="#9E9E9E" />
                </View>
                <View style={styles.consultationInfo}>
                  <Text style={styles.patientName}>{consultation.name}</Text>
                  <Text style={styles.appointmentDate}>{consultation.date}</Text>
                  {consultation.status ? (
                    <Text style={[styles.appointmentDate, { color: '#B9770E' }]}>{consultation.status}</Text>
                  ) : null}
                </View>
              </View>
              <TouchableOpacity
                style={styles.bookmarkButton}
                onPress={() => {
                  // Bookmark action placeholder
                  console.log('Bookmark toggled for', consultation.id);
                }}
              >
                <Feather name="chevron-right" size={16} color="#7d4c9e" />
              </TouchableOpacity>
            </TouchableOpacity>
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

