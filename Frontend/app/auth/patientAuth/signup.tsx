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

  const handleSignUp = () => { //temporary function to navigate
    router.push('/auth/patientAuth/createProfile');
  };

  //  const handleSignUp = async () => {
  //   if (!email || !password || !confirm) {
  //     Alert.alert('Error', 'Please fill in all required fields');
  //     return;
  //   }

  //   if (password !== confirm) {
  //     Alert.alert('Error', 'Passwords do not match');
  //     return;
  //   }

  //   if (password.length < 6) {
  //     Alert.alert('Error', 'Password must be at least 6 characters');
  //     return;
  //   }

  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   if (!emailRegex.test(email)) {
  //     Alert.alert('Error', 'Please enter a valid email address');
  //     return;
  //   }

    // try {
    //   setIsLoading(true);
    //   const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    //   const uid = userCredential.user.uid;
    //   console.log('User created with ID:', uid);
      
    //   setUserId(uid);
    //   createProfile(uid);
    // } catch (error: any) {
    //   console.error('Signup error:', error);
    //   Alert.alert(
    //     'Signup Failed',
    //     error.message || 'Failed to create account. Please try again.'
    //   );
    // } finally {
    //   setIsLoading(false);
    // }
  // };

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
