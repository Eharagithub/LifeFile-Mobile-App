import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { styles } from './uploads.styles';
import { auth } from '../../../../config/firebaseConfig';
import authService from '../../../../services/authService';
// Use the legacy FileSystem API to preserve readAsStringAsync behaviour
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import BottomNavigation from '../../../common/BottomNavigation';

interface DocumentResult {
    name: string;
    uri: string;
    type: string;
    size: number;
}

interface FileUploadSectionProps {
    title: string;
    description: string;
    onFileSelect: (file: DocumentResult | null) => void;
    selectedFile: DocumentResult | null;
    iconName: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBackgroundColor: string;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
    title,
    description,
    onFileSelect,
    selectedFile,
    iconName,
    iconColor,
    iconBackgroundColor,
}) => {


    const handleFileSelect = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            // DocumentPicker returns either a single result with type === 'success'
            // or an object with assets for some pickers. Support both shapes.
            // Example successful result: { type: 'success', name, uri, size, mimeType }
            if ((result as any).type === 'success') {
                const r: any = result;
                const documentResult: DocumentResult = {
                    name: r.name || 'file',
                    uri: r.uri,
                    type: r.mimeType || r.type || 'unknown',
                    size: r.size || 0,
                };
                onFileSelect(documentResult);
                return;
            }

            // Fallback: some pickers return assets array (image picker). Handle that too.
            if ((result as any).assets && Array.isArray((result as any).assets) && (result as any).assets.length > 0) {
                const file: any = (result as any).assets[0];
                const documentResult: DocumentResult = {
                    name: file.name || file.fileName || 'file',
                    uri: file.uri,
                    type: file.mimeType || file.type || 'unknown',
                    size: file.size || 0,
                };
                onFileSelect(documentResult);
                return;
            }

            // If canceled or unsupported shape
            // do nothing (user canceled) — caller will see no file selected
        } catch (error) {
            Alert.alert('Error', 'Failed to select file');
            console.error('File selection error:', error);
        }
    };

    return (
        <View style={styles.fileUploadSection}>
            <View style={[styles.sectionIcon, { backgroundColor: iconBackgroundColor }]}>
                <Ionicons name={iconName} size={24} color={iconColor} />
            </View>
            <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <Text style={styles.sectionDescription}>{description}</Text>
                <View style={styles.fileUploadContainer}>
                    <TouchableOpacity
                        style={styles.fileUploadButton}
                        onPress={handleFileSelect}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.fileUploadButtonText}>Choose File</Text>
                    </TouchableOpacity>
                    <Text style={styles.fileStatus}>
                        {selectedFile ? selectedFile.name : 'No file chosen'}
                    </Text>
                </View>
            </View>
        </View>
    );
};

interface NavigationItemProps {
    title: string;
    onPress: () => void;
    iconName: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBackgroundColor: string;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
    title,
    onPress,
    iconName,
    iconColor,
    iconBackgroundColor,
}) => {
    return (
        <TouchableOpacity
            style={styles.navigationItem}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.navigationIcon, { backgroundColor: iconBackgroundColor }]}>
                <Ionicons name={iconName} size={24} color={iconColor} />
            </View>
            <Text style={styles.navigationTitle}>{title}</Text>
        </TouchableOpacity>
    );
};

const Uploads: React.FC = () => {
    const [medicalVaultFile, setMedicalVaultFile] = useState<DocumentResult | null>(null);
    const [reportsFile, setReportsFile] = useState<DocumentResult | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);

    const router = useRouter();
        const handleBack = () => {
                router.back();
        };
    

    const handleSearchPastLabRecords = () => {
        // Handle search past lab records navigation
        router.push('../../labReports/labresults');
        // Navigate to search screen
    };

    const handleGoToPastMedicalHistory = () => {
        // Handle go to past medical history navigation
        router.push('../../viewHistory/viewhistory');
        // Navigate to medical history screen
    };

    const getCurrentUid = () => auth.currentUser ? auth.currentUser.uid : null;

    const uploadFileToVault = useCallback(async (file: DocumentResult | null, category: string = 'medical') => {
        if (!file) {
            Alert.alert('No file', 'Please select a file first.');
            return;
        }

        const uid = getCurrentUid();
        if (!uid) {
            Alert.alert('Not signed in', 'You must be signed in to upload files.');
            return;
        }

    setUploading(true);

        try {
            // Read file content as base64 using Expo FileSystem
            const dateKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

            // Read as base64. Use a simple string option to avoid type mismatch with older expo-file-system types.
            let base64 = '';
            try {
                base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: 'base64' } as any);
            } catch (readErr) {
                console.error('Failed to read file as base64 via FileSystem:', readErr);
                Alert.alert('Upload failed', 'Unable to read the selected file. Some Android URIs may not be supported by the file reader.');
                setUploading(false);
                return;
            }

            // determine role (patient/doctor) to pick collection
            const roles = await authService.determineRoles(uid);
            const role: 'patient' | 'doctor' = roles.isPatient ? 'patient' : roles.isDoctor ? 'doctor' : 'patient';
            // Quick client-side guard against storing very large base64 strings in Firestore.
            // Firestore documents have a ~1MiB limit; storing base64 can exceed that even for modest files.
            // We enforce a conservative cap on the base64 string length (characters).
            const MAX_BASE64_CHARS = 1040000; // ~1.04M characters ~= safe margin under Firestore limits
            if (base64.length > MAX_BASE64_CHARS) {
                Alert.alert('File too large', 'This file is too large to store in Firestore as base64. Please reduce the file size or use external storage (Firebase Storage).');
                setUploading(false);
                return;
            }

            const sizeEstimate = file.size || Math.floor((base64.length * 3) / 4);
            const fileRecord: any = {
                name: file.name,
                originalName: file.name,
                type: file.type || '',
                size: sizeEstimate,
                contentBase64: base64,
                uploadedAt: new Date().toISOString(),
                date: dateKey,
                category,
            };

            let res: { success: boolean; error?: string } = { success: false };
            if (category === 'reports') {
                // Save reports under health/history/labs
                res = await authService.saveLabDocument(uid, fileRecord, role);
            } else {
                // Default: save to vault
                res = await authService.saveVaultDocument(uid, fileRecord, role);
            }

            if (res.success) {
                if ((res as any).fallback) {
                    // Saved via nested-map fallback — subcollection/tab not created
                    Alert.alert('Uploaded (fallback)', 'Report saved but Firestore subcollection could not be created due to permissions. The record is stored inside your user document. To get a separate "labs" collection/tab, allow subcollection writes in Firestore rules.');
                } else {
                    Alert.alert('Uploaded', category === 'reports' ? 'Report uploaded to your lab history.' : 'File uploaded to your medical vault.');
                }
                // clear selected file after success
                if (category === 'medical') setMedicalVaultFile(null);
                else if (category === 'reports') setReportsFile(null);
            } else {
                console.error('save document failed:', res.error);
                Alert.alert('Upload failed', res.error || 'Failed to save document record');
            }

            // Run a quick verification read to confirm whether the subcollection contains documents
            if (category === 'reports') {
                try {
                    const listRes = await authService.listLabDocuments(uid, dateKey, role);
                    if (listRes.success) {
                        Alert.alert('Verification', `Lab documents found in subcollection: ${listRes.count}`);
                    } else {
                        // likely permissions prevented reading the subcollection
                        Alert.alert('Verification', `Unable to read labs subcollection: ${listRes.error}`);
                    }
                } catch (e) {
                    console.warn('Verification read failed', e);
                }
            }

        } catch (err) {
            console.error('Upload failed:', err);
            Alert.alert('Upload failed', 'Failed to upload file.');
        } finally {
            setUploading(false);
        }
    }, []);

    // Auto-upload when a file is selected (so users who pick a file don't need to press upload)
    useEffect(() => {
        if (medicalVaultFile && !uploading) {
            uploadFileToVault(medicalVaultFile, 'medical');
        }
    }, [medicalVaultFile, uploadFileToVault, uploading]);

    useEffect(() => {
        if (reportsFile && !uploading) {
            uploadFileToVault(reportsFile, 'reports');
        }
    }, [reportsFile, uploadFileToVault, uploading]);


    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                >
                    <Feather name="chevron-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Uploads</Text>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <FileUploadSection
                    title="Medical Vault"
                    description="Upload Diagnosis Cards, Prescriptions, etc."
                    onFileSelect={setMedicalVaultFile}
                    selectedFile={medicalVaultFile}
                    iconName="folder"
                    iconColor="#673AB7"
                    iconBackgroundColor="#f1e6f3ff"
                />

                <FileUploadSection
                    title="My Reports"
                    description="Upload Lab Reports"
                    onFileSelect={setReportsFile}
                    selectedFile={reportsFile}
                    iconName="document-text"
                    iconColor="#673AB7"
                    iconBackgroundColor="#f1e6f3ff"
                />

                <NavigationItem
                    title="Search Past Lab Records"
                    onPress={handleSearchPastLabRecords}
                    iconName="search"
                    iconColor="#673AB7"
                    iconBackgroundColor="#f1e6f3ff"
                />

                <NavigationItem
                    title="Go to Past Medical History"
                    onPress={handleGoToPastMedicalHistory}
                    iconName="time"
                    iconColor="#673AB7"
                    iconBackgroundColor="#f1e6f3ff"
                />
            </ScrollView>
            {/* Bottom Navigation */}
            <BottomNavigation activeTab="none" />
        </View>
    );
};

export default Uploads;

