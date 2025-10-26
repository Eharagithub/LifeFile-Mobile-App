import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Image, Platform, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import styles from '../Auth/signup.styles';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AuthService from '../../../services/authService';
// Import firebase config (do NOT include file extension — TS/ESLint and Metro expect extensionless imports)
import { db } from '../../../config/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';

export default function CreateDocProfile() {
    const router = useRouter();
    const { userId } = useLocalSearchParams();

    const [fullName, setFullName] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [primarySpecialization, setPrimarySpecialization] = useState('');
    const [primaryHospital, setPrimaryHospital] = useState('');
    const [medicalQualifications, setMedicalQualifications] = useState('');
    const [introduction, setIntroduction] = useState('');
    const [experience, setExperience] = useState('');
    const [conditions, setConditions] = useState('');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [fileName, setFileName] = useState('No file chosen');
    const [isLoading, setIsLoading] = useState(false);
    const [agree, setAgree] = useState(false);

    const resetFormRef = useRef(() => {
        setFullName('');
        setRegistrationNumber('');
        setPrimarySpecialization('');
        setPrimaryHospital('');
        setMedicalQualifications('');
        setIntroduction('');
        setExperience('');
        setConditions('');
        setProfileImage(null);
        setFileName('No file chosen');
    });

    useEffect(() => {
        resetFormRef.current();
    }, [userId]);

    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (galleryStatus.status !== 'granted') {
                    Alert.alert('Permission required', 'We need camera roll permissions to upload your profile picture.');
                }

                const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
                if (cameraStatus.status !== 'granted') {
                    Alert.alert('Permission required', 'We need camera permissions to take a profile picture.');
                }
            }
        })();
    }, []);

    const pickImage = async (source: 'camera' | 'gallery') => {
        try {
            const options = {
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1] as [number, number],
                quality: 0.7,
            };

            let result;
            if (source === 'camera') result = await ImagePicker.launchCameraAsync(options);
            else result = await ImagePicker.launchImageLibraryAsync(options);

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setProfileImage(asset.uri);
                const parts = asset.uri.split('/');
                setFileName(parts[parts.length - 1] || 'profile.jpg');
            }
        } catch (err) {
            console.error('Image pick error', err);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleChooseFile = () => {
        Alert.alert('Select Image', 'Choose image source', [
            { text: 'Camera', onPress: () => pickImage('camera') },
            { text: 'Gallery', onPress: () => pickImage('gallery') },
            { text: 'Cancel', style: 'cancel' }
        ]);
    };

    const goBack = () => router.push('/auth/Auth/signup');

    const completeRegistration = async () => {
        // validate required fields and agreement
        if (!fullName || !registrationNumber) {
            Alert.alert('Validation', 'Please fill Full Name and Registration Number');
            return;
        }

        if (!agree) {
            Alert.alert('Agreement required', 'Please agree to the Terms of Service and Privacy Policy');
            return;
        }

        if (!userId) {
            Alert.alert('Error', 'Missing user id. Please sign up again.');
            router.push('/auth/Auth/signup');
            return;
        }

        setIsLoading(true);
        try {
            // ensure professional info is saved
            const doctorPayload = {
                fullName,
                registrationNumber,
                primarySpecialization,
                primaryHospital,
                medicalQualifications,
                introduction,
                experience,
                conditions,
                profilePicture: profileImage || ''
            };

            const saveResult = await AuthService.saveDoctorInformation(userId as string, doctorPayload);
            if (!saveResult.success) {
                Alert.alert('Save failed', saveResult.error || 'Failed to save doctor profile');
                setIsLoading(false);
                return;
            }

            // mark registrationCompleted and timestamp on Doctor doc
            const userRef = doc(db, 'Doctor', userId as string);
            await setDoc(userRef, {
                registrationCompleted: true,
                registrationCompletedAt: new Date().toISOString()
            }, { merge: true });

            Alert.alert('Account Created', 'Your doctor account has been created successfully');
            // Navigate to login or doctor home — default to login
            router.push('/auth/login');
        } catch (err) {
            console.error('Complete registration error', err);
            Alert.alert('Error', 'Failed to complete registration. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.logoContainer}>
                    <Image source={require('../../../assets/images/logo.png')} style={styles.heartIcon} resizeMode="contain" />
                </View>

                <View style={styles.stepsRow}>
                    <View style={styles.stepCircle}><Text style={styles.stepNumInactive}>1</Text></View>
                    <View style={styles.stepLine} />
                    <View style={styles.stepCircleActive}><Text style={styles.stepNum}>2</Text></View>
                </View>
                {/* For doctor role, place labels immediately under their corresponding numbers using inline styles */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={[styles.stepLabel, { textAlign: 'center' }]}>Account</Text>
                    </View>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={[styles.stepLabelActive, { textAlign: 'center' }]}>Personal</Text>
                    </View>
                </View>

                <View style={styles.sectionTitleRow}>
                    <Feather name="user" size={18} color="#222" />
                    <Text style={styles.sectionTitle}> Doctor Profile</Text>
                </View>
                <View style={styles.sectionDivider} />

                <Text style={styles.inputLabel}>Full Name <Text style={styles.req}>*</Text></Text>
                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Dr. John Doe" placeholderTextColor="#bdbdbd" />
                </View>

                <Text style={styles.inputLabel}>Registration Number <Text style={styles.req}>*</Text></Text>
                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} value={registrationNumber} onChangeText={setRegistrationNumber} placeholder="Reg. No" placeholderTextColor="#bdbdbd" />
                </View>

                <Text style={styles.inputLabel}>Primary Specialization</Text>
                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} value={primarySpecialization} onChangeText={setPrimarySpecialization} placeholder="e.g. Cardiology" placeholderTextColor="#bdbdbd" />
                </View>

                <Text style={styles.inputLabel}>Primary Hospital</Text>
                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} value={primaryHospital} onChangeText={setPrimaryHospital} placeholder="Hospital name" placeholderTextColor="#bdbdbd" />
                </View>

                <Text style={styles.inputLabel}>Medical Qualifications</Text>
                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} value={medicalQualifications} onChangeText={setMedicalQualifications} placeholder="MBBS, MD..." placeholderTextColor="#bdbdbd" />
                </View>

                <Text style={styles.inputLabel}>Introduction</Text>
                <View style={styles.inputWrapper}>
                    <TextInput style={[styles.input, { height: 100 }]} value={introduction} onChangeText={setIntroduction} placeholder="Short intro" placeholderTextColor="#bdbdbd" multiline />
                </View>

                <Text style={styles.inputLabel}>Experience</Text>
                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} value={experience} onChangeText={setExperience} placeholder="e.g. 10 years" placeholderTextColor="#bdbdbd" />
                </View>

                <Text style={styles.inputLabel}>Conditions Treated</Text>
                <View style={styles.inputWrapper}>
                    <TextInput style={styles.input} value={conditions} onChangeText={setConditions} placeholder="e.g. Hypertension" placeholderTextColor="#bdbdbd" />
                </View>

                <Text style={styles.inputLabel}>Profile Picture</Text>
                <View style={styles.profileRow}>
                    <TouchableOpacity style={styles.profileAvatar} onPress={handleChooseFile}>
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={{ width: 70, height: 70, borderRadius: 35 }} />
                        ) : (
                            <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: '#f6f6f6', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e4e4e4' }}>
                                <Feather name="user" size={36} style={styles.profileIcon} />
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.profileTextCol}>
                        <Text style={styles.profileLabel}>Upload your profile photo</Text>
                        <View style={styles.fileRow}>
                            <TouchableOpacity style={styles.chooseFileBtn} onPress={handleChooseFile}><Text style={styles.chooseFileText}>Choose File</Text></TouchableOpacity>
                            <Text style={[styles.fileName, { flex: 1 }]} numberOfLines={1} ellipsizeMode="middle">{fileName}</Text>
                        </View>
                        {profileImage && (
                            <TouchableOpacity style={{ marginTop: 8 }} onPress={() => { setProfileImage(null); setFileName('No file chosen'); }}>
                                <Text style={{ color: '#e24d4d', fontSize: 13 }}>Remove</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Checkbox and Terms */}
                <View style={styles.checkboxContainer}>
                    <TouchableOpacity onPress={() => setAgree((prev) => !prev)} style={styles.checkbox}>
                        <View style={[styles.checkboxBox, agree && styles.checkboxBoxChecked]}>
                            {agree && <Feather name="check" size={16} color="#7d4c9e" />}
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.checkboxText}>
                        I agree to the healthcare{' '}
                        <Text style={styles.link}>Terms of Service</Text> and{' '}
                        <Text style={styles.link}>Privacy Policy</Text>
                    </Text>
                </View>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.previousBtn} onPress={goBack}><Text style={styles.previousBtnText}>Previous</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.signUpButton} onPress={completeRegistration} disabled={isLoading}>{isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.nextBtnText}>Create Account</Text>}</TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
