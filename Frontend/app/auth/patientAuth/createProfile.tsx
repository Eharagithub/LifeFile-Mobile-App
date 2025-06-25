import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Image, Platform, Alert, ActivityIndicator, Modal } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import styles from './signup.styles';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from '../../../config/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import AuthService from '../../../services/authService';

export default function CreateProfile() {
    const router = useRouter();
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
    
    // New state variables for improved date picker
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - 30); // Default to 30 years ago
    const [showMonthDayPicker, setShowMonthDayPicker] = useState(false);

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
        setDate(new Date());
        setShowDatePicker(false);
    });

     // Force reset form data when component mounts or userId changes
     useEffect(() => {
         console.log("CreateProfile: New userId detected, resetting form");
         resetFormDataRef.current();
     }, [userId]);

    // Dummy file picker
    const handleChooseFile = () => {
        setFileName('profile.jpg');
    };

    const handleSignup = () => {
        router.push('/auth/patientAuth/signup');
     };

    const goToHealthProfile = async () => {
  // Validate required fields
  if (!fullName || !dob || !nic || !gender) {
    Alert.alert('Error', 'Please fill in all required fields');
    return;
  }

  try {
    setIsLoading(true);

    if (!userId) {
      Alert.alert('Error', 'User ID is missing. Please sign up again.');
      router.push('/auth/patientAuth/signup');
      return;
    }

    const personalData = {
      fullName,
      dateOfBirth: dob,
      nic,
      gender,
      address: address || '',
      contactNumber: contact || '',
      profilePicture: fileName !== 'No file chosen' ? fileName : '',
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
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
            <ScrollView contentContainerStyle={styles.container}>

                {/* Logo and Steps */}
                <View style={styles.logoContainer}>
                    <Image source={require('../../../assets/images/logo.png')}
                        style={styles.heartIcon}
                        resizeMode="contain" />
                </View>

                <View style={styles.stepsRow}>
                    <View style={styles.stepCircle}><Text style={styles.stepNumInactive}>1</Text></View>
                    <View style={styles.stepLine} />
                    <View style={styles.stepCircleActive}><Text style={styles.stepNum}>2</Text></View>
                    <View style={styles.stepLine} />
                    <View style={styles.stepCircle}><Text style={styles.stepNumInactive}>3</Text></View>
                </View>
                <View style={styles.stepsLabelRow}>
                    <Text style={styles.stepLabel}>Account</Text>
                    <Text style={styles.stepLabelActive}>Personal</Text>
                    <Text style={styles.stepLabel}>Health</Text>
                </View>

                {/* Section Title */}
                <View style={styles.sectionTitleRow}>
                    <Feather name="user" size={18} color="#222" />
                    <Text style={styles.sectionTitle}> Personal Information</Text>
                </View>
                <View style={styles.sectionDivider} />

                {/* Full Name */}
                <Text style={styles.inputLabel}>
                    Full Name <Text style={styles.req}> *</Text>
                </Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your Full Name"
                        placeholderTextColor="#bdbdbd"
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

                {/* NIC */}
                <Text style={styles.inputLabel}>
                    NIC <Text style={styles.req}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your NIC"
                        placeholderTextColor="#bdbdbd"
                        value={nic}
                        onChangeText={setNic}
                    />
                </View>

                {/* Gender */}
                <Text style={styles.inputLabel}>
                    Gender <Text style={styles.req}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                    
                    <Picker
                        selectedValue={gender}
                        style={[styles.dropdown, !gender ? { color: '#bdbdbd' } : { color: '#222' }]}
                        onValueChange={(itemValue) => setGender(itemValue)}
                        dropdownIconColor="#bdbdbd"
                    >
                        <Picker.Item label="Select gender" value="" color="#bdbdbd" />
                        <Picker.Item label="Male" value="male" />
                        <Picker.Item label="Female" value="female" />
                        <Picker.Item label="Other" value="other" />
                    </Picker>
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

                {/* Profile Picture */}
                <View style={styles.profileRow}>
                    <View style={styles.profileAvatar}>
                        <Feather name="user" size={36} style={styles.profileIcon} />
                    </View>
                    <View style={styles.profileTextCol}>
                        <Text style={styles.profileLabel}>Profile Picture</Text>
                        <View style={styles.fileRow}>
                            <TouchableOpacity style={styles.chooseFileBtn} onPress={handleChooseFile}>
                                <Text style={styles.chooseFileText}>Choose File</Text>
                            </TouchableOpacity>
                            <Text style={styles.fileName}>{fileName}</Text>
                        </View>
                    </View>
                </View>

                {/* Buttons */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.previousBtn} onPress={handleSignup}>
                        <Text style={styles.previousBtnText} >Previous</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.nextBtn} onPress={goToHealthProfile}> 
                        {/* {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : ( */}
                            <Text style={styles.nextBtnText}>Next</Text>
                        {/* /)} */}
                    </TouchableOpacity> 
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
