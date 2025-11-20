import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
  ActivityIndicator,
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
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [selectedLinkId, setSelectedLinkId] = useState<string>('');
  const [selectedPatientName, setSelectedPatientName] = useState<string>('');
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

  // Listen to patients created by this doctor and update the list in real-time
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setConsultations([]);
      return;
    }

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
      }, (err: any) => {
        // Only log error if it's not a permission error during logout
        if (err.code !== 'permission-denied') {
          console.error('Error listening to patients:', err);
        }
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

  // Handle OTP verification before navigating to patient dashboard
  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter a 6-digit code');
      return;
    }

    setOtpLoading(true);
    try {
      const doctorId = auth.currentUser?.uid;
      if (!doctorId || !selectedLinkId) {
        Alert.alert('Error', 'Invalid session');
        setOtpLoading(false);
        return;
      }

      // Fetch the stored OTP code from verification document
      const verifyRef = await db
        .collection('Doctor')
        .doc(doctorId)
        .collection('patients')
        .doc(selectedLinkId)
        .collection('verification')
        .doc('sms')
        .get();

      if (!verifyRef.exists) {
        Alert.alert('Error', 'Verification code not found');
        setOtpLoading(false);
        return;
      }

      const verifyData = verifyRef.data();
      if (verifyData?.code === otpCode) {
        // OTP is correct - update patient status to verified
        await db
          .collection('Doctor')
          .doc(doctorId)
          .collection('patients')
          .doc(selectedLinkId)
          .update({
            status: 'verified',
            verifiedAt: new Date().toISOString(),
          });

        // Get the patientId to create authorization
        const linkDoc = await db
          .collection('Doctor')
          .doc(doctorId)
          .collection('patients')
          .doc(selectedLinkId)
          .get();
        
        const patientId = linkDoc.data()?.patientId;
        
        // CREATE AUTHORIZATION: Add doctor to Patient/doctors subcollection
        if (patientId) {
          console.log('🔐 Creating doctor authorization for patient:', patientId, 'doctor:', doctorId);
          try {
            await db
              .collection('Patient')
              .doc(patientId)
              .collection('doctors')
              .doc(doctorId)
              .set({
                status: 'authorized',
                linkId: selectedLinkId,
                authorizedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
              });
            console.log('✅ Doctor authorization created successfully');
          } catch (authErr) {
            console.error('❌ Error creating doctor authorization:', authErr);
            Alert.alert('Authorization Error', 'Failed to create doctor authorization. Please contact support.');
            setOtpLoading(false);
            return;
          }
        } else {
          console.error('❌ No patientId found in link document');
          Alert.alert('Error', 'Patient ID not found. Please try again.');
          setOtpLoading(false);
          return;
        }

        // Mark verification as verified
        await db
          .collection('Doctor')
          .doc(doctorId)
          .collection('patients')
          .doc(selectedLinkId)
          .collection('verification')
          .doc('sms')
          .update({
            verified: true,
            verifiedAt: new Date().toISOString(),
          });

        setShowOtpModal(false);
        setOtpCode('');
        Alert.alert('Success', 'Patient verified successfully!');
        
        // Navigate to patient dashboard after verification
        setTimeout(() => {
          router.push({ 
            pathname: './patientDashboard', 
            params: { linkId: selectedLinkId } 
          });
        }, 500);
      } else {
        Alert.alert('Invalid Code', 'The verification code does not match. Please try again.');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle patient card click - show OTP modal if pending, navigate if verified
  const handlePatientClick = (consultation: Consultation) => {
    if (consultation.status === 'pending') {
      // Show OTP modal for pending patients
      setSelectedLinkId(consultation.id);
      setSelectedPatientName(consultation.name);
      setOtpCode('');
      setShowOtpModal(true);
    } else {
      // Navigate directly for verified or invited patients
      router.push({ 
        pathname: './patientDashboard', 
        params: { linkId: consultation.id } 
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8D5F2" />

      {/* OTP Verification Modal */}
      <Modal
        visible={showOtpModal}
        transparent
        animationType="fade"
        onRequestClose={() => !otpLoading && setShowOtpModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 24, width: '80%' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
              Verify Patient
            </Text>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
              Enter OTP for {selectedPatientName}
            </Text>
            <Text style={{ fontSize: 12, color: '#999', marginBottom: 16 }}>
              The verification code was sent to the patient&apos;s phone number
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                marginBottom: 16,
                textAlign: 'center',
                letterSpacing: 2,
              }}
              placeholder="000000"
              value={otpCode}
              onChangeText={setOtpCode}
              maxLength={6}
              keyboardType="numeric"
              editable={!otpLoading}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: '#E5E7EB',
                  alignItems: 'center',
                }}
                onPress={() => {
                  setShowOtpModal(false);
                  setOtpCode('');
                }}
                disabled={otpLoading}
              >
                <Text style={{ fontWeight: '600', color: '#374151' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: '#8B5CF6',
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onPress={handleVerifyOtp}
                disabled={otpLoading || otpCode.length !== 6}
              >
                {otpLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ fontWeight: '600', color: '#fff' }}>Verify</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
              onPress={() => handlePatientClick(consultation)}
            >
              <View style={styles.consultationLeft}>
                <View style={styles.avatar}>
                  <Ionicons name="person-outline" size={28} color="#9E9E9E" />
                </View>
                <View style={styles.consultationInfo}>
                  <Text style={styles.patientName}>{consultation.name}</Text>
                  <Text style={styles.appointmentDate}>{consultation.date}</Text>
                  {consultation.status ? (
                    <View style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      backgroundColor: consultation.status === 'verified' ? '#4CAF50' : (consultation.status === 'pending' ? '#FF9800' : '#2196F3'),
                      alignSelf: 'flex-start',
                      marginTop: 4,
                    }}>
                      <Text style={{ 
                        color: '#fff', 
                        fontSize: 12, 
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {consultation.status === 'verified' ? 'Verified ✓' : (consultation.status === 'pending' ? 'Pending' : 'Invited')}
                      </Text>
                    </View>
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

