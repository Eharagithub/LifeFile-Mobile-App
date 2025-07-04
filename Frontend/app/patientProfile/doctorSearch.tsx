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
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles from './doctorSearch.styles';
import BottomNavigation from '../common/BottomNavigation';

interface Doctor {
  docid: string;
  Name: string;
  Specialist: string;
  profilePicture: string;
}

export default function DoctorSearch() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Sample data - replace with actual data from your backend
  const doctorData: Doctor[] = [
    {
      docid: '1',
      profilePicture:'',
      Name: 'Dr. Sarah Johnson',
      Specialist: 'Cardiologist',
    },
    {
      docid: '2',
      profilePicture:'',
      Name: 'Dr. Michael Williams',
      Specialist: 'Neurologist',
    },
];

    const handleBack = () => {
        router.back();
    };

    const handleItemPress = (item: Doctor) => {
        // Navigate to detailed view or handle item selection
        console.log('Selected Doctor:', item);
    };


    const renderDoctor = ({ item }: { item: Doctor }) => (
        <TouchableOpacity
            style={styles.doctor}
            onPress={() => handleItemPress(item)}
            activeOpacity={0.7}
        >
            <Image
                source={{ uri: item.profilePicture || 'https://via.placeholder.com/50' }}
                style={styles.doctorImage}/>
    
            <View style={styles.itemContent}>
                <Text style={styles.itemName}>{item.Name}</Text>
                <Text style={styles.itemSpecialist}>{item.Specialist}</Text>
            </View>
            <View style={styles.chevronContainer}>
                <Feather name="chevron-right" size={20} color="#ccc" />
            </View>
        </TouchableOpacity>
    );

    const filteredData = doctorData.filter(item =>
        item.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.Specialist.toLowerCase().includes(searchQuery.toLowerCase())
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
                <Text style={styles.headerTitle}>Search your preferred doctor</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search from Date, Keyword"
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Filter Options */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterContainer}
                >
                    <FlatList
                        data={filteredData}
                        renderItem={renderDoctor}
                        keyExtractor={item => item.docid}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                    <TouchableOpacity style={[styles.filterButton, styles.filterButtonActive]}>
                        <Text style={[styles.filterText, styles.filterTextActive]}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterText}>Cardiologist</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterText}>Dermatologist</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterText}>Pediatrician</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterText}>Neurologist</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Doctor Cards */}
                <View style={styles.doctorCard}>
                    <Image
                        source={require('../../assets/images/profile.jpg')}
                        style={styles.doctorImage}
                    />
                    <View style={styles.doctorInfo}>
                        <Text style={styles.doctorName}>Dr. Sarah Johnson</Text>
                        <Text style={styles.doctorSpecialty}>Cardiologist</Text>
                        <View style={styles.ratingContainer}>
                            <Feather name="star" size={14} color="#FFD700" />
                            <Text style={styles.ratingText}>4.9 (120 reviews)</Text>
                        </View>
                        <View style={styles.locationContainer}>
                            <Feather name="map-pin" size={12} color="#999" />
                            <Text style={styles.locationText}>Central Hospital, 2.5 miles away</Text>
                        </View>
                    </View>
                </View>

                {/* <View style={styles.doctorCard}>
                    <Image
                        source={require('../../assets/images/profile.jpg')}
                        style={styles.doctorImage}
                    />
                    <View style={styles.doctorInfo}>
                        <Text style={styles.doctorName}>Dr. Michael Williams</Text>
                        <Text style={styles.doctorSpecialty}>Neurologist</Text>
                        <View style={styles.ratingContainer}>
                            <Feather name="star" size={14} color="#FFD700" />
                            <Text style={styles.ratingText}>4.7 (85 reviews)</Text>
                        </View>
                        <View style={styles.locationContainer}>
                            <Feather name="map-pin" size={12} color="#999" />
                            <Text style={styles.locationText}>Memorial Clinic, 3.8 miles away</Text>
                        </View>
                    </View>
                </View> */}

                <View style={styles.doctorCard}>
                    <Image
                        source={require('../../assets/images/profile.jpg')}
                        style={styles.doctorImage}
                    />
                    <View style={styles.doctorInfo}>
                        <Text style={styles.doctorName}>Dr. Emily Rodriguez</Text>
                        <Text style={styles.doctorSpecialty}>Dermatologist</Text>
                        <View style={styles.ratingContainer}>
                            <Feather name="star" size={14} color="#FFD700" />
                            <Text style={styles.ratingText}>4.8 (102 reviews)</Text>
                        </View>
                        <View style={styles.locationContainer}>
                            <Feather name="map-pin" size={12} color="#999" />
                            <Text style={styles.locationText}>City Medical Center, 1.2 miles away</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <BottomNavigation
                activeTab="none" // Using 'none' to indicate no active tab
                onTabPress={() => { }} // Empty function as we're handling navigation in the component
            />

        </SafeAreaView>
    )
}