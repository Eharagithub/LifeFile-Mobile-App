import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  Dimensions,
  StatusBar,
  Image,
  RefreshControl,
} from 'react-native';
import { Feather, FontAwesome5, MaterialIcons,Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles from './labReports/labresults.styles'; 
import BottomNavigation from '../common/BottomNavigation';



export default function Notifications() {
  const router = useRouter();
   const [activeTab, setActiveTab] = useState<'overview' | 'progress'>('overview');

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
        <Text style={styles.headerTitle}>My Health</Text>
      </View>

       {/* Tabs */}
              <View style={styles.tabsContainer}>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
                  onPress={() => setActiveTab('overview')}
                >
                  <Text style={[
                    styles.tabText,
                    activeTab === 'overview' && styles.activeTabText
                  ]}>
                    Over View
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
                  onPress={() => setActiveTab('progress')}
                >
                  <Text style={[
                    styles.tabText,
                    activeTab === 'progress' && styles.activeTabText
                  ]}>
                    My Progress
                  </Text>
                </TouchableOpacity>
              </View>

      {/*body*/}
       <ScrollView style={styles.content}>
        
       </ScrollView>
    
     {/* Bottom Navigation */}
          <BottomNavigation activeTab="statistics" />

    </SafeAreaView>  
      )
}