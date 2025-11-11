import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Image,
} from 'react-native';
import { styles } from './patientDashboard.styles';
import BottomNavigation from '../common/BottomNavigation';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

// Interfaces
export interface Allergy {
    id: string;
    name: string;
    description: string;
}

export interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    status: 'Active' | 'Inactive';
}

export interface PatientInfo {
    name: string;
    age: number;
    location: string;
    bloodType: string;
    nextVisit: string;
}

export interface MedicalRecord {
    id: string;
    title: string;
    type: 'lab_report' | 'prescription' | 'scan' | 'other';
    date: string;
    doctor: string;
    description: string;
}

const PatientDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'reports'>('overview');

    const patientInfo: PatientInfo = {
        name: 'Suchini Ishanka',
        age: 24,
        location: 'Female',
        bloodType: 'O+',
        nextVisit: 'JUL 15 , 2025',
    };

    const allergies: Allergy[] = [
        { id: '1', name: 'Penicillin', description: 'Skin rash, difficulty breathing' },
        { id: '2', name: 'Peanuts', description: 'Skin rash, difficulty breathing' },
        { id: '3', name: 'Pollen', description: 'Sneezing' },
    ];

    const medications: Medication[] = [
        { id: '1', name: 'Metformin', dosage: '800mg', frequency: 'Twice daily', duration: '3 months', status: 'Active' },
        { id: '2', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '3 months', status: 'Active' },
        { id: '3', name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: '3 months', status: 'Active' },
    ];

    const medicalRecords: MedicalRecord[] = [
        {
            id: '1',
            title: 'Blood Test Results',
            type: 'lab_report',
            date: '2024-01-15',
            doctor: 'Dr. Smith',
            description: 'Complete blood count and lipid profile'
        },
        {
            id: '2',
            title: 'CT Scan Report',
            type: 'scan',
            date: '2024-01-10',
            doctor: 'Dr. Johnson',
            description: 'Chest CT scan results'
        },

    ];



    const router = useRouter();
    const handleBack = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                >
                    <Feather name="chevron-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Patient Details</Text>
            </View>



            {/* Patient Details Header */}
            <View style={styles.patientHeader}>
                {/* Profile Section with Picture and Basic Info in one line */}
                <View style={styles.profileMainRow}>
                    <View style={styles.profileImageContainer}>
                        <View style={styles.profileIconContainer}>
                            <Feather name="user" size={24} color="#7d4c9e" />
                        </View>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.patientName}>{patientInfo.name}</Text>
                        <View style={styles.patientDetailsRow}>
                            <Text style={styles.patientAgeLocation}>{patientInfo.age} yrs • {patientInfo.location}</Text>
                        </View>
                        <View style={styles.bloodTypeContainer}>
                            <MaterialCommunityIcons name="water" size={16} color="#666" />
                            <Text style={styles.bloodType}>Blood: {patientInfo.bloodType}</Text>
                        </View>

                    </View>
                </View>

                {/* Action Buttons with Icons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.callButton}>
                        <FontAwesome name="phone" size={16} color="#fff" />
                        <Text style={styles.callButtonText}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.callButton}>
                        <Feather name="message-circle" size={16} color="#fff" />
                        <Text style={styles.callButtonText}>Message</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Upload Documents with Icon */}
            <View style={styles.uploadButtons}>
                <TouchableOpacity style={styles.uploadSection}>
                    <MaterialIcons name="cloud-upload" size={20} color="#7d4c9e" />
                    <Text style={styles.uploadText}>Upload Documents</Text>
                </TouchableOpacity>

                {/* Progress Monitor with Icon */}
                <TouchableOpacity style={styles.progressSection}>
                    <Ionicons name="stats-chart" size={20} color="#7d4c9e" />
                    <Text style={styles.progressText}>Progress Monitor</Text>
                </TouchableOpacity>
            </View>

            {/* Navigation Tabs */}
            <View style={styles.navTabs}>
                <TouchableOpacity
                    style={[styles.navTab, activeTab === 'overview' && styles.activeTab]}
                    onPress={() => setActiveTab('overview')}
                >
                    <Text style={[styles.navTabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.navTab, activeTab === 'history' && styles.activeTab]}
                    onPress={() => setActiveTab('history')}
                >
                    <Text style={[styles.navTabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.navTab, activeTab === 'reports' && styles.activeTab]}
                    onPress={() => setActiveTab('reports')}
                >
                    <Text style={[styles.navTabText, activeTab === 'reports' && styles.activeTabText]}>Reports</Text>
                </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {activeTab === 'overview' && (
                    <>
                        {/* Allergies Section with Icon */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionTitleContainer}>
                                    <MaterialCommunityIcons name="allergy" size={20} color="#7d4c9e" />
                                    <Text style={styles.sectionTitle}>Allergies</Text>
                                </View>
                                <TouchableOpacity style={styles.seeAllButton}>
                                    <Text style={styles.seeAllText}>See all</Text>
                                    <Feather name="chevron-right" size={16} color="#7d4c9e" />
                                </TouchableOpacity>
                            </View>
                            {allergies.map((allergy, index) => (
                                <View key={allergy.id} style={[
                                    styles.allergyItem,
                                    index === allergies.length - 1 && styles.allergyItemLast
                                ]}>
                                    <View style={styles.allergyIconContainer}>
                                        <MaterialCommunityIcons name="alert-circle" size={16} color="#ff6b6b" />
                                    </View>
                                    <View style={styles.allergyContent}>
                                        <Text style={styles.allergyName}>{allergy.name}</Text>
                                        <Text style={styles.allergyDescription}>{allergy.description}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Active Medications Section with Icon */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionTitleContainer}>
                                    <FontAwesome name="medkit" size={18} color="#7d4c9e" />
                                    <Text style={styles.sectionTitle}>Active Medications</Text>
                                </View>
                                <TouchableOpacity style={styles.seeAllButton}>
                                    <Text style={styles.seeAllText}>See all</Text>
                                    <Feather name="chevron-right" size={16} color="#7d4c9e" />
                                </TouchableOpacity>
                            </View>
                            {medications.map((med) => (
                                <View key={med.id} style={styles.medicationItem}>
                                    <View style={styles.medicationHeader}>
                                        <View style={styles.medicationNameContainer}>
                                            <MaterialCommunityIcons name="pill" size={16} color="#7d4c9e" />
                                            <Text style={styles.medicationName}>{med.name}</Text>
                                        </View>
                                        <View style={[styles.statusBadge, med.status === 'Active' ? styles.activeBadge : styles.inactiveBadge]}>
                                            <Text style={styles.statusText}>{med.status}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.medicationDetails}>
                                        {med.dosage} - {med.frequency}
                                    </Text>
                                    <Text style={styles.medicationDuration}>Duration: {med.duration}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Provide Medications Button with Icon */}
                        <TouchableOpacity style={styles.provideMedicationsButton}>
                            <MaterialCommunityIcons name="prescription" size={20} color="#fff" />
                            <Text style={styles.provideMedicationsText}>Provide Medications</Text>
                        </TouchableOpacity>

                        {/* Next Visit Section with Icon */}
                        <View style={styles.nextVisitSection}>
                            <MaterialCommunityIcons name="calendar-clock" size={24} color="#7d4c9e" />
                            <Text style={styles.nextVisitTitle}>Next Visit</Text>
                            <Text style={styles.nextVisitDate}>JUL 15 , 2025</Text>
                            <Text style={styles.nextVisitType}>Follow-up Consultation</Text>
                            <TouchableOpacity style={styles.scheduleButton}>
                                <Feather name="calendar" size={16} color="#fff" />
                                <Text style={styles.scheduleButtonText}>Schedule Visit</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {activeTab === 'history' && (
                    <View >
                        {/* Diagnosis History Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionTitleContainer}>
                                    <Feather name="book-open" size={20} color="#7d4c9e" />
                                    <Text style={styles.sectionTitle}>Diagnosis History</Text>
                                </View>
                                <TouchableOpacity style={styles.seeAllButton}>
                                    <Text style={styles.seeAllText}>See all</Text>
                                    <Feather name="chevron-right" size={16} color="#7d4c9e" />
                                </TouchableOpacity>                               
                            </View>

                            {/* Diagnosis Item 1 */}
                            <View style={styles.diagnosisItem}>
                                <Text style={styles.diagnosisDate}>10.11.2025</Text>
                                <View style={styles.medicationItem}>
                                    <View style={styles.medicationHeader}>
                                        <Text style={styles.medicationName}>Metformin</Text>
                                        <View style={[styles.statusBadge, styles.activeBadge]}>
                                            <Text style={styles.statusText}>Active</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.medicationDetails}>500mg - Twice daily</Text>
                                    <Text style={styles.medicationDuration}>Duration: 3 months</Text>
                                </View>
                            </View>

                            {/* Diagnosis Item 2 */}
                            <View style={styles.diagnosisItem}>
                                <Text style={styles.diagnosisDate}>10.11.2025</Text>
                                <View style={styles.medicationItem}>
                                    <View style={styles.medicationHeader}>
                                        <Text style={styles.medicationName}>Metformin</Text>
                                        <View style={[styles.statusBadge, styles.activeBadge]}>
                                            <Text style={styles.statusText}>Active</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.medicationDetails}>500mg - Twice daily</Text>
                                    <Text style={styles.medicationDuration}>Duration: 3 months</Text>
                                </View>
                            </View>

                            {/* Diagnosis Item 3 */}
                            <View style={styles.diagnosisItem}>
                                <Text style={styles.diagnosisDate}>10.11.2025</Text>
                                <View style={styles.medicationItem}>
                                    <View style={styles.medicationHeader}>
                                        <Text style={styles.medicationName}>Metformin</Text>
                                        <View style={[styles.statusBadge, styles.activeBadge]}>
                                            <Text style={styles.statusText}>Active</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.medicationDetails}>500mg - Twice daily</Text>
                                    <Text style={styles.medicationDuration}>Duration: 3 months</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {activeTab === 'reports' && (
                    <View>
                        {/* Lab Results Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionTitleContainer}>
                                    <Feather name="file" size={20} color="#7d4c9e" />
                                    <Text style={styles.sectionTitle}>Lab Reports</Text>
                                </View>
                                <TouchableOpacity style={styles.seeAllButton}>
                                    <Text style={styles.seeAllText}>See all</Text>
                                    <Feather name="chevron-right" size={16} color="#7d4c9e" />
                                </TouchableOpacity>
                            </View>

                            {/* Lab Result Item 1 */}
                            <View style={styles.diagnosisItem}>
                                <Text style={styles.diagnosisDate}>10.11.2025</Text>
                                <View style={styles.medicationItem}>
                                    <View style={styles.medicationHeader}>
                                        <Text style={styles.medicationName}>Metformin</Text>
                                        <View style={[styles.statusBadge, styles.activeBadge]}>
                                            <Text style={styles.statusText}>Active</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.medicationDetails}>500mg - Twice daily</Text>
                                    <Text style={styles.medicationDuration}>Duration: 3 months</Text>
                                </View>
                            </View>

                            {/* Lab Result Item 2 */}
                            <View style={styles.diagnosisItem}>
                                <Text style={styles.diagnosisDate}>10.11.2025</Text>
                                <View style={styles.medicationItem}>
                                    <View style={styles.medicationHeader}>
                                        <Text style={styles.medicationName}>Metformin</Text>
                                        <View style={[styles.statusBadge, styles.activeBadge]}>
                                            <Text style={styles.statusText}>Active</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.medicationDetails}>500mg - Twice daily</Text>
                                    <Text style={styles.medicationDuration}>Duration: 3 months</Text>
                                </View>
                            </View>

                            {/* Lab Result Item 3 */}
                            <View style={styles.diagnosisItem}>
                                <Text style={styles.diagnosisDate}>10.11.2025</Text>
                                <View style={styles.medicationItem}>
                                    <View style={styles.medicationHeader}>
                                        <Text style={styles.medicationName}>Metformin</Text>
                                        <View style={[styles.statusBadge, styles.activeBadge]}>
                                            <Text style={styles.statusText}>Active</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.medicationDetails}>500mg - Twice daily</Text>
                                    <Text style={styles.medicationDuration}>Duration: 3 months</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>


            {/* Bottom Navigation to match app screens */}
            <BottomNavigation activeTab="home" />
        </SafeAreaView >
    );
};

export default PatientDashboard;