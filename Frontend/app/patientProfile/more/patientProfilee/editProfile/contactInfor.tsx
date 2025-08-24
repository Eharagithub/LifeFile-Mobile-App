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
  Dimensions,
  StyleSheet
} from 'react-native';
import { Feather, } from '@expo/vector-icons';

// Firebase imports
import { db, auth } from '../../../../../config/firebaseConfig';

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
          const userDocRef = db.collection('users').doc(userId);
          const doc = await userDocRef.get();
          if (doc.exists) {
            const data = doc.data();
            // Assuming email is stored directly in the user document or derived from auth.currentUser
            // Assuming contactNumber is nested under 'personal' as per the Firestore screenshot
            setEmail(currentUser?.email || data?.email || '');
            setcontactNumber(data?.personal?.contactNumber || '');
          } else {
            console.log("No such document!");
            setEmail(currentUser?.email || '');
            setcontactNumber('');
          }
        }
        catch (error) {
          console.error("Error fetching personal data:", error);
          Alert.alert("Error", "Failed to load personal data.");
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
                  editable={false} // Make contact read-only
                  pointerEvents="none" // Prevent interaction
                />
              </View>

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


