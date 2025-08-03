import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Feather,  } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles from './healthtips.styles';
import BottomNavigation from '../../../common/BottomNavigation';



export default function Notifications() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Pre-consult Tests' | 'Wellness' | 'Meal Preferences'>('Pre-consult Tests');

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
        <Text style={styles.headerTitle}>Wellness Hub</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Pre-consult Tests' && styles.activeTab]}
          onPress={() => setActiveTab('Pre-consult Tests')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'Pre-consult Tests' && styles.activeTabText
          ]}>
            Pre-consult Tests
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'Wellness' && styles.activeTab]}
          onPress={() => setActiveTab('Wellness')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'Wellness' && styles.activeTabText
          ]}>
            Wellness
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'Meal Preferences' && styles.activeTab]}
          onPress={() => setActiveTab('Meal Preferences')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'Meal Preferences' && styles.activeTabText
          ]}>
            Meal Preferences
          </Text>
        </TouchableOpacity>
      </View>

      {/*body*/}
      <ScrollView style={styles.content}>

      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="none" />

    </SafeAreaView>
  )
}