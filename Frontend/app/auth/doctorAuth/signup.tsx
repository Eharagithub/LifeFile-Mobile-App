import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,Image, Alert, ActivityIndicator, StatusBar
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import styles from './signup.styles';
import { useRouter } from 'expo-router';
import { firebase } from '../../../config/firebaseConfig';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AuthService from '../../../services/authService';



const SignUp: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');

  // useEffect(() => {
  //   console.log("SignUp: Component mounted, resetting form");
  //   resetFormDataRef.current();
  // }, []);

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const createProfile = (uid: string) => {
    router.push({
      pathname: '/auth/patientAuth/createProfile',
      params: { userId: uid }
    });
  };

  const handleSignUp = async () => {
  if (!email || !password || !confirm) {
    Alert.alert('Error', 'Please fill in all required fields');
    return;
  }

  try {
    setIsLoading(true);
    const result = await AuthService.createUserAccount(email, password, confirm);
    
    if (result.success && result.uid) {
      console.log('User created successfully with ID:', result.uid);
      createProfile(result.uid);
    } else {
      Alert.alert('Signup Failed', result.error || 'Unknown error occurred');
    }
  } catch (error) {
    console.error('Unexpected error during signup:', error);
    Alert.alert('Error', 'An unexpected error occurred. Please try again.');
  } finally {
    setIsLoading(false);
  }
};


  return (
   
    <SafeAreaView style={styles.safe}>
       <StatusBar 
            backgroundColor={"white"}
    />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require('../../../assets/images/logo.png')}
                 style={styles.heartIcon}
                 resizeMode="contain"/>
        </View>

        <View style={styles.stepsRow}>
          <View style={styles.stepCircleActive}><Text style={styles.stepNum}>1</Text></View>
          <View style={styles.stepLine} />
          <View style={styles.stepCircle}><Text style={styles.stepNumInactive}>2</Text></View>
          <View style={styles.stepLine} />
          <View style={styles.stepCircle}><Text style={styles.stepNumInactive}>3</Text></View>
        </View>
        <View style={styles.stepsLabelRow}>
          <Text style={styles.stepLabelActive}>Account</Text>
          <Text style={styles.stepLabel}>Personal</Text>
          <Text style={styles.stepLabel}>Health</Text>
        </View>

        <View style={styles.sectionTitleRow}>
          <Feather name="user" size={22} color="#8e2670" />
          <Text style={styles.sectionTitle}> Create your Account</Text>
        </View>

        <View style={styles.sectionDivider} />
        <Text style={styles.inputLabel}>
          Email (Will be the User Name)<Text style={styles.req}>*</Text>
        </Text>
        <View style={styles.inputWrapper}>
          <Feather name="mail" size={18} color="#bdbdbd" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#bdbdbd"
            value={email}
            autoCapitalize="none"
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        <Text style={styles.inputLabel}>
          Password <Text style={styles.req}>*</Text>
        </Text>
        <View style={styles.inputWrapper}>
          <Feather name="lock" size={18} color="#bdbdbd" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#bdbdbd"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
            <Feather name={showPassword ? "eye" : "eye-off"} size={18} color="#bdbdbd" />
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>
          Confirm Password<Text style={styles.req}>*</Text>
        </Text>
        <View style={styles.inputWrapper}>
          <Feather name="lock" size={18} color="#bdbdbd" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Re-enter your password"
            placeholderTextColor="#bdbdbd"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showConfirm}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowConfirm((v) => !v)}>
            <Feather name={showConfirm ? "eye" : "eye-off"} size={18} color="#bdbdbd" />
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.exitBtn} 
          onPress={handleLogin}
          >
            <Text style={styles.exitBtnText}>Exit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.nextBtn} 
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.nextBtnText}>Next</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity 
          onPress={handleLogin}
          >
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
