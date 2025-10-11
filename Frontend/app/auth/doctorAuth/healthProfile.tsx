import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import styles from './signup.styles';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from '../../../config/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import AuthService from '../../../services/authService';

export default function MedicalProfile() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();
  const [weight, setWeight] = useState ('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronic, setChronic] = useState('');
  const [surgeries, setSurgeries] = useState('');
  const [medications, setMedications] = useState('');
  const [treatments, setTreatments] = useState('');
  const [smoker, setSmoker] = useState<string | null>(null);
  const [diet, setDiet] = useState('');
  const [alcohol, setAlcohol] = useState<string | null>(null);
  const [hereditary, setHereditary] = useState('');
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Store the resetFormData function in a ref to avoid recreating it on each render
  const resetFormDataRef = useRef(() => {
    console.log("HealthProfile: Resetting form data");
    setWeight('');
    setHeight('');
    setBmi('');
    setBloodType('');
    setAllergies('');
    setChronic('');
    setSurgeries('');
    setMedications('');
    setTreatments('');
    setSmoker(null);
    setDiet('');
    setAlcohol(null);
    setHereditary('');
    setAgree(false);
  });

  // Register and clean up the event listener in a single useEffect
//   useEffect(() => {
//     // Get a stable reference to the callback
//     const resetFormData = resetFormDataRef.current;
    
//     if (global.EventEmitter) {
//       console.log("HealthProfile: Registering USER_CHANGED listener");
//       // Register the listener with a stable function reference
//       global.EventEmitter.on('USER_CHANGED', resetFormData);
      
//       // Debug: log current listeners
//       global.EventEmitter.debug();
//     } else {
//       console.warn("HealthProfile: EventEmitter not available");
//     }

//     // Clean up listener when component unmounts
//     return () => {
//       if (global.EventEmitter) {
//         console.log("HealthProfile: Cleaning up USER_CHANGED listener");
//         global.EventEmitter.off('USER_CHANGED', resetFormData);
//       }
//     };
//   }, []); // Empty dependency array ensures this runs once on mount

//   // Force reset form data when component mounts or userId changes
//   useEffect(() => {
//     console.log("HealthProfile: New userId detected, resetting form");
//     resetFormDataRef.current();
//   }, [userId]);

  // Navigation functions
  const createProfile = () => {
    router.push({
      pathname: '/auth/patientAuth/createProfile',
      params: { userId }
    });
  };
  
  const completeRegistration = async () => {
    // Validate required fields
    if (!weight || !height) {
      Alert.alert('Error', 'Please fill in at least weight and height');
      return;
    }

    if (!agree) {
      Alert.alert('Error', 'Please agree to the terms and privacy policy');
      return;
    }

    // Check userId
    if (!userId) {
      Alert.alert('Error', 'User ID is missing. Please sign up again.');
      router.push('/auth/patientAuth/signup');
      return;
    }

    try {
      setIsLoading(true);

      // Create health profile data object
      const healthData = {
        weight,
        height,
        bmi: bmi || '',
        bloodType: bloodType || '',
        allergies: allergies || '',
        chronicDiseases: chronic || '',
        surgeries: surgeries || '',
        medications: medications || '',
        ongoingTreatments: treatments || '',
        lifestyle: {
          smoker: smoker || 'no',
          dietaryPreference: diet || '',
          alcoholConsumption: alcohol || 'no',
          hereditaryConditions: hereditary || ''
        },
        termsAccepted: agree,
        updatedAt: new Date().toISOString()
      };

      const result = await AuthService.saveHealthInformation(userId as string, healthData);
    
    if (result.success) {
      console.log('Health profile saved and registration completed for user:', userId);
      router.push('/patientProfile/patientHome');
    } else {
      Alert.alert('Save Failed', result.error || 'Failed to save health information');
    }
  } catch (error) {
    console.error('Unexpected error saving health profile:', error);
    Alert.alert('Error', 'An unexpected error occurred. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  // BMI calculation
  const handleBmi = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (w && h) setBmi((w / (h * h)).toFixed(1));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Logo and Steps */}
        <View style={styles.logoContainer}>
            <Image source={require('../../../assets/images/logo.png')}
                style={styles.heartIcon}
                resizeMode="contain"/>
            </View>


        <View style={styles.stepsRow}>
          <View style={styles.stepCircle}><Text style={styles.stepNumInactive}>1</Text></View>
          <View style={styles.stepLine} />
          <View style={styles.stepCircle}><Text style={styles.stepNumInactive}>2</Text></View>
          <View style={styles.stepLine} />
          <View style={styles.stepCircleActive}><Text style={styles.stepNum}>3</Text></View>
        </View>
        <View style={styles.stepsLabelRow}>
          <Text style={styles.stepLabel}>Account</Text>
          <Text style={styles.stepLabel}>Personal</Text>
          <Text style={styles.stepLabelActive}>Health</Text>
        </View>

        {/* Section Title */}
        <View style={styles.sectionTitleRow}>
          <Feather name="user" size={18} color="#222" />
          <Text style={styles.sectionTitle}> Medical Profile</Text>
        </View>
        <View style={styles.sectionDivider} />

        {/* Weight and Height */}

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.inputLabel}>
              Weight (kg)<Text style={styles.req}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your weight"
              placeholderTextColor="#bdbdbd"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              onBlur={handleBmi}
            />
          </View>

          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.inputLabel}>
              Height (cm)<Text style={styles.req}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your height"
              placeholderTextColor="#bdbdbd"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              onBlur={handleBmi}
            />
          </View>
        </View>

        {/* BMI and Blood Type */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.inputLabel}>BMI</Text>
            <TextInput
              style={styles.input}
              placeholder="BMI Calculation"
              placeholderTextColor="#bdbdbd"
              value={bmi}
              editable={false}
            />
          </View>

      
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.inputLabel}>Blood Type</Text>
            <View style={styles.inputWrapper}>
              <Picker
                selectedValue={bloodType}
                style={[styles.dropdown, { color: bloodType ? '#222' : '#bdbdbd' }]}
                onValueChange={setBloodType}
                dropdownIconColor="#bdbdbd"
              >
                <Picker.Item label="Blood Type" value="" color="#bdbdbd" />
                <Picker.Item label="A+" value="A+" />
                <Picker.Item label="A-" value="A-" />
                <Picker.Item label="B+" value="B+" />
                <Picker.Item label="B-" value="B-" />
                <Picker.Item label="O+" value="O+" />
                <Picker.Item label="O-" value="O-" />
                <Picker.Item label="AB+" value="AB+" />
                <Picker.Item label="AB-" value="AB-" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Allergies */}
        <Text style={styles.inputLabel}>Allergies</Text>
        <View style={styles.inputWrapper}>
          <Picker
            selectedValue={allergies}
            style={[styles.dropdown, { color: allergies ? '#222' : '#bdbdbd' }]}
            onValueChange={setAllergies}
            dropdownIconColor="#bdbdbd"
          >
            <Picker.Item label="Select allergies" value="" color="#bdbdbd" />
            <Picker.Item label="None" value="none" />
            <Picker.Item label="Peanuts" value="peanuts" />
            <Picker.Item label="Penicillin" value="penicillin" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>

        {/* Chronic Diseases */}
        <Text style={styles.inputLabel}>Chronical Diseases</Text>
        <View style={styles.inputWrapper}>
          <Picker
            selectedValue={chronic}
            style={[styles.dropdown, { color: chronic ? '#222' : '#bdbdbd' }]}
            onValueChange={setChronic}
            dropdownIconColor="#bdbdbd"
          >
            <Picker.Item label="Select disease" value="" color="#bdbdbd" />
            <Picker.Item label="None" value="none" />
            <Picker.Item label="Diabetes" value="diabetes" />
            <Picker.Item label="Hypertension" value="hypertension" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>

        {/* Surgeries */}
        <Text style={styles.inputLabel}>Past Surgeries or major medical procedures</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Enter your details"
          placeholderTextColor="#bdbdbd"
          value={surgeries}
          onChangeText={setSurgeries}
          multiline
        />

        {/* Current Medications */}
        <Text style={styles.inputLabel}>Current Medications</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Enter your details"
          placeholderTextColor="#bdbdbd"
          value={medications}
          onChangeText={setMedications}
          multiline
        />

        {/* Ongoing Treatments */}
        <Text style={styles.inputLabel}>Ongoing Treatments</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Enter your details"
          placeholderTextColor="#bdbdbd"
          value={treatments}
          onChangeText={setTreatments}
          multiline
        />

        {/* Life Style Section */}
        <View style={styles.sectionTitleRow}>
          <Feather name="user" size={18} color="#222" />
          <Text style={styles.sectionTitle}> Life Style</Text>
        </View>
        <View style={styles.sectionDivider} />

        {/* Smoker */}
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

        {/* Dietary Preference */}
        <Text style={styles.inputLabel}>Dietary Preference</Text>
        <View style={styles.inputWrapper}>
          <Picker
            selectedValue={diet}
            style={styles.dropdown}
            onValueChange={setDiet}
            dropdownIconColor="#bdbdbd"
          >
            <Picker.Item label="Select gender" value="" color="#bdbdbd" />
            <Picker.Item label="Vegetarian" value="vegetarian" />
            <Picker.Item label="Non-Vegetarian" value="non-vegetarian" />
            <Picker.Item label="Vegan" value="vegan" />
          </Picker>
        </View>

        {/* Alcohol Habit */}
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

        {/* Hereditary Condition */}
        <Text style={styles.inputLabel}>Any known hereditary condition</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Enter your details"
          placeholderTextColor="#bdbdbd"
          value={hereditary}
          onChangeText={setHereditary}
          multiline
        />

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
          <TouchableOpacity style={styles.previousBtn} onPress={createProfile}>
            <Text style={styles.previousBtnText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signUpButton} onPress={completeRegistration}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.nextBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
