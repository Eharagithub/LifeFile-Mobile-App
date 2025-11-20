import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Alert,
} from 'react-native';
import { styles } from './patientDashboard.styles';
import BottomNavigation from '../common/BottomNavigation';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, Feather, MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { db, auth } from '../../config/firebaseConfig';
import PatientMedicationsModal, { MedicationData } from './patientMedications';
import ScheduleVisitModal, { VisitData } from './scheduleVisit';
import useUserProfile from '../../hooks/useUserProfile';
import {
    fetchPatientPersonalData,
    fetchPatientHealthData,
    fetchVaultRecords,
    fetchLabRecords,
    fetchActiveMedications,
    fetchNextScheduledVisit,
    DateGroup,
    DocumentRecord
} from '../../services/firestoreQueries';

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

const PatientDashboard: React.FC = () => {
    const { data: doctorData } = useUserProfile();
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'reports'>('overview');
    const [patientStatus, setPatientStatus] = useState<'verified' | 'pending' | 'invited'>('invited');
    const [medicationModalVisible, setMedicationModalVisible] = useState(false);
    const [scheduleVisitModalVisible, setScheduleVisitModalVisible] = useState(false);
    const [currentPatientUid, setCurrentPatientUid] = useState<string>('');
    const [nextVisit, setNextVisit] = useState<any>(null);
    const [patientInfo, setPatientInfo] = useState<PatientInfo>({
        name: 'Loading...',
        age: 0,
        location: 'N/A',
        bloodType: 'N/A',
        nextVisit: 'TBD',
    });
    const [allergies, setAllergies] = useState<Allergy[]>([]);
    const [activeMedications, setActiveMedications] = useState<any[]>([]);
    const [vaultRecords, setVaultRecords] = useState<DateGroup[]>([]);
    const [labRecords, setLabRecords] = useState<DateGroup[]>([]);
    const router = useRouter();
    const params = useLocalSearchParams();

    // Fetch patient link data and patient details from params
    useEffect(() => {
        const doctorId = auth.currentUser?.uid;
        const linkIdParam = params.linkId as string;

        console.log('🔐 useEffect triggered - doctorId:', doctorId, 'linkId:', linkIdParam);

        if (!doctorId || !linkIdParam) {
            console.warn('⚠️ Missing doctorId or linkId, skipping fetch');
            return;
        }

        // Fetch the patient link document to get patient UID and status
        const unsubscribe = db
            .collection('Doctor')
            .doc(doctorId)
            .collection('patients')
            .doc(linkIdParam)
            .onSnapshot(
                async (doc) => {
                    if (doc.exists) {
                        console.log('✅ Patient link document found:', doc.data());
                        const linkData = doc.data();
                        setPatientStatus((linkData?.status || 'invited') as 'verified' | 'pending' | 'invited');

                        const uid = linkData?.patientId;
                        setCurrentPatientUid(uid);
                        console.log('🔑 Patient UID extracted:', uid);
                        if (uid) {
                            await fetchPatientData(uid);
                        } else {
                            console.warn('⚠️ No patientId found in link document');
                        }
                    } else {
                        console.warn('⚠️ Patient link document not found');
                    }
                },
                (err) => {
                    console.error('❌ Error fetching patient link:', err);
                }
            );

        return () => unsubscribe();
    }, [params.linkId]);

    // In patientDashboard.tsx - update the fetchPatientData function
// In patientDashboard.tsx - update the fetchPatientData function
const fetchPatientData = async (patientUid: string) => {
  try {
    console.log('📥 Starting to fetch patient data for UID:', patientUid);

    // ===== DEEP SCAN: Find where data is actually stored =====
    // await deepScanPatientFirestore(patientUid);

    // ===== FETCH PERSONAL DATA =====
    try {
      const personalInfo = await fetchPatientPersonalData(patientUid);
      if (personalInfo) {
        setPatientInfo(prev => ({ ...prev, ...personalInfo }));
      }
    } catch (personalErr) {
      console.error('❌ Error fetching personal data:', personalErr);
    }

    // ===== FETCH HEALTH/COMMON DATA =====
    try {
      const healthData = await fetchPatientHealthData(patientUid);
      setAllergies(healthData.allergies);
      setPatientInfo(prev => ({ ...prev, bloodType: healthData.bloodType }));
    } catch (healthErr) {
      console.error('❌ Error fetching health data:', healthErr);
    }

    // ===== FETCH ACTIVE MEDICATIONS =====
    try {
      const activeMeds = await fetchActiveMedications(patientUid);
      console.log('💊 Active medications loaded:', activeMeds.length);
      setActiveMedications(activeMeds);
    } catch (activeMedsErr) {
      console.error('❌ Error fetching active medications:', activeMedsErr);
      setActiveMedications([]);
    }

    // ===== SMART FETCH VAULT RECORDS =====
    try {
      const vaultData = await fetchVaultRecords(patientUid);
      setVaultRecords(vaultData);
      console.log('📦 Vault records state updated with:', vaultData.length, 'date groups');
    } catch (vaultErr) {
      console.error('❌ Error in vault records fetch:', vaultErr);
      setVaultRecords([]);
    }

    // ===== SMART FETCH LAB REPORTS =====
    try {
      const labData = await fetchLabRecords(patientUid);
      setLabRecords(labData);
      console.log('📊 Lab records state updated with:', labData.length, 'date groups');
    } catch (labErr) {
      console.error('❌ Error in lab records fetch:', labErr);
      setLabRecords([]);
    }

    // ===== FETCH NEXT SCHEDULED VISIT =====
    try {
      const visitData = await fetchNextScheduledVisit(patientUid);
      setNextVisit(visitData);
      console.log('📅 Next visit loaded:', visitData);
    } catch (visitErr) {
      console.error('❌ Error fetching next visit:', visitErr);
      setNextVisit(null);
    }

    console.log('✅ Finished fetching all patient data');
  } catch (err) {
    console.error('❌ Critical error fetching patient data:', err);
  }
};
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified':
                return '#4CAF50';
            case 'pending':
                return '#FF9800';
            case 'invited':
                return '#2196F3';
            default:
                return '#999999';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'verified':
                return 'Verified ✓';
            case 'pending':
                return 'Awaiting Verification';
            case 'invited':
                return 'Invitation Sent';
            default:
                return 'Unknown';
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handleMedicationSubmit = async (medicationData: MedicationData) => {
        try {
            if (!currentPatientUid) {
                Alert.alert('Error', 'Patient UID not found');
                return;
            }

            const doctorUid = auth.currentUser?.uid;
            console.log('💊 Prescribing medication:');
            console.log('   Doctor UID:', doctorUid);
            console.log('   Patient UID:', currentPatientUid);
            console.log('   Medication:', medicationData.drugName);

            // Save medication to Firestore at Patient/{id}/health/activemedications
            const medicationRef = db
                .collection('Patient')
                .doc(currentPatientUid)
                .collection('health')
                .doc('activemedications')
                .collection('medications')
                .doc();

            console.log('📝 Writing to path: Patient/', currentPatientUid, '/health/activemedications/medications/', medicationRef.id);

            await medicationRef.set({
                id: medicationRef.id,
                ...medicationData,
                prescribedBy: doctorUid,
                prescribedAt: new Date().toISOString(),
                status: 'Active',
            });

            console.log('✅ Medication prescribed successfully:', medicationData);
            setMedicationModalVisible(false);
            // Refresh the medications list
            await fetchPatientData(currentPatientUid);
        } catch (err: any) {
            console.error('❌ Error prescribing medication:', err);
            console.error('   Error Code:', err.code);
            console.error('   Error Message:', err.message);
            Alert.alert('Error', `Failed to prescribe medication: ${err.message}`);
        }
    };

    const handleScheduleVisit = async (visitData: VisitData) => {
        try {
            if (!currentPatientUid) {
                Alert.alert('Error', 'Patient UID not found');
                return;
            }

            const doctorUid = auth.currentUser?.uid;
            console.log('📅 Scheduling visit:');
            console.log('   Doctor UID:', doctorUid);
            console.log('   Patient UID:', currentPatientUid);
            console.log('   Date:', visitData.date);
            console.log('   Time:', visitData.time);

            // Fetch doctor's name
            let doctorName = 'Your doctor';
            
            // First try to get from useUserProfile hook data
            if (doctorData?.personal?.fullName) {
                doctorName = doctorData.personal.fullName;
                console.log('✅ Doctor name from profile:', doctorName);
            } else {
                // Fallback: fetch from Firestore if hook data not available
                if (doctorUid) {
                    try {
                        const doctorDoc = await db.collection('Doctor').doc(doctorUid).get();
                        if (doctorDoc.exists) {
                            const data = doctorDoc.data();
                            console.log('📄 Doctor data retrieved:', data);
                            doctorName = data?.personal?.fullName || data?.fullName || 'Your doctor';
                            console.log('✅ Doctor name resolved to:', doctorName);
                        } else {
                            console.warn('⚠️ Doctor document does not exist for UID:', doctorUid);
                        }
                    } catch (err) {
                        console.warn('⚠️ Could not fetch doctor name from Firestore:', err);
                    }
                }
            }

            // Save visit to Firestore at Patient/{id}/health/visitSchedule/scheduled
            const visitRef = db
                .collection('Patient')
                .doc(currentPatientUid)
                .collection('health')
                .doc('visitSchedule')
                .collection('scheduled')
                .doc();

            const visitDateTime = `${visitData.date}T${visitData.time}`;
            await visitRef.set({
                id: visitRef.id,
                visitDate: visitData.date,
                visitTime: visitData.time,
                visitDateTime: visitDateTime,
                visitType: visitData.visitType,
                notes: visitData.notes,
                scheduledBy: doctorUid,
                doctorName: doctorName,
                scheduledAt: new Date().toISOString(),
                status: 'Scheduled',
            });

            // Save notification for patient
            const notificationRef = db
                .collection('Patient')
                .doc(currentPatientUid)
                .collection('notifications')
                .doc();

            console.log('📝 Creating notification at path: Patient/', currentPatientUid, '/notifications/', notificationRef.id);

            await notificationRef.set({
                id: notificationRef.id,
                type: 'visit_scheduled',
                title: 'Visit Scheduled',
                message: `DR. ${doctorName} has scheduled a visit on ${new Date(visitData.date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                })} at ${visitData.time}`,
                visitDate: visitData.date,
                visitTime: visitData.time,
                visitType: visitData.visitType,
                doctorName: doctorName,
                createdAt: new Date().toISOString(),
                read: false,
            });

            console.log('✅ Notification created successfully');
            setScheduleVisitModalVisible(false);
            // Refresh the data
            await fetchPatientData(currentPatientUid);
        } catch (err: any) {
            console.error('❌ Error scheduling visit:', err);
            console.error('   Error Code:', err.code);
            console.error('   Error Message:', err.message);
            Alert.alert('Error', `Failed to schedule visit: ${err.message}`);
        }
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
                <View style={{ width: 24 }} />
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

                {/* Status Badge */}
                <View style={{
                    backgroundColor: getStatusColor(patientStatus),
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    alignSelf: 'flex-start',
                    marginBottom: 12,
                }}>
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>
                        {getStatusText(patientStatus)}
                    </Text>
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
                            {activeMedications.length > 0 ? (
                                activeMedications.map((med) => (
                                    <View key={med.id} style={styles.medicationItem}>
                                        <View style={styles.medicationHeader}>
                                            <View style={styles.medicationNameContainer}>
                                                <MaterialCommunityIcons name="pill" size={16} color="#7d4c9e" />
                                                <Text style={styles.medicationName}>{med.drugName}</Text>
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
                                ))
                            ) : (
                                <Text style={{ color: '#999', fontStyle: 'italic', marginTop: 8 }}>No active medications prescribed</Text>
                            )}
                        </View>

                        {/* Provide Medications Button with Icon */}
                        <TouchableOpacity 
                            style={styles.provideMedicationsButton}
                            onPress={() => setMedicationModalVisible(true)}
                        >
                            <MaterialCommunityIcons name="prescription" size={20} color="#fff" />
                            <Text style={styles.provideMedicationsText}>Provide Medications</Text>
                        </TouchableOpacity>

                        {/* Next Visit Section with Icon */}
                        <View style={styles.nextVisitSection}>
                            <MaterialCommunityIcons name="calendar-clock" size={24} color="#7d4c9e" />
                            <Text style={styles.nextVisitTitle}>Next Visit</Text>
                            {nextVisit ? (
                                <>
                                    <Text style={styles.nextVisitDate}>
                                        {new Date(nextVisit.visitDate).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                        })} at {nextVisit.visitTime}
                                    </Text>
                                    <Text style={styles.nextVisitType}>{nextVisit.visitType}</Text>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.nextVisitDate}>No visit scheduled</Text>
                                    <Text style={styles.nextVisitType}>Schedule a visit for the patient</Text>
                                </>
                            )}
                            <TouchableOpacity 
                                style={styles.scheduleButton}
                                onPress={() => setScheduleVisitModalVisible(true)}
                            >
                                <Feather name="calendar" size={16} color="#fff" />
                                <Text style={styles.scheduleButtonText}>Schedule Visit</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {activeTab === 'history' && (
                    <View>
                        {/* Diagnosis History Section */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionTitleContainer}>
                                    <Feather name="book-open" size={20} color="#7d4c9e" />
                                    <Text style={styles.sectionTitle}>Vault Records</Text>
                                </View>
                                <TouchableOpacity style={styles.seeAllButton}>
                                    <Text style={styles.seeAllText}>See all</Text>
                                    <Feather name="chevron-right" size={16} color="#7d4c9e" />
                                </TouchableOpacity>
                            </View>

                            {vaultRecords.length > 0 ? (
                                vaultRecords.map((dateGroup: DateGroup, dateIndex: number) => (
                                    <View key={dateGroup.date}>
                                        {/* Date Header */}
                                        <Text style={styles.diagnosisDate}>
                                            {new Date(dateGroup.date).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                            })}
                                        </Text>

                                        {/* Documents for this date */}
                                        {dateGroup.documents.map((record: DocumentRecord, docIndex: number) => (
                                            <View key={record.id} style={styles.medicationItem}>
                                                <View style={styles.medicationHeader}>
                                                    <Text style={styles.medicationName}>{record.title}</Text>
                                                </View>
                                                {record.description && (
                                                    <Text style={styles.medicationDetails}>{record.description}</Text>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                ))
                            ) : (
                                <Text style={{ textAlign: 'center', color: '#999', marginVertical: 16 }}>
                                    No vault records found
                                </Text>
                            )}
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

                            {labRecords.length > 0 ? (
                                labRecords.map((dateGroup: DateGroup, dateIndex: number) => (
                                    <View key={dateGroup.date}>
                                        {/* Date Header */}
                                        <Text style={styles.diagnosisDate}>
                                            {new Date(dateGroup.date).toLocaleDateString('en-GB', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                            })}
                                        </Text>

                                        {/* Documents for this date */}
                                        {dateGroup.documents.map((report: DocumentRecord, docIndex: number) => (
                                            <View key={report.id} style={styles.medicationItem}>
                                                <View style={styles.medicationHeader}>
                                                    <Text style={styles.medicationName}>{report.title}</Text>
                                                </View>
                                                {report.description && (
                                                    <Text style={styles.medicationDetails}>{report.description}</Text>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                ))
                            ) : (
                                <Text style={{ textAlign: 'center', color: '#999', marginVertical: 16 }}>
                                    No lab reports found
                                </Text>
                            )}
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Navigation to match app screens */}
            <BottomNavigation activeTab="home" />

            {/* Medications Modal */}
            <PatientMedicationsModal
                visible={medicationModalVisible}
                onClose={() => setMedicationModalVisible(false)}
                onSubmit={handleMedicationSubmit}
                patientId={currentPatientUid}
            />

            {/* Schedule Visit Modal */}
            <ScheduleVisitModal
                visible={scheduleVisitModalVisible}
                onClose={() => setScheduleVisitModalVisible(false)}
                onSubmit={handleScheduleVisit}
                patientId={currentPatientUid}
            />
        </SafeAreaView>
    );
};

export default PatientDashboard;