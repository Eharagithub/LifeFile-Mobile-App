import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Image,
    Animated,
    Dimensions,
    Platform,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavigation from '../../../common/BottomNavigation';

const { width } = Dimensions.get('window');

interface DoctorProfileProps {
    onBackPress?: () => void;
    onAppointmentPress?: () => void;
    onTabPress?: (tab: string) => void;
}
interface Doctor {
    _id: string;
    doctorId: string;
    name: string;
    primarySpecialization: string;
    rating: number;
    profilePicture?: string;
    primaryHospital: string;
    medicalQualifications: string;
    introduction: string;
    experience: number;
    conditions: string;
    consultationDays: string;
    consultationTimes: string;
    eChannellingUrl: string;
    primaryCity?: string;
}

const DoctorProfile: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedBio, setExpandedBio] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<number | null>(null);

    useEffect(() => {
        
        if (!params.id) {
            console.log('No doctorId provided in params:', params);
            return;
        } 

        const fetchDoctor = async () => {
            try {
                const response = await axios.get(`https://express-js-on-vercel-ten-coral.vercel.app/doctors/${params.id}`);
                setDoctor(response.data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch doctor details.');
            } finally {
                setLoading(false);
            }
        };

        fetchDoctor();
    }, [params, params.id]);

    const handleBack = () => {
        router.back();
    };

    const handleEChanneling = () => {
        if (doctor?.eChannellingUrl) {
            router.push(doctor.eChannellingUrl as any);
        }
    };

    // Helper for stars
    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Ionicons
                key={i}
                name={i < Math.floor(rating) ? "star" : i < rating ? "star-half" : "star-outline"}
                size={16}
                color="#FFD700"
                style={{ marginRight: 2 }}
            />
        ));
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Loading doctor details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !doctor) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>{error || 'Doctor not found.'}</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Qualifications array
    const qualifications = doctor && Array.isArray(doctor.medicalQualifications)
        ? doctor.medicalQualifications
        : doctor
            ? [doctor.medicalQualifications]
            : [];

    // Biography
    const biography = doctor
        ? doctor.introduction || `Dr. ${doctor.name} is a highly experienced ${doctor.primarySpecialization} with over ${doctor.experience} years of practice.`
        : '';

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Feather name="chevron-left" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Doctor Card */}
                <View style={styles.doctorCard}>
                    <View style={styles.doctorSection}>
                        <View style={styles.doctorInfo}>
                            <Text style={styles.doctorName}>{doctor?.name ?? ''}</Text>
                            <View style={styles.specialityContainer}>
                                <Text>{doctor?.primarySpecialization ?? ''}</Text>
                            </View>
                            {/* Enhanced Rating */}
                            <View style={styles.ratingContainer}>
                                <View style={styles.starsContainer}>{renderStars(doctor.rating)}</View>
                                <Text style={styles.ratingScore}>{doctor?.rating ?? ''}</Text>
                            </View>
                            {/* Quick Stats */}
                            <View style={styles.statsContainer}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>{doctor ? doctor.experience : '-'}+</Text>
                                    <Text style={styles.statLabel}>Years Exp.</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>{doctor.primaryCity || '-'}</Text>
                                    <Text style={styles.statLabel}>City</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>98%</Text>
                                    <Text style={styles.statLabel}>Success</Text>
                                </View>
                            </View>
                        </View>
                        {/* Doctor Image */}
                        <View style={styles.doctorImageContainer}>
                            <LinearGradient colors={["#8B5CF6", "#A855F7"]} style={styles.imageGradientBorder}>
                                {doctor.profilePicture ? (
                                    <Image source={{ uri: doctor.profilePicture }} style={styles.doctorImagePlaceholder} />
                                ) : (
                                    <View style={styles.doctorImagePlaceholder}>
                                        <Ionicons name="person" size={50} color="#8B5CF6" />
                                    </View>
                                )}
                            </LinearGradient>
                        </View>
                    </View>
                </View>

                {/* Qualifications Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="school" size={24} color="#8B5CF6" />
                        <Text style={styles.sectionTitle}>Qualifications</Text>
                    </View>
                    <View style={styles.qualificationContainer}>
                        {qualifications.map((degree, index) => (
                            <Text key={index} style={styles.qualificationDegree}>• {degree}</Text>
                        ))}
                    </View>
                </View>

                {/* Biography Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="document-text" size={24} color="#8B5CF6" />
                        <Text style={styles.sectionTitle}>About Doctor</Text>
                    </View>
                    <View style={styles.biographyCard}>
                        <Text style={styles.biographyText} numberOfLines={expandedBio ? undefined : 3}>{biography}</Text>
                        <TouchableOpacity onPress={() => setExpandedBio(!expandedBio)} style={styles.expandButton}>
                            <Text style={styles.expandButtonText}>{expandedBio ? "Read Less" : "Read More"}</Text>
                            <Ionicons name={expandedBio ? "chevron-up" : "chevron-down"} size={16} color="#b79cf6ff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Consultation Details */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="location" size={24} color="#8B5CF6" />
                        <Text style={styles.sectionTitle}>Consultations</Text>
                    </View>
                    <View style={styles.qualificationContainer}>
                        <Text>Days: {doctor.consultationDays}</Text>
                        <Text>Times: {doctor.consultationTimes}</Text>
                        <Text>Hospital: {doctor.primaryHospital}</Text>
                    </View>
                </View>

                <View style={styles.actionContainer}>
                    <TouchableOpacity style={styles.appointmentButton} activeOpacity={0.8} onPress={handleEChanneling}>
                        <LinearGradient colors={["#8B5CF6", "#A855F7"]} style={styles.appointmentGradient}>
                            <Ionicons name="calendar" size={20} color="#ffffff" />
                            <Text style={styles.appointmentButtonText}>Book via eChannelling</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Bottom Navigation */}
            <BottomNavigation activeTab="none" onTabPress={() => { }} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    headerGradient: {
        paddingTop: Platform.OS === 'ios' ? 0 : 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 25,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    doctorCard: {
        marginTop: 0,
        marginBottom: 20,
    },

    doctorSection: {
        flexDirection: 'row',
    },
    doctorInfo: {
        flex: 1,
        paddingRight: 20,
    },
    doctorName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    specialityContainer: {
        marginBottom: 15,
    },

    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 8,
    },
    ratingScore: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '600',
        marginRight: 5,
    },
    ratingCount: {
        fontSize: 14,
        color: '#6B7280',
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#8B5CF6',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 15,
    },
    doctorImageContainer: {
        alignItems: 'center',
    },
    imageGradientBorder: {
        padding: 3,
        borderRadius: 20,
    },
    doctorImagePlaceholder: {
        width: 100,
        height: 120,
        backgroundColor: '#FFFFFF',
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
    },

    section: {
        marginBottom: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginLeft: 10,
    },
    qualificationContainer: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
        marginBottom: 8,
    },
    qualificationInfo: {
        flex: 1,
    },
    qualificationDegree: {
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 15,
        marginBottom: 10,
    },
    biographyCard: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    biographyText: {
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 22,
        marginBottom: 10,
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
    },
    expandButtonText: {
        fontSize: 14,
        color: '#bb9ffbff',
        fontWeight: '600',
        marginRight: 5,
    },
    locationCard: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#E5E7EB',
    },
    selectedLocationCard: {
        borderLeftColor: '#8B5CF6',
        backgroundColor: '#FEFEFF',
    },
    unavailableLocationCard: {
        opacity: 0.6,
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    locationInfo: {
        flex: 1,
    },
    locationName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    locationTime: {
        fontSize: 14,
        color: '#6B7280',
    },
    availabilityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    availableBadge: {
        backgroundColor: '#ECFDF5',
    },
    unavailableBadge: {
        backgroundColor: '#FEF2F2',
    },
    availabilityText: {
        fontSize: 12,
        fontWeight: '600',
    },
    availableText: {
        color: '#047857',
    },
    unavailableText: {
        color: '#DC2626',
    },
    actionContainer: {
        flexDirection: 'row',
        marginVertical: 20,
        gap: 12,
    },

    appointmentButton: {
        flex: 2,
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    appointmentGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 12,
    },
    appointmentButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    bottomSpacing: {
        height: 20,
    },
});

export default DoctorProfile;