import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  Image
} from 'react-native';
import { Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles from './labresults.styles'; 
import BottomNavigation from '../common/BottomNavigation';

export default function Notifications() {
  const router = useRouter();
  const handleBack = () => {
    router.back();
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
        <Text style={styles.headerTitle}>Alerts</Text>
      </View>

      {/*body*/}
       <ScrollView style={styles.content}></ScrollView>
    
     {/* Bottom Navigation */}
          <BottomNavigation activeTab="notification" />

    </SafeAreaView>  
      )
}