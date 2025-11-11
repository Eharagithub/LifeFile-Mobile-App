import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  StyleSheet
} from 'react-native';
import { Feather } from '@expo/vector-icons';

// Firebase imports
import { db, auth } from '../../../../../config/firebaseConfig';
import authService from '../../../../../services/authService';

interface ContactInforProps {
  visible: boolean;
  onClose: () => void;
  userData: {
    email?: string;
    contactNumber?: string;
    [key: string]: any; // Allow other properties
  } | null;
}

const ContactInforScreen: React.FC<ContactInforProps> = ({
  visible,
  onClose,
  userData,
}) => {
  const [email, setEmail] = useState<string>('');
  const [contactNumber, setcontactNumber] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');

  // Get current user ID from Firebase Auth
  const currentUser = auth.currentUser;
  const userId = currentUser ? currentUser.uid : null;

  // Pre-fill form with existing user data when modal becomes visible
  useEffect(() => {
    if (visible) {
      const fetchContactInfor = async () => {
        if (!userId) {
          console.error("No user is signed in");
          return;
        }
        try {
          setLoading(true);
          // Use centralized service to get user data (handles Patient/Doctor collections and permissions)
          const res = await authService.getUserData(userId);
          if (res.success && res.data) {
            const data = res.data;
            setEmail(currentUser?.email || data?.email || '');
            setcontactNumber(data?.personal?.contactNumber || '');
            if (data.role === 'doctor') setRole('doctor');
            else setRole('patient');
          } else {
            // Fallback to legacy users collection if necessary
            try {
              const userDocRef = db.collection('users').doc(userId);
              const doc = await userDocRef.get();
              if (doc.exists) {
                const data = doc.data();
                setEmail(currentUser?.email || data?.email || '');
                setcontactNumber(data?.personal?.contactNumber || '');
                // no role info in legacy users collection; default to patient
                setRole('patient');
              } else {
                setEmail(currentUser?.email || '');
                setcontactNumber('');
                setRole('patient');
              }
            } catch (legacyErr) {
              console.warn('Fallback read from users collection failed:', legacyErr);
              setEmail(currentUser?.email || '');
              setcontactNumber('');
              setRole('patient');
            }
          }
        }
        catch (error: any) {
          console.error("Error fetching personal data:", error);
          if (error && (error.code === 'permission-denied' || error.message?.includes('permission'))) {
            Alert.alert('Error', 'Missing or insufficient permissions when reading contact information. Please check Firestore rules.');
          } else {
            Alert.alert("Error", "Failed to load personal data.");
          }
        } finally {
          setLoading(false);
        }
      };

      fetchContactInfor();
    }
  }, [visible, userId, currentUser]);


  const handleCancel = () => {
    // Reset form and close modal - re-fetch data to ensure latest state
    onClose();
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to update your contact information.');
      return;
    }

    // Validate contact number: must be exactly 10 numeric digits
    const sanitized = contactNumber.trim();
    if (!/^[0-9]{10}$/.test(sanitized)) {
      Alert.alert('Error', 'Contact number must contain exactly 10 digits.');
      return;
    }

    try {
      setLoading(true);
      // Use updateUserProfile to apply a partial update without requiring full personal fields
  const res = await authService.updateUserProfile(userId, { personal: { contactNumber: sanitized } } as any, role);
      setLoading(false);
      if (res.success) {
        Alert.alert('Success', 'Contact information updated successfully.');
        onClose();
      } else {
        console.error('Error updating contact info:', res.error);
        if (res.error && res.error.toLowerCase().includes('permission')) {
          Alert.alert('Error', 'Missing or insufficient permissions when updating contact information. Please check Firestore rules.');
        } else {
          Alert.alert('Error', res.error || 'Failed to update contact information.');
        }
      }
    } catch (error: any) {
      setLoading(false);
      console.error('Error updating contact info:', error);
      if (error && (error.code === 'permission-denied' || error.message?.includes('permission'))) {
        Alert.alert('Error', 'Missing or insufficient permissions when updating contact information. Please check Firestore rules.');
      } else {
        Alert.alert('Error', 'Failed to update contact information.');
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleCancel}
      statusBarTranslucent={true}
    >
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={0}
        >
          <View style={styles.popupContainer}>
            <ScrollView
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={handleCancel}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={24} color="#000306ff" />

                </TouchableOpacity>
                <Text style={styles.modalTitle}>Contact Information</Text>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.textInput}
                  value={email}
                  editable={false} // Make email read-only
                  pointerEvents="none" // Prevent interaction
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={contactNumber}
                  onChangeText={setcontactNumber}
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSave}
                disabled={loading}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>Save</Text>
                )}
              </TouchableOpacity>

            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const { height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    maxHeight: screenHeight - 40,
    overflow: 'hidden',
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 34
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as '700',
    color: '#1F2937',
    textAlign: 'center',
    flex: 1
  },

  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '800' as '800',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    height: 48,
  },
  submitButton: {
    flex: 1,
    height: 38,
    backgroundColor: '#8B5CF6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 200,
    width: '40%',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as '600',
    color: '#ffffff',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  modalContent: {
    flex: 1,
    padding: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  modalContentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInputError: {
    borderColor: '#EF4444',
  },
  textInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },

  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3E8FF',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#6B46C1',
    marginLeft: 8,
    lineHeight: 20,
  },
});

export default ContactInforScreen;


