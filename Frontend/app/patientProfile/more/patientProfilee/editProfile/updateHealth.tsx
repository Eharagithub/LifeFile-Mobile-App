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
import { Feather, } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

// Firebase imports
import { db, auth } from '../../../../../config/firebaseConfig';
import authService from '../../../../../services/authService';

interface UpdateHealthProps {
    visible: boolean;
    onClose: () => void;
    userData: {
        weight?: string;
        height?: string;
        bmi?: string;
        bloodType?: string;
        allergies?: string;
        [key: string]: any; // Allow other properties
    } | null;
}

const UpdateHealthScreen: React.FC<UpdateHealthProps> = ({
    visible,
    onClose,
    userData,
}) => {
    const [weight, setWeight] = useState<string>('');
    const [height, setHeight] = useState<string>('');
    const [bmi, setBmi] = useState<string>('');
    const [bloodType, setBloodType] = useState<string>('');
    const [allergies, setAllergies] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [role, setRole] = useState<'patient' | 'doctor'>('patient');

    // Get current user ID from Firebase Auth
    const currentUser = auth.currentUser;
    const userId = currentUser ? currentUser.uid : null;

    // Pre-fill form with existing user data when modal becomes visible
    // Recalculate BMI whenever weight or height changes
    useEffect(() => {
        const computeBmi = () => {
            const w = parseFloat(weight.toString().trim());
            const h = parseFloat(height.toString().trim());
            if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
                setBmi('');
                return;
            }
            // assume height in cm if > 3 (e.g., 170)
            const heightMeters = h > 3 ? h / 100 : h;
            const value = w / (heightMeters * heightMeters);
            setBmi(value.toFixed(1));
        };
        computeBmi();
    }, [weight, height]);

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
                        const data = res.data as any; // cast to any since personal may contain dynamic fields like weight/height/bmi
                        setWeight(data?.personal?.weight || '');
                        setHeight(data?.personal?.height || '');
                        setBmi(data?.personal?.bmi || '');
                        setBloodType(data?.personal?.bloodType || '');
                        setAllergies(data?.personal?.allergies || '');
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
                                setWeight(data?.personal?.weight || '');
                                setHeight(data?.personal?.height || '');
                                setBloodType(data?.personal?.bloodType || '');
                                setAllergies(data?.personal?.allergies || '');
                            } else {
                                setWeight('');
                                setHeight('');
                                setBloodType('');
                                setAllergies('');
                            }
                        } catch (legacyErr) {
                            console.warn('Fallback read from users collection failed:', legacyErr);
                            setWeight('');
                            setHeight('');
                            setBloodType('');
                            setAllergies('');
                        }
                    }
                } catch (error: any) {
                    console.error("Error fetching Health data:", error);
                    // Surface permission-specific message for easier debugging
                    if (error && (error.code === 'permission-denied' || error.message?.includes('permission'))) {
                        Alert.alert('Error', 'Missing or insufficient permissions when reading profile. Please check Firestore rules.');
                    } else {
                        Alert.alert('Error', 'Failed to load Health data.');
                    }
                } finally {
                    setLoading(false);
                }
            };

            fetchPersonalData();
        }
    }, [visible, userId, currentUser]);


    const handleSubmit = async () => {
        if (!userId) {
            Alert.alert('Error', 'You must be logged in to update your profile.');
            return;
        }

        // Basic validation
        if (!weight.trim()) {
            Alert.alert('Error', 'Please enter your weight.');
            return;
        }

        try {
            setLoading(true);

            // Basic numeric validation for weight and height
            const w = parseFloat(weight.toString().trim());
            const h = parseFloat(height.toString().trim());
            if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
                setLoading(false);
                Alert.alert('Error', 'Please enter valid numeric values for weight and height.');
                return;
            }

            // Compute BMI (assume height in cm if value > 3)
            const heightMeters = h > 3 ? h / 100 : h;
            const computedBmi = (w / (heightMeters * heightMeters));
            const bmiValue = computedBmi.toFixed(1);

            // Prepare updated data for the 'health' map field
            const updatedHealthData = {
                weight: String(w),
                height: String(h),
                bmi: bmiValue,
                bloodType: bloodType.trim(),
                allergies: allergies,
            };

            // Use centralized authService to perform a partial health update via updateUserProfile
            const res = await authService.updateUserProfile(userId, { health: updatedHealthData } as any, role);
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
                                <Text style={styles.inputLabel}>Weight</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Enter your Weight"
                                    value={weight}
                                    onChangeText={setWeight}
                                    autoCapitalize="words"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Height</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Enter your Height"
                                    value={height}
                                    onChangeText={setHeight}
                                    autoCapitalize="words"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>BMI</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={bmi}
                                    editable={false}
                                    pointerEvents="none"
                                />
                            </View>



                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>BloodType</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Enter your BloodType"
                                    value={bloodType}
                                    onChangeText={setBloodType}
                                    keyboardType="default"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Allergies</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Enter your Allergies"
                                    value={allergies}
                                    onChangeText={setAllergies}
                                    keyboardType="default"
                                />
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

export default UpdateHealthScreen;


