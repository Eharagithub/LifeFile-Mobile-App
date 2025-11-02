import React, { useState, useEffect, useRef } from 'react';
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
import { Feather, } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';

// Firebase imports
import { db, auth } from '../../../../../config/firebaseConfig';
import authService from '../../../../../services/authService';

interface EditProfileProps {
  visible: boolean;
  onClose: () => void;
  userData: {
    fullName?: string;
    dateOfBirth?: string;
    nic?: string;
    gender?: string;
    email?: string; // Added email to userData interface
    [key: string]: any; // Allow other properties
  } | null;
}

const EditProfileScreen: React.FC<EditProfileProps> = ({
  visible,
  onClose,
  userData,
}) => {
  const [fullName, setFullName] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [nic, setNic] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [email, setEmail] = useState<string>(''); // State for email
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);
  const [isGenderPickerVisible, setGenderPickerVisibility] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const initialPersonalRef = useRef<{ fullName?: string; dateOfBirth?: string; nic?: string; gender?: string } | null>(null);

  // Get current user ID from Firebase Auth
  const currentUser = auth.currentUser;
  const userId = currentUser ? currentUser.uid : null;

  // Pre-fill form with existing user data when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Fetch data from Firestore user document (personal is a map field)
      const fetchPersonalData = async () => {
        if (!userId) {
          console.error("No user is signed in");
          return;
        }
        try {
          setLoading(true);

          // Use authService.getUserData which handles Patient/Doctor collection logic
          const res = await authService.getUserData(userId);
          if (res.success && res.data) {
            const data = res.data;
            const fetchedFullName = data?.personal?.fullName || '';
            const fetchedDob = data?.personal?.dateOfBirth || '';
            const fetchedNic = data?.personal?.nic || '';
            const fetchedGender = data?.personal?.gender || '';

            setFullName(fetchedFullName);
            setDateOfBirth(fetchedDob);
            setNic(fetchedNic);
            setGender(fetchedGender);
            // store initial values for diffing on submit
            initialPersonalRef.current = { fullName: fetchedFullName, dateOfBirth: fetchedDob, nic: fetchedNic, gender: fetchedGender };

            // remember role for writes
            if (data.role === 'doctor') setRole('doctor');
            else setRole('patient');
          } else {
            // Fallback: try the legacy 'users' collection if present
            try {
              const userDocRef = db.collection('users').doc(userId);
              const doc = await userDocRef.get();
                if (doc.exists) {
                const data = doc.data();
                const fetchedFullName = data?.personal?.fullName || '';
                const fetchedDob = data?.personal?.dateOfBirth || '';
                const fetchedNic = data?.personal?.nic || '';
                const fetchedGender = data?.personal?.gender || '';
                setFullName(fetchedFullName);
                setDateOfBirth(fetchedDob);
                setNic(fetchedNic);
                setGender(fetchedGender);
                initialPersonalRef.current = { fullName: fetchedFullName, dateOfBirth: fetchedDob, nic: fetchedNic, gender: fetchedGender };
              } else {
                setFullName('');
                setDateOfBirth('');
                setNic('');
                setGender('');
                initialPersonalRef.current = { fullName: '', dateOfBirth: '', nic: '', gender: '' };
              }
            } catch (legacyErr) {
              console.warn('Fallback read from users collection failed:', legacyErr);
              setFullName('');
              setDateOfBirth('');
              setNic('');
              setGender('');
              initialPersonalRef.current = { fullName: '', dateOfBirth: '', nic: '', gender: '' };
            }
          }
        } catch (error: any) {
          console.error("Error fetching personal data:", error);
          // Surface permission-specific message for easier debugging
          if (error && (error.code === 'permission-denied' || error.message?.includes('permission'))) {
            Alert.alert('Error', 'Missing or insufficient permissions when reading profile. Please check Firestore rules.');
          } else {
            Alert.alert('Error', 'Failed to load personal data.');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchPersonalData();
      setEmail(currentUser?.email || ''); // Always get email from currentUser
    }
  }, [visible, userId, currentUser]);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (date: Date) => {
    const formattedDate = formatDate(date);
    setDateOfBirth(formattedDate);
    hideDatePicker();
  };

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    const parts = dateString.split('/');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JS Date
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

    return new Date(year, month, day);
  };

  const toggleGenderPicker = () => {
    setGenderPickerVisibility(!isGenderPickerVisible);
  };

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to update your profile.');
      return;
    }

    // Build partial update by including only fields that changed compared to initial values.
    const partialUpdate: any = {};
    const initial = initialPersonalRef.current || {};

    if (fullName.trim() !== (initial.fullName || '')) partialUpdate.fullName = fullName.trim();
    if (dateOfBirth !== (initial.dateOfBirth || '')) partialUpdate.dateOfBirth = dateOfBirth;
    if (nic.trim() !== (initial.nic || '')) partialUpdate.nic = nic.trim();
    if (gender !== (initial.gender || '')) partialUpdate.gender = gender;

    if (Object.keys(partialUpdate).length === 0) {
      Alert.alert('No changes', 'No changes detected to save.');
      return;
    }

    try {
      setLoading(true);

      // Use centralized authService to handle partial writes to Patient/Doctor collections
      const res = await authService.updatePersonalFields(userId, partialUpdate as any, role);
      setLoading(false);
      if (res.success) {
        Alert.alert('Success', 'Profile updated successfully!');
        onClose(); // Close the modal after successful update
      } else {
        console.error('Error updating profile:', res.error);
        // Surface permission-specific message when available
        if (res.error && res.error.toLowerCase().includes('permission')) {
          Alert.alert('Error', 'Missing or insufficient permissions when updating profile. Please check Firestore rules.');
        } else {
          Alert.alert('Error', res.error || 'Failed to update profile. Please try again.');
        }
      }
    } catch (error: any) {
      setLoading(false);
      console.error('Error updating profile:', error);
      if (error && (error.code === 'permission-denied' || error.message?.includes('permission'))) {
        Alert.alert('Error', 'Missing or insufficient permissions when updating profile. Please check Firestore rules.');
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    // Reset form and close modal - re-fetch data to ensure latest state
    onClose();
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
                <Text style={styles.modalTitle}>Edit Profile</Text>
               
                
             
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
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <TouchableOpacity onPress={showDatePicker} activeOpacity={0.7}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="DD / MM / YYYY"
                    value={dateOfBirth}
                    editable={false}
                    pointerEvents="none"
                  />
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="date"
                  onConfirm={handleDateConfirm}
                  onCancel={hideDatePicker}
                  date={parseDate(dateOfBirth) || new Date()}
                  maximumDate={new Date()} // Can't select future dates
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NIC</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your NIC"
                  value={nic}
                  onChangeText={setNic}
                  keyboardType="default"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gender</Text>
                <TouchableOpacity onPress={toggleGenderPicker} activeOpacity={0.7}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Select gender"
                    value={gender}
                    editable={false}
                    pointerEvents="none"
                  />
                </TouchableOpacity>
                {isGenderPickerVisible && (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={gender}
                      onValueChange={(itemValue) => {
                        setGender(itemValue);
                        setGenderPickerVisibility(false);
                      }}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select gender" value="" style={{ fontWeight: '700', color: '#000306ff' }} />
                      <Picker.Item label="Male" value="Male" style={{ color: '#643b64ff' }} />
                      <Picker.Item label="Female" value="Female" style={{ color: '#643b64ff' }} />
                      <Picker.Item label="Other" value="Other" style={{ color: '#643b64ff' }} />
                      <Picker.Item label="Prefer not to say" value="Prefer not to say" style={{ color: '#643b64ff' }} />
                    </Picker>
                  </View>
                )}
              </View>
              <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit</Text>
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
 
  pickerContainer: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 5,
    backgroundColor: '#f5d6faff',
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    width: '100%',
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
  saveButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as '600',
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
  bloodTypeContainer: {
    flexDirection: 'row',
  },
  bloodTypeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  bloodTypeOptionSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  bloodTypeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as '500',
  },
  bloodTypeTextSelected: {
    color: '#FFFFFF',
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

export default EditProfileScreen;


