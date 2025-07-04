import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles from './viewhistory.styles';
import BottomNavigation from '../common/BottomNavigation';

interface HistoryItem {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  icon: string;
  
}

export default function ViewHistory() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data - replace with actual data from your backend
  const historyData: HistoryItem[] = [
    {
      id: '1',
      date: '04th April 2024',
      title: 'General Checkup',
      subtitle: 'Dr. Smith - Family Medicine',
      icon: 'stethoscope'
    },
    {
      id: '2',
      date: '28th March 2024',
      title: 'Blood Test Results',
      subtitle: 'Lab Report - Complete Blood Count',
      icon: 'vial'
    },
    {
      id: '3',
      date: '15th March 2024',
      title: 'Vaccination',
      subtitle: 'COVID-19 Booster Shot',
      icon: 'syringe'
    },
    {
      id: '4',
      date: '02nd March 2024',
      title: 'Dental Cleaning',
      subtitle: 'Dr. Johnson - Dentistry',
      icon: 'tooth'
    },
    {
      id: '5',
      date: '20th February 2024',
      title: 'Eye Examination',
      subtitle: 'Dr. Wilson - Ophthalmology',
      icon: 'eye'
    },
    {
      id: '6',
      date: '10th February 2024',
      title: 'Prescription Refill',
      subtitle: 'Blood Pressure Medication',
      icon: 'pills'
    }
  ];

  const handleBack = () => {
    router.back();
  };

  const handleItemPress = (item: HistoryItem) => {
    // Navigate to detailed view or handle item selection
    console.log('Selected item:', item);
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <FontAwesome5 name={item.icon} size={20} color="#7d4c9e" />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemDate}>{item.date}</Text>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
      </View>
      <View style={styles.chevronContainer}>
        <Feather name="chevron-right" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  const filteredData = historyData.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Text style={styles.headerTitle}>Medical History Time Line</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search doctor, Date..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* History List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <FlatList
          data={filteredData}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab="none" // Using 'none' to indicate no active tab
        onTabPress={() => { }}
      />
    </SafeAreaView>
  );
}