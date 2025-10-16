import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import styles from './login.styles';
import AuthService from '../../services/authService';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

// Define types for navigation
const LoginScreen = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Use AuthService for sign-in

  // Handle login functionality
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const signInResult = await AuthService.signInUser(email, password);

      if (!signInResult.success || !signInResult.uid) {
        Alert.alert('Login Failed', signInResult.error || 'Invalid email or password. Please try again.');
        return;
      }

      const uid = signInResult.uid;

      // Determine which roles the authenticated user has
      const roles = await AuthService.determineRoles(uid);

      if (roles.error === 'permission-denied') {
        Alert.alert('Permission denied', 'The app does not have permission to read your profile. Please check Firestore rules or contact support.');
        return;
      }

      if (roles.isPatient && !roles.isDoctor) {
        router.replace('/patientProfile/patientHome');
        return;
      }

      if (roles.isDoctor && !roles.isPatient) {
        router.replace('/doctorProfile/doctorHome');
        return;
      }

      // If user has both roles, ask which one to continue with
      if (roles.isDoctor && roles.isPatient) {
        Alert.alert(
          'Choose Role',
          'This account has both Doctor and Patient profiles. Which role would you like to use for this session?',
          [
            { text: 'Doctor', onPress: () => router.replace('/doctorProfile/doctorHome') },
            { text: 'Patient', onPress: () => router.replace('/patientProfile/patientHome') },
            { text: 'Cancel', style: 'cancel' }
          ],
          { cancelable: true }
        );
        return;
      }

      // If no role found
      Alert.alert('No profile', 'No patient or doctor profile found for this account. Please contact support.');
    } catch (error) {
      Alert.alert('Error', 'Something went wrong during login');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup navigation 
  const handleSignup = () => {
    router.push('/auth/Auth/signup');
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    // For now, just show a dialog for password reset since we don't have a dedicated screen
    Alert.alert(
      "Reset Password",
      "Please enter your email to receive a password reset link",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Reset Password",
          onPress: async () => {
            if (!email) {
              Alert.alert('Error', 'Please enter your email address first');
              return;
            }

            try {
              setIsLoading(true);
              const res = await AuthService.resetPassword(email);
              if (res.success) {
                Alert.alert('Success', 'Password reset email has been sent to your email address');
              } else {
                Alert.alert('Error', res.error || 'Failed to send password reset email');
              }
            } catch (err) {
              console.error('Password reset error', err);
              Alert.alert('Error', 'Failed to send password reset email');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  // Handle Google sign in
  const handleGoogleSignIn = () => {
    // Implement Google Sign-In logic here
    Alert.alert('Info', 'Google Sign-In functionality to be implemented');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={30} color="#222" />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Login</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <MaterialIcons
            name="email"
            size={22}
            color="#7C808D"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#7C808D"
            selectionColor="#8d3dad"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Feather
            name="lock"
            size={22}
            color="#7C808D"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#7C808D"
            selectionColor="#8d3dad"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIconContainer}
          >
            <Feather
              name={showPassword ? 'eye' : 'eye-off'}
              size={20}
              color="#BDBDBD"
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity
          style={styles.forgotPasswordContainer}
          onPress={handleForgotPassword}
        >
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Sign up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Do not have an account? </Text>
          <TouchableOpacity onPress={handleSignup}>
            <Text style={styles.signupLink}>Sign up</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.divider} />
        </View>

        {/* Google Sign-in */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
        >
          <Image
            style={styles.googleLogo}
            source={require("../../assets/images/google-logo.jpg")}
          />
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;
