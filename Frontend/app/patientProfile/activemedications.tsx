import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    Alert,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BottomNavigation from '../common/BottomNavigation';
import { auth } from '../../config/firebaseConfig';
import { fetchActiveMedications } from '../../services/firestoreQueries';

interface ActiveMedication {
    id: string;
    drugName: string;
    dosage: string;
    frequency: string;
    timeOfDay: string;
    duration: string;
    instructions?: string;
    startDate: string;
    prescribedBy?: string;
    prescribedAt?: string;
    status: string;
}

export default function ActiveMedications() {
    const router = useRouter();
    const [medications, setMedications] = useState<ActiveMedication[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMedications();
    }, []);

    const fetchMedications = async () => {
        try {
            setLoading(true);
            const patientUid = auth.currentUser?.uid;
            if (!patientUid) {
                Alert.alert('Error', 'Patient ID not found');
                return;
            }

            const activeMeds = await fetchActiveMedications(patientUid);
            console.log('💊 Fetched medications:', activeMeds);
            setMedications(activeMeds);
        } catch (err) {
            console.error('❌ Error fetching medications:', err);
            Alert.alert('Error', 'Failed to load medications');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handleRefresh = () => {
        fetchMedications();
    };

    const renderMedicationCard = ({ item }: { item: ActiveMedication }) => (
        <View style={styles.medicationCard}>
            {/* Header with drug name and status badge */}
            <View style={styles.cardHeader}>
                <View style={styles.drugNameContainer}>
                    <MaterialCommunityIcons
                        name="pill"
                        size={24}
                        color="#7d4c9e"
                    />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.drugName}>{item.drugName}</Text>
                        <Text style={styles.dosage}>{item.dosage}</Text>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            {/* Medication Details */}
            <View style={styles.detailsContainer}>
                {/* Frequency */}
                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <MaterialCommunityIcons
                            name="clock-outline"
                            size={18}
                            color="#7d4c9e"
                        />
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Frequency</Text>
                        <Text style={styles.detailValue}>{item.frequency}</Text>
                    </View>
                </View>

                {/* Time of Day */}
                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <MaterialCommunityIcons
                            name="calendar-clock"
                            size={18}
                            color="#7d4c9e"
                        />
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Time</Text>
                        <Text style={styles.detailValue}>{item.timeOfDay}</Text>
                    </View>
                </View>

                {/* Duration */}
                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <MaterialCommunityIcons
                            name="timer-outline"
                            size={18}
                            color="#7d4c9e"
                        />
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Duration</Text>
                        <Text style={styles.detailValue}>{item.duration}</Text>
                    </View>
                </View>

                {/* Start Date */}
                <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                        <MaterialCommunityIcons
                            name="calendar"
                            size={18}
                            color="#7d4c9e"
                        />
                    </View>
                    <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Start Date</Text>
                        <Text style={styles.detailValue}>
                            {new Date(item.startDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                            })}
                        </Text>
                    </View>
                </View>

                {/* Instructions */}
                {item.instructions && (
                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <MaterialCommunityIcons
                                name="clipboard-list"
                                size={18}
                                color="#7d4c9e"
                            />
                        </View>
                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Instructions</Text>
                            <Text style={styles.detailValue}>{item.instructions}</Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
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
                <Text style={styles.headerTitle}>Active Medications</Text>
                <TouchableOpacity onPress={handleRefresh}>
                    <MaterialCommunityIcons
                        name="refresh"
                        size={24}
                        color="#7d4c9e"
                    />
                </TouchableOpacity>
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7d4c9e" />
                    <Text style={styles.loadingText}>Loading medications...</Text>
                </View>
            ) : medications.length > 0 ? (
                <FlatList
                    data={medications}
                    renderItem={renderMedicationCard}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    contentContainerStyle={styles.listContainer}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons
                        name="pill"
                        size={64}
                        color="#ddd"
                    />
                    <Text style={styles.emptyText}>No active medications</Text>
                    <Text style={styles.emptySubtext}>
                        Your prescribed medications will appear here
                    </Text>
                </View>
            )}

            {/* Bottom Navigation */}
            <BottomNavigation activeTab="none" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        textAlign: 'center',
    },
    listContainer: {
        padding: 16,
    },
    medicationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    drugNameContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    drugName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    dosage: {
        fontSize: 13,
        color: '#999',
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    detailsContainer: {
        gap: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    detailIcon: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginRight: 12,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        marginTop: 2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#999',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
});