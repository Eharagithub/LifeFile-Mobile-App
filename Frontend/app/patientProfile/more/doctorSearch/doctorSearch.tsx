import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
import BottomNavigation from '../../../common/BottomNavigation';

// Removed duplicate Doctor interface and DoctorSearch function declaration

interface Doctor {
    _id: string;
    name: string;
    primarySpecialization: string;
    rating: number;
    profilePicture?: string;
    primaryHospital: string;
}

const DoctorSearch: React.FC = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');
    const [loading, setLoading] = useState(false);
    const [doctors, setDoctors] = useState<Doctor[]>([]);

    // Replace <app-id> and API_KEY with your actual values
    const DATA_API_URL = 'https://express-js-on-vercel-ten-coral.vercel.app/doctors';
    const API_KEY = '75a2c05a-092d-4fb4-b6cc-b2e204f81e6e';

    useEffect(() => {
        setLoading(true);
        axios.get(DATA_API_URL)
            .then(result => {
                if (result.data) {
                    setDoctors(result.data); // or result.data.doctors if your API returns { doctors: [...] }
                } else {
                    setDoctors([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching doctors:', err);
                setLoading(false);
            });
    }, []);

    const handleBack = () => {
        router.back();
    };

    const handleItemPress = (item: Doctor) => {
        router.push({
            pathname: '/patientProfile/more/doctorSearch/doctor_details',
            params: {
                docid: item._id,
                name: item.name,
                specialist: item.primarySpecialization,
                profilePicture: item.profilePicture || ''
            }
        });
    };

    const filteredData = doctors.filter(doctor => {
        // Case-insensitive and trimmed category match
        const selected = selectedSpecialty.trim().toLowerCase();
        const doctorSpec = (doctor.primarySpecialization || '').trim().toLowerCase();
        const matchesCategory = selected === 'all' || doctorSpec === selected;
        // Case-insensitive search
        const matchesSearch = searchQuery.trim() === '' ||
            doctor.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
            doctorSpec.includes(searchQuery.trim().toLowerCase());
        return matchesCategory && matchesSearch;
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
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterContainer}
                >
                    <TouchableOpacity
                        style={[styles.filterButton, selectedSpecialty === 'All' && styles.filterButtonActive]}
                        onPress={() => setSelectedSpecialty('All')}
                    >
                        <Text style={[styles.filterText, selectedSpecialty === 'All' && styles.filterTextActive]}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, selectedSpecialty === 'Cardiologist' && styles.filterButtonActive]}
                        onPress={() => setSelectedSpecialty('Cardiologist')}
                    >
                        <Text style={[styles.filterText, selectedSpecialty === 'Cardiologist' && styles.filterTextActive]}>Cardiologist</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, selectedSpecialty === 'Dermatologist' && styles.filterButtonActive]}
                        onPress={() => setSelectedSpecialty('Dermatologist')}
                    >
                        <Text style={[styles.filterText, selectedSpecialty === 'Dermatologist' && styles.filterTextActive]}>Dermatologist</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, selectedSpecialty === 'Pediatrician' && styles.filterButtonActive]}
                        onPress={() => setSelectedSpecialty('Pediatrician')}
                    >
                        <Text style={[styles.filterText, selectedSpecialty === 'Pediatrician' && styles.filterTextActive]}>Pediatrician</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, selectedSpecialty === 'Neurologist' && styles.filterButtonActive]}
                        onPress={() => setSelectedSpecialty('Neurologist')}
                    >
                        <Text style={[styles.filterText, selectedSpecialty === 'Neurologist' && styles.filterTextActive]}>Neurologist</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Doctor Cards */}
                {loading ? (
                    <View style={styles.noResultsContainer}>
                        <Feather name="search" size={50} color="#ddd" />
                        <Text style={styles.noResultsText}>Loading...</Text>
                    </View>
                ) : filteredData.length > 0 ? (
                    filteredData.map(doctor => (
                        <TouchableOpacity
                            key={doctor._id}
                            style={styles.doctorCard}
                            onPress={() => handleItemPress(doctor)}
                            activeOpacity={0.7}
                        >
                            <Image
                                source={doctor.profilePicture ? { uri: doctor.profilePicture } : { uri: 'https://via.placeholder.com/150' }}
                                style={styles.doctorImage}
                            />
                            <View style={styles.doctorInfo}>
                                <Text style={styles.doctorName}>{doctor.name}</Text>
                                <Text style={styles.doctorSpecialty}>{doctor.primarySpecialization}</Text>
                                <View style={styles.ratingContainer}>
                                    <Feather name="star" size={14} color="#FFD700" />
                                    <Text style={styles.ratingText}>{doctor.rating}</Text>
                                </View>
                                <View style={styles.locationContainer}>
                                    <Feather name="map-pin" size={12} color="#999" />
                                    <Text style={styles.locationText}>{doctor.primaryHospital}</Text>
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
                activeTab="none"
                onTabPress={() => { }}
            />
        </SafeAreaView>
    );
};

export default DoctorSearch;