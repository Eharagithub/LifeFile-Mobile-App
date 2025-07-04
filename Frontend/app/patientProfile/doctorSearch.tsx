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
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');
    const [loading, setLoading] = useState(false);

   

    const handleBack = () => {
        router.back();
    };

    const handleItemPress = (item: Doctor) => {
        // Navigate to detailed view or handle item selection
        console.log('Selected Doctor:', item);
    };

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
    {
      docid: '3',
      profilePicture:'',
      Name: 'Dr. Emily Rodriguez',
      Specialist: 'Dermatologist',
    },
    {
      docid: '4',
      profilePicture:'',
      Name: 'Dr. David Chen',
      Specialist: 'Pediatrician',
    },
    {
      docid: '5',
      profilePicture:'',
      Name: 'Dr. Lisa Martinez',
      Specialist: 'Cardiologist',
    },
    {
      docid: '6',
      profilePicture:'',
      Name: 'Dr. Robert Johnson',
      Specialist: 'Neurologist',
    },
    {
      docid: '7',
      profilePicture:'',
      Name: 'Dr. Jennifer Smith',
      Specialist: 'Dermatologist',
    },
    {
      docid: '8',
      profilePicture:'',
      Name: 'Dr. James Wilson',
      Specialist: 'Pediatrician',
    },
  ];

    // Function to handle when we need to show loading status
    const toggleLoading = (status: boolean) => {
        setLoading(status);
    };

    const filteredData = doctorData.filter(doctor => {
        // Apply specialty filter
        const matchesSpecialty = selectedSpecialty === 'All' || doctor.Specialist === selectedSpecialty;
        
        // Apply search query filter (if any)
        const matchesSearch = searchQuery === '' || 
            doctor.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.Specialist.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Return doctors that match both filters
        return matchesSpecialty && matchesSearch;
    });

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
                    placeholder="Search by doctor name or specialty"
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsHorizontalScrollIndicator={false}>
                {/* Filter Options */}
                {/* Filter Options */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterContainer}
                >
                    <TouchableOpacity 
                        style={[
                            styles.filterButton, 
                            selectedSpecialty === 'All' && styles.filterButtonActive
                        ]}
                        onPress={() => setSelectedSpecialty('All')}
                    >
                        <Text style={[
                            styles.filterText, 
                            selectedSpecialty === 'All' && styles.filterTextActive
                        ]}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            styles.filterButton, 
                            selectedSpecialty === 'Cardiologist' && styles.filterButtonActive
                        ]}
                        onPress={() => setSelectedSpecialty('Cardiologist')}
                    >
                        <Text style={[
                            styles.filterText, 
                            selectedSpecialty === 'Cardiologist' && styles.filterTextActive
                        ]}>Cardiologist</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            styles.filterButton, 
                            selectedSpecialty === 'Dermatologist' && styles.filterButtonActive
                        ]}
                        onPress={() => setSelectedSpecialty('Dermatologist')}
                    >
                        <Text style={[
                            styles.filterText, 
                            selectedSpecialty === 'Dermatologist' && styles.filterTextActive
                        ]}>Dermatologist</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            styles.filterButton, 
                            selectedSpecialty === 'Pediatrician' && styles.filterButtonActive
                        ]}
                        onPress={() => setSelectedSpecialty('Pediatrician')}
                    >
                        <Text style={[
                            styles.filterText, 
                            selectedSpecialty === 'Pediatrician' && styles.filterTextActive
                        ]}>Pediatrician</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            styles.filterButton, 
                            selectedSpecialty === 'Neurologist' && styles.filterButtonActive
                        ]}
                        onPress={() => setSelectedSpecialty('Neurologist')}
                    >
                        <Text style={[
                            styles.filterText, 
                            selectedSpecialty === 'Neurologist' && styles.filterTextActive
                        ]}>Neurologist</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Doctor Cards */}
                {filteredData.length > 0 ? (
                    filteredData.map(doctor => (
                        <TouchableOpacity
                            key={doctor.docid}
                            style={styles.doctorCard}
                            onPress={() => handleItemPress(doctor)}
                            activeOpacity={0.7}
                        >
                            <Image
                                source={require('../../assets/images/profile.jpg')}
                                style={styles.doctorImage}
                            />
                            <View style={styles.doctorInfo}>
                                <Text style={styles.doctorName}>{doctor.Name}</Text>
                                <Text style={styles.doctorSpecialty}>{doctor.Specialist}</Text>
                                <View style={styles.ratingContainer}>
                                    <Feather name="star" size={14} color="#FFD700" />
                                    <Text style={styles.ratingText}>4.8 (95 reviews)</Text>
                                </View>
                                <View style={styles.locationContainer}>
                                    <Feather name="map-pin" size={12} color="#999" />
                                    <Text style={styles.locationText}>Medical Center, 2.5 miles away</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.noResultsContainer}>
                        <Feather name="search" size={50} color="#ddd" />
                        <Text style={styles.noResultsText}>No doctors found</Text>
                        <Text style={styles.noResultsSubtext}>Try adjusting your search or filter</Text>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Navigation */}
            <BottomNavigation
                activeTab="none" // Using 'none' to indicate no active tab
                onTabPress={() => { }} // Empty function as we're handling navigation in the component
            />

        </SafeAreaView>
    )
}