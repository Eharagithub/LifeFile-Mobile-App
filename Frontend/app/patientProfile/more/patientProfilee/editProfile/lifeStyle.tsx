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
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

// Firebase imports
import { db, auth } from '../../../../../config/firebaseConfig';
import authService from '../../../../../services/authService';

interface LifeStyleProps {
    visible: boolean;
    onClose: () => void;
}

const LifeStyleScreen: React.FC<LifeStyleProps> = ({ visible, onClose }) => {
    const [smoker, setSmoker] = useState<string | null>(null);
    const [diet, setDiet] = useState<string>('');
    const [alcohol, setAlcohol] = useState<string | null>(null);
    const [hereditary, setHereditary] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [role, setRole] = useState<'patient' | 'doctor'>('patient');

    const initialRef = useRef<{ smoker?: string | null; diet?: string; alcohol?: string | null; hereditary?: string } | null>(null);

    // Get current user ID from Firebase Auth
    const currentUser = auth.currentUser;
    const userId = currentUser ? currentUser.uid : null;

    useEffect(() => {
        if (!visible) return;
        const fetchLifestyle = async () => {
            if (!userId) return;
            setLoading(true);
            try {
                // Prefer reading the health/common subdoc which is the app's source of truth
                // Try Patient first, then Doctor
                let docSnap: any = null;
                try {
                    docSnap = await db.collection('Patient').doc(userId).collection('health').doc('common').get();
                    if (!docSnap.exists) {
                        docSnap = await db.collection('Doctor').doc(userId).collection('health').doc('common').get();
                    } else {
                        // set role to patient
                        setRole('patient');
                    }
                } catch (err) {
                    console.debug('health/common read error, will try authService.getUserData fallback', err);
                }

                // If still no docSnap or not exists, fallback to authService.getUserData
                let source: any = {};
                if (docSnap && docSnap.exists) {
                    source = docSnap.data() || {};
                } else {
                    const res = await authService.getUserData(userId);
                    if (res.success && res.data) {
                        // prefer health map if present
                        source = res.data.health || {};
                        if (res.data.role === 'doctor') setRole('doctor');
                        else setRole('patient');
                    }
                }

                // lifestyle may be nested under source.lifestyle
                const lifestyle = source.lifestyle || source || {};

                const fetchedSmoker = lifestyle.smoker ?? null;
                const fetchedDiet = lifestyle.dietaryPreference ?? '';
                const fetchedAlcohol = lifestyle.alcoholConsumption ?? null;
                const fetchedHereditary = lifestyle.hereditaryConditions ?? '';

                setSmoker(fetchedSmoker);
                setDiet(fetchedDiet);
                setAlcohol(fetchedAlcohol);
                setHereditary(fetchedHereditary);

                initialRef.current = { smoker: fetchedSmoker, diet: fetchedDiet, alcohol: fetchedAlcohol, hereditary: fetchedHereditary };
            } catch (err: any) {
                console.error('Failed to load lifestyle:', err);
                Alert.alert('Error', 'Failed to load lifestyle data.');
            } finally {
                setLoading(false);
            }
        };

        fetchLifestyle();
    }, [visible, userId]);

    const handleSubmit = async () => {
        if (!userId) {
            Alert.alert('Error', 'You must be logged in to update your lifestyle.');
            return;
        }

        const initial = initialRef.current || {};
        const partialLifestyle: any = {};

        if (smoker !== (initial.smoker ?? null)) partialLifestyle.smoker = smoker ?? 'no';
        if (diet !== (initial.diet || '')) partialLifestyle.dietaryPreference = diet || '';
        if (alcohol !== (initial.alcohol ?? null)) partialLifestyle.alcoholConsumption = alcohol ?? 'no';
        if (hereditary !== (initial.hereditary || '')) partialLifestyle.hereditaryConditions = hereditary || '';

        if (Object.keys(partialLifestyle).length === 0) {
            Alert.alert('No changes', 'No changes detected.');
            return;
        }

        try {
            setLoading(true);
            // Send partial update under health.lifestyle so updateUserProfile will flatten to health.lifestyle.*
            const res = await authService.updateUserProfile(userId, { health: { lifestyle: partialLifestyle } } as any, role);
            setLoading(false);
            if (res.success) {
                Alert.alert('Success', 'Lifestyle updated.');
                onClose();
            } else {
                Alert.alert('Error', res.error || 'Failed to update lifestyle.');
            }
        } catch (err: any) {
            setLoading(false);
            console.error('Update failed:', err);
            Alert.alert('Error', 'Failed to update lifestyle.');
        }
    };

    const handleCancel = () => onClose();

    return (
        <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={handleCancel}>
            <View style={styles.backdrop}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView} keyboardVerticalOffset={0}>
                    <View style={styles.popupContainer}>
                        <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
                            <View style={styles.header}>
                                <TouchableOpacity onPress={handleCancel} disabled={loading} activeOpacity={0.7}>
                                    <Feather name="x" size={24} color="#000306ff" />
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>Edit Life Style</Text>
                            </View>

                            {loading ? (
                                <ActivityIndicator size="large" color="#8B5CF6" style={{ marginVertical: 20 }} />
                            ) : (
                                <>
                                    <Text style={styles.inputLabel}>Smoker</Text>
                                    <View style={styles.radioRow}>
                                        <TouchableOpacity style={styles.radioBtn} onPress={() => setSmoker('yes')}>
                                            <View style={[styles.radioOuter, smoker === 'yes' && styles.radioOuterActive]}>
                                                {smoker === 'yes' && <View style={styles.radioInner} />}
                                            </View>
                                            <Text style={styles.radioLabel}>Yes</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.radioBtn} onPress={() => setSmoker('no')}>
                                            <View style={[styles.radioOuter, smoker === 'no' && styles.radioOuterActive]}>
                                                {smoker === 'no' && <View style={styles.radioInner} />}
                                            </View>
                                            <Text style={styles.radioLabel}>No</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.inputLabel}>Dietary Preference</Text>
                                    <View style={styles.inputWrapper}>
                                        <Picker selectedValue={diet} style={styles.dropdown} onValueChange={setDiet}>
                                            <Picker.Item label="Select diet" value="" color="#bdbdbd" />
                                            <Picker.Item label="Vegetarian" value="vegetarian" />
                                            <Picker.Item label="Non-Vegetarian" value="non-vegetarian" />
                                            <Picker.Item label="Vegan" value="vegan" />
                                        </Picker>
                                    </View>

                                    <Text style={styles.inputLabel}>Alcohol Habit</Text>
                                    <View style={styles.radioRow}>
                                        <TouchableOpacity style={styles.radioBtn} onPress={() => setAlcohol('yes')}>
                                            <View style={[styles.radioOuter, alcohol === 'yes' && styles.radioOuterActive]}>
                                                {alcohol === 'yes' && <View style={styles.radioInner} />}
                                            </View>
                                            <Text style={styles.radioLabel}>Yes</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.radioBtn} onPress={() => setAlcohol('no')}>
                                            <View style={[styles.radioOuter, alcohol === 'no' && styles.radioOuterActive]}>
                                                {alcohol === 'no' && <View style={styles.radioInner} />}
                                            </View>
                                            <Text style={styles.radioLabel}>No</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.inputLabel}>Any known hereditary condition</Text>
                                    <TextInput style={styles.textarea} placeholder="Enter details" placeholderTextColor="#bdbdbd" value={hereditary} onChangeText={setHereditary} multiline />

                                    <View style={{ height: 12 }} />
                                    <View style={styles.buttonRow}>
                                        <TouchableOpacity style={styles.previousBtn} onPress={handleCancel}>
                                            <Text style={styles.previousBtnText}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.signUpButton} onPress={handleSubmit}>
                                            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.nextBtnText}>Save</Text>}
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
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
    // Radio group styles
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    radioBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    radioOuterActive: {
        borderColor: '#8B5CF6',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#8B5CF6',
    },
    radioLabel: {
        fontSize: 14,
        color: '#374151',
    },

    inputWrapper: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        marginBottom: 12,
    },
    dropdown: {
        height: 48,
        width: '100%',
    },
    textarea: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1F2937',
        backgroundColor: '#FFFFFF',
        minHeight: 80,
        textAlignVertical: 'top',
    },

    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    previousBtn: {
        flex: 1,
        marginRight: 8,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    previousBtnText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600' as '600',
    },
    signUpButton: {
        flex: 1,
        marginLeft: 8,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#8B5CF6',
        alignItems: 'center',
    },
    nextBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600' as '600',
    },
});

export default LifeStyleScreen;


