import React, { useState } from 'react';
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
    StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db, auth, firebase } from '../../config/firebaseConfig';

export default function CreatePatient() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [age, setAge] = useState('');
    const [NIC, setNIC] = useState('');
    const [contact, setContact] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = () => {
        if (!fullName.trim()) {
            Alert.alert('Validation', 'Please enter patient full name');
            return false;
        }
        if (!NIC.trim()) {
            Alert.alert('Validation', 'Please enter patient NIC number');
            return false;
        }
        const ageNum = Number(age);
        if (!age || Number.isNaN(ageNum) || ageNum < 0 || ageNum > 130) {
            Alert.alert('Validation', 'Please enter a valid age');
            return false;
        }
        if (contact && !/^[0-9]{10}$/.test(contact.trim())) {
            Alert.alert('Validation', 'Contact number must contain exactly 10 digits');
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const doctorId = auth.currentUser?.uid || null;
            if (!doctorId) {
                Alert.alert('Error', 'You must be signed in to create a patient');
                setLoading(false);
                return;
            }

            const nicValue = NIC.trim();
            const phone = contact.trim() || '';

            // Step 1: Check for duplicate patient in doctor's existing patients list
            try {
                const duplicateCheck = await db
                    .collection('Doctor')
                    .doc(doctorId)
                    .collection('patients')
                    .where('nic', '==', nicValue)
                    .limit(1)
                    .get();

                if (!duplicateCheck.empty) {
                    // Patient already exists in this doctor's list
                    Alert.alert(
                        'Duplicate Patient',
                        'This patient is already in your patient list. You cannot add the same patient twice.'
                    );
                    setLoading(false);
                    return;
                }
            } catch (err) {
                console.error('Error checking duplicate patient:', err);
                // Continue with normal flow if check fails
            }

            // Step 2: Check if patient exists in Patient collection (existing registered patient)
            let existingPatientId: string | null = null;
            try {
                console.log('🔍 Checking Patient collection for NIC:', nicValue);
                console.log('📋 Scanning all Patient documents and their personal data...');
                
                // Must scan all patients because NIC is in personal field
                const allPatients = await db.collection('Patient').get();
                console.log('📋 Total Patient documents found:', allPatients.docs.length);
                
                for (const patientDoc of allPatients.docs) {
                    const patientId = patientDoc.id;
                    const patientData = patientDoc.data();
                    
                    console.log('🔍 Checking patient:', patientId);
                    
                    // personal is a field (map/object), not a subcollection
                    const personalData = patientData.personal;
                    
                    if (personalData && typeof personalData === 'object') {
                        console.log('   ✅ Personal data found. Fields:', Object.keys(personalData));
                        console.log('   NIC value stored:', personalData.nic);
                        console.log('   Searching for NIC value:', nicValue);
                        
                        // Check if NIC matches
                        if (personalData.nic === nicValue) {
                            existingPatientId = patientId;
                            console.log('✅ FOUND matching patient with NIC:', patientId);
                            break;
                        }
                    } else {
                        console.log('   ⚠️ No personal data found for patient:', patientId);
                    }
                }
                
                if (existingPatientId) {
                    console.log('✅ Found existing patient in Patient collection:', existingPatientId);
                } else {
                    console.log('⚠️ No existing patient found in Patient collection for NIC:', nicValue);
                }
            } catch (err: any) {
                console.error('❌ Error checking Patient collection:', err);
                // If permission denied, we can fallback to public patients
                if (err?.code === 'permission-denied') {
                    console.warn('⚠️ Permission denied accessing Patient collection. Proceeding with publicPatients only.');
                }
            }

            // If existing patient found in Patient collection — create link with pending status
            if (existingPatientId) {
                console.log('📝 Creating doctor patient link for existing Patient collection patient:', existingPatientId);
                const linkRef = await db.collection('Doctor').doc(doctorId).collection('patients').add({
                    patientId: existingPatientId,
                    nic: nicValue,
                    fullName: fullName.trim(),
                    contactNumber: phone,
                    status: 'pending',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                });

                const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
                await db.collection('Doctor').doc(doctorId).collection('patients').doc(linkRef.id).collection('verification').doc('sms').set({
                    code: verificationCode,
                    phone,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    verified: false,
                });

                // In production, send SMS from a secure backend (Cloud Function) and do not show code in the client.
                console.log('✅ Verification code created. OTP:', verificationCode);
                Alert.alert('Verification started', `Verification code generated for ${phone}. (dev: ${verificationCode})`);
                router.back();
                return;
            }

            // Step 3: Check publicPatients collection for existing public profile
            const existingPublic = await db.collection('publicPatients').where('nic', '==', nicValue).limit(1).get();
            if (!existingPublic.empty) {
                // existing public patient found — link to that patient with pending status
                const patientDoc = existingPublic.docs[0];
                const patientId = patientDoc.id;

                const linkRef = await db.collection('Doctor').doc(doctorId).collection('patients').add({
                    patientId,
                    nic: nicValue,
                    fullName: patientDoc.data().fullName || fullName.trim(),
                    contactNumber: phone,
                    status: 'pending',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                });

                const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
                await db.collection('Doctor').doc(doctorId).collection('patients').doc(linkRef.id).collection('verification').doc('sms').set({
                    code: verificationCode,
                    phone,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    verified: false,
                });

                // In production, send SMS from a secure backend (Cloud Function) and do not show code in the client.
                Alert.alert('Verification started', `Verification code generated for ${phone}. (dev: ${verificationCode})`);
                router.back();
                return;
            }

            // Step 4: No existing patient — create provisional publicPatients index entry and invite
            const publicPayload = {
                nic: nicValue,
                fullName: fullName.trim(),
                phone,
                invitedByDoctor: doctorId,
                invitedAt: firebase.firestore.FieldValue.serverTimestamp(),
            };
            const publicRef = await db.collection('publicPatients').add(publicPayload);

            const linkRef = await db.collection('Doctor').doc(doctorId).collection('patients').add({
                patientId: publicRef.id,
                nic: nicValue,
                fullName: fullName.trim(),
                contactNumber: phone,
                status: 'invited',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });

            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            await db.collection('Doctor').doc(doctorId).collection('patients').doc(linkRef.id).collection('verification').doc('sms').set({
                code: verificationCode,
                phone,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                verified: false,
            });

            Alert.alert('Patient invited', `An invitation was created. Patient should sign up and verify. (dev code: ${verificationCode})`);
            router.back();
        } catch (err) {
            console.error('Error creating patient', err);
            Alert.alert('Error', 'Failed to create patient. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={true}
            animationType="fade"
            transparent={true}
            onRequestClose={() => router.back()}
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
                                <TouchableOpacity onPress={() => router.back()} disabled={loading} activeOpacity={0.7}>
                                    <Feather name="x" size={24} color="#000" />
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>Create Patient</Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Full Name</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={fullName}
                                    onChangeText={setFullName}
                                    editable={!loading}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Age</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={age}
                                    onChangeText={setAge}
                                    editable={!loading}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>NIC Number</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={NIC}
                                    onChangeText={setNIC}
                                    editable={!loading}
                                 
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Contact Number</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={contact}
                                    onChangeText={setContact}
                                    editable={!loading}
                                    keyboardType="phone-pad"
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
                                    <Text style={styles.submitButtonText}>Create Patient</Text>
                                )}
                            </TouchableOpacity>

                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

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
        shadowOffset: { width: 0, height: 10 },
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
        marginBottom: 34,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        textAlign: 'center',
        flex: 1,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '800',
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
        height: 54,
        backgroundColor: '#8B5CF6',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    submitButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },
});
