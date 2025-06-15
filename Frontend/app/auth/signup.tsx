import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from 'react-native-vector-icons/Feather';
import styles from './login.styles'; // Reusing login styles for now

export default function SignupScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={30} color="#222" />
      </TouchableOpacity>

      <Text style={styles.title}>Sign Up</Text>
      
      <View style={styles.signupContainer}>
        <Text>Sign up screen is under construction</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={() => router.back()}
      >
        <Text style={styles.loginButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
