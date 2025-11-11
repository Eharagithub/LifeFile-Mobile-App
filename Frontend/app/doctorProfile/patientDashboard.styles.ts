import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },

    // Header Styles
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },

    backButton: {
        padding: 8,
        marginRight: 12,
        borderRadius: 8,
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        flex: 1,
    },

    // Patient Header (card-like)
    patientHeader: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 20,
        borderRadius: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },

    // Profile Section with Image and Info in one line
    profileMainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },

    profileImageContainer: {
        marginLeft: 5,
        marginRight: 20,
    },

    profileIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#7d4c9e',
    },

    profileInfo: {
        flex: 1,
    },

    patientName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
        marginBottom: 4,
    },

    patientDetailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },

    patientAgeLocation: {
        fontSize: 14,
        color: '#666',
        marginRight: 12,
    },

    bloodTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    bloodType: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        marginLeft: 4,
    },

    // Action Buttons with Icons
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },

    callButton: {
        flex: 1,
        backgroundColor: '#7d4c9e',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },

    callButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    messageButton: {
        flex: 1,
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#7d4c9e',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },

    messageButtonText: {
        color: '#7d4c9e',
        fontSize: 16,
        fontWeight: '600',
    },

    // Divider
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 16,
        marginVertical: 8,
    },

    // Upload and Progress Sections with Icons
    uploadSection: {
        backgroundColor: '#f3e6f5ff',
        marginHorizontal: 16,
        marginTop: 8,
        padding: 16,
        borderRadius: 8,
        borderColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',

    },
    uploadButtons: {
        flexDirection: 'row',
        gap: 5,
    },

    uploadText: {
        fontSize: 16,
        color: '#7d4c9e',
        fontWeight: '600',
        marginLeft: 5,
    },

    progressSection: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 4,
        marginLeft: 2,
        padding: 16,
        borderRadius: 8,
        borderColor: '#f7e1faff',
        flexDirection: 'row',
        alignItems: 'center',

    },

    progressText: {
        fontSize: 16,
        color: '#7d4c9e',
        fontWeight: '600',
        marginLeft: 5,
    },
    // Navigation Tabs
    navTabs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 8,
        backgroundColor: '#fff',
    },

    navTab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    navTabText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },

    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#7d4c9e',
    },

    activeTabText: {
        color: '#7d4c9e',
        fontWeight: '600',
    },

    // Sections (card container)
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 8,
        padding: 16,
        borderRadius: 8,
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },

    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
    },

    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    seeAllText: {
        fontSize: 14,
        color: '#7d4c9e',
        fontWeight: '600',
    },

    // Allergy Items with Icons
    allergyItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },

    allergyItemLast: {
        marginBottom: 0,
        borderBottomWidth: 0,
    },

    allergyIconContainer: {
        marginRight: 12,
        marginTop: 2,
    },

    allergyContent: {
        flex: 1,
    },

    allergyName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111',
        marginBottom: 4,
    },

    allergyDescription: {
        fontSize: 14,
        color: '#666',
    },

    // Medication Items with Icons
    medicationItem: {
        marginBottom: 12,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },

    medicationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },

    medicationNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    medicationName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111',
    },

    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },

    activeBadge: {
        backgroundColor: '#d4edda',
    },

    inactiveBadge: {
        backgroundColor: '#f8d7da',
    },

    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#155724',
    },

    medicationDetails: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },

    medicationDuration: {
        fontSize: 14,
        color: '#666',
    },

    // Provide Medications Button with Icon
    provideMedicationsButton: {
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: '#7d4c9e',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },

    provideMedicationsText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    // Next Visit Section with Icon
    nextVisitSection: {
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 20,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eef2f6',
    },

    nextVisitTitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
        marginTop: 8,
    },

    nextVisitDate: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
        marginBottom: 4,
    },

    nextVisitType: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },

    scheduleButton: {
        backgroundColor: '#7d4c9e',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    scheduleButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    historyContainer: {
    paddingHorizontal: 16,
},

diagnosisItem: {
    marginBottom: 20,
},

diagnosisDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 4,
},
});