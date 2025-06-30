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
import { firebase } from '../../config/firebaseConfig';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useRouter } from 'expo-router';

// Define types for navigation
type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Home: undefined;
};

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Firebase login function
  const loginUser = async (email: string, password: string) => {
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Handle login functionality
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
  
    try {
      const result = await loginUser(email, password);
      
      if (result.success) {
        Alert.alert(
          'Login Success', 
          'Successfully logged in.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to patient home page
                router.push('/patientProfile/patientHome');
              }
            }
          ]
        );
      } else {
        // We have the error from result.error but don't need to use it specifically
        Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
      }
    } catch {
      // We're using a generic error message regardless of the specific error
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup navigation 
  const handleSignup = () => {
    router.push('/auth/patientAuth/signup');
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
              Alert.alert("Error", "Please enter your email address first");
              return;
            }
            
            try {
              setIsLoading(true);
              await firebase.auth().sendPasswordResetEmail(email);
              Alert.alert("Success", "Password reset email has been sent to your email address");
            } catch (error) {
              if (error instanceof Error) {
                Alert.alert("Error", error.message);
              } else {
                Alert.alert("Error", "Failed to send password reset email");
              }
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
