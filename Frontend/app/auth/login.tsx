import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import styles from './login.styles';
import { useRouter } from 'expo-router';

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle login functionality
  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to home screen or dashboard
      router.push('/');
    }, 1500);
  };

  // Handle signup navigation
  const handleSignup = () => {
    router.push('/auth/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={30} color="#222"  />
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
      <TouchableOpacity style={styles.forgotPasswordContainer}>
        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}
          disabled={isLoading}>
             {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
      </TouchableOpacity>

      {/* Sign up Link */}
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}> Don{'\''}t have an account? </Text>
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
      <TouchableOpacity style={styles.googleButton}>
          <Image
            style={styles.googleLogo}
            source={require("../../assets/images/google-logo.jpg")}
          />
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>  );
};

export default LoginScreen;
