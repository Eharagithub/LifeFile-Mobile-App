import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    FlatList,
    Image, Platform, Alert, ActivityIndicator, Modal
} from 'react-native';
import { Feather, FontAwesome5, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import styles from './editProfile.styles';
import BottomNavigation from '../../../common/BottomNavigation';
import { db } from '../../../../config/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import AuthService from '../../../../services/authService';

export default function EditProfile() {

    const { userId } = useLocalSearchParams();
    const [fullName, setFullName] = useState('');
    const [dob, setDob] = useState('');
    const [nic, setNic] = useState('');
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState('');
    const [contact, setContact] = useState('');
    const [fileName, setFileName] = useState('No file chosen');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const handleBack = () => {
        router.back();
    };

    // New state variables for improved date picker
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - 30); // Default to 30 years ago
    const [showMonthDayPicker, setShowMonthDayPicker] = useState(false);


    // Add new state for profile image
    const [profileImage, setProfileImage] = useState<string | null>(null);


    // Store the resetFormData function in a ref to avoid recreating it on each render
    const resetFormDataRef = useRef(() => {
        console.log("CreateProfile: Resetting form data");
        setFullName('');
        setDob('');
        setNic('');
        setGender('');
        setAddress('');
        setContact('');
        setFileName('No file chosen');
        setProfileImage(null); // Reset profile image
        setDate(new Date());
        setShowDatePicker(false);
    });
    // Force reset form data when component mounts or userId changes
    useEffect(() => {
        console.log("CreateProfile: New userId detected, resetting form");
        resetFormDataRef.current();
    }, [userId]);

    // Request permissions for image picker and camera when component mounts
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

    // Enhanced image picker with options for gallery or camera
    const handleChooseFile = async () => {
        Alert.alert(
            "Select Image",
            "Choose image from:",
            [
                {
                    text: "Camera",
                    onPress: () => pickImage("camera")
                },
                {
                    text: "Gallery",
                    onPress: () => pickImage("gallery")
                },
                {
                    text: "Cancel",
                    style: "cancel"
                }
            ]
        );
    };

    // Function to handle image selection from either camera or gallery
    const pickImage = async (source: "camera" | "gallery") => {
        try {
            let result;
            const options = {
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1] as [number, number],
                quality: 0.7,
            };

            if (source === "camera") {
                result = await ImagePicker.launchCameraAsync(options);
            } else {
                result = await ImagePicker.launchImageLibraryAsync(options);
            }

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedAsset = result.assets[0];
                setProfileImage(selectedAsset.uri);

                // Extract file name from URI or use a default name
                const uriParts = selectedAsset.uri.split('/');
                const fileName = uriParts[uriParts.length - 1];
                setFileName(fileName || 'profile.jpg');
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to select image. Please try again.');
        }
    };

    // Handle submit button click
    const submit = async () => {
        setIsLoading(true);
        try {
            const personalData = {
                fullName,
                dateOfBirth: dob,
                nic,
                gender,
                address: address || '',
                contactNumber: contact || '',
                profilePicture: profileImage || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            const result = await AuthService.savePersonalInformation(userId as string, personalData);

            if (result.success) {
                console.log('Personal profile data saved for user:', userId);
                router.push({
                    pathname: '/auth/patientAuth/healthProfile',
                    params: { userId }
                });
            } else {
                Alert.alert('Save Failed', result.error || 'Failed to save personal information');
            }
        } catch (error) {
            console.error('Unexpected error saving profile:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Show date picker
    const showDatepicker = () => {
        // Instead of showing DateTimePicker directly, show the year picker first
        setShowYearPicker(true);
    };

    // Generate an array of years for the picker (100 years back from current year)
    const getYears = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= currentYear - 100; i--) {
            years.push(i);
        }
        return years;
    };

    // Handle year selection
    const handleYearSelected = () => {
        // Close year picker
        setShowYearPicker(false);

        // Set the date to January 1st of the selected year
        const newDate = new Date(date);
        newDate.setFullYear(selectedYear);
        setDate(newDate);

        // Now show the month/day picker
        setShowMonthDayPicker(true);
    };

    // Handle date change from the month/day picker
    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowMonthDayPicker(Platform.OS === 'ios' ? true : false);

        if (event.type === 'dismissed') {
            return; // User canceled, don't update the date
        }

        if (selectedDate) {
            setDate(selectedDate);

            // Format date as DD/MM/YYYY
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const year = selectedDate.getFullYear();
            setDob(`${day}/${month}/${year}`);
        }
    };
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                >
                    <Feather name="chevron-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
            </View>

            {/*body*/}
            <ScrollView style={styles.content}>

                {/* Profile Image Section */}
                <Text style={styles.inputLabel}>
                    Profile Picture
                </Text>
                <View style={styles.profileRow}>
                    <TouchableOpacity
                        style={styles.profileAvatar}
                        onPress={handleChooseFile}
                    >
                        {profileImage ? (
                            <Image
                                source={{ uri: profileImage }}
                                style={{
                                    width: 130,
                                    height: 130,
                                    borderRadius: 65,
                                }}
                            />
                        ) : (
                            <View style={{
                                width: 130,
                                height: 130,
                                borderRadius: 65,
                                backgroundColor: '#f6f6f6',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                                borderColor: '#e4e4e4',
                                position: 'relative',
                            }}>
                                <Feather name="user" size={56} style={styles.profileIcon} />
                                <View style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    backgroundColor: '#7d4c9e',
                                    width: 34,
                                    height: 34,
                                    borderRadius: 12,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Feather name="camera" size={14} color="#fff" />
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>
                    <View style={styles.profileTextCol}>
                        <Text style={styles.profileLabel}>Upload your profile photo</Text>
                        <View style={styles.fileRow}>
                            <TouchableOpacity style={styles.chooseFileBtn} onPress={handleChooseFile}>
                                <Text style={styles.chooseFileText}>Choose File</Text>
                            </TouchableOpacity>
                            <Text style={[styles.fileName, { flex: 1 }]} numberOfLines={1} ellipsizeMode="middle">
                                {fileName}
                            </Text>
                        </View>
                        {profileImage && (
                            <TouchableOpacity
                                style={{ marginTop: 8 }}
                                onPress={() => {
                                    setProfileImage(null);
                                    setFileName('No file chosen');
                                }}
                            >
                                <Text style={{ color: '#e24d4d', fontSize: 13 }}>Remove</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Full Name Input */}
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your full name"
                        value={fullName}
                        onChangeText={setFullName}
                    />
                </View>

                {/* Date of Birth */}
                <Text style={styles.inputLabel}>
                    Date of Birth <Text style={styles.req}>*</Text>
                </Text>
                <TouchableOpacity
                    style={styles.inputWrapper}
                    onPress={showDatepicker}
                >
                    <Feather name="calendar" size={18} color="#bdbdbd" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="DD/MM/YYYY"
                        placeholderTextColor="#bdbdbd"
                        value={dob}
                        editable={false} // Make it non-editable as we'll use the date picker
                    />
                    <Feather name="chevron-down" size={18} color="#bdbdbd" />
                </TouchableOpacity>

                {/* Show the year picker when showYearPicker is true */}
                {showYearPicker && (
                    <Modal transparent={true} animationType="fade" visible={showYearPicker}>
                        <View style={styles.datePickerModal}>
                            <View style={styles.datePickerContainer}>
                                <Text style={styles.datePickerTitle}>Select Birth Year</Text>
                                <View style={styles.yearPickerContainer}>
                                    <Picker
                                        selectedValue={selectedYear}
                                        onValueChange={(itemValue) => setSelectedYear(itemValue)}
                                        style={{ width: '100%' }}
                                    >
                                        {getYears().map((year) => (
                                            <Picker.Item key={year} label={String(year)} value={year} />
                                        ))}
                                    </Picker>
                                </View>
                                <View style={styles.datePickerButtonRow}>
                                    <TouchableOpacity
                                        style={[styles.datePickerButton, styles.cancelButton]}
                                        onPress={() => setShowYearPicker(false)}
                                    >
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.datePickerButton, styles.confirmButton]}
                                        onPress={handleYearSelected}
                                    >
                                        <Text style={styles.confirmButtonText}>Next</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                )}

                {/* Show the month/day picker when showMonthDayPicker is true */}
                {showMonthDayPicker && (
                    Platform.OS === 'ios' ? (
                        <Modal transparent={true} animationType="fade" visible={showMonthDayPicker}>
                            <View style={styles.datePickerModal}>
                                <View style={styles.datePickerContainer}>
                                    <Text style={styles.datePickerTitle}>Select Month and Day</Text>
                                    <DateTimePicker
                                        testID="dateTimePicker"
                                        value={date}
                                        mode="date"
                                        display="spinner"
                                        onChange={onChangeDate}
                                        maximumDate={new Date()}
                                    />
                                    <View style={styles.datePickerButtonRow}>
                                        <TouchableOpacity
                                            style={[styles.datePickerButton, styles.cancelButton]}
                                            onPress={() => {
                                                setShowMonthDayPicker(false);
                                                setShowYearPicker(true); // Go back to year selection
                                            }}
                                        >
                                            <Text style={styles.cancelButtonText}>Back</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.datePickerButton, styles.confirmButton]}
                                            onPress={() => {
                                                // Format date as DD/MM/YYYY
                                                const day = String(date.getDate()).padStart(2, '0');
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const year = date.getFullYear();
                                                setDob(`${day}/${month}/${year}`);
                                                setShowMonthDayPicker(false);
                                            }}
                                        >
                                            <Text style={styles.confirmButtonText}>Confirm</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    ) : (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={date}
                            mode="date"
                            display="default"
                            onChange={onChangeDate}
                            maximumDate={new Date()} // Users can't select future dates
                        />
                    )
                )}


                {/* NIC Input */}
                <Text style={styles.inputLabel}>NIC Number</Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your NIC number"
                        placeholderTextColor="#bdbdbd"
                        value={nic}
                        onChangeText={setNic}
                    />
                </View>

                {/* Address */}
                <Text style={styles.inputLabel}>Address</Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter personal Address"
                        placeholderTextColor="#bdbdbd"
                        value={address}
                        onChangeText={setAddress}
                    />
                </View>

                {/* Contact No */}
                <Text style={styles.inputLabel}>Contact No</Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter a valid contact number"
                        placeholderTextColor="#bdbdbd"
                        value={contact}
                        onChangeText={setContact}
                        keyboardType="phone-pad"
                    />
                </View>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.cancelBtn} >
                        <Text style={styles.cancelBtnText} >Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.submitBtn} >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.submitBtnText}>Submit</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <BottomNavigation activeTab="statistics" />

        </SafeAreaView>
    );
}
