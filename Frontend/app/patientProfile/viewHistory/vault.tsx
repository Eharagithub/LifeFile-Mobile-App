import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, Image, ScrollView, Dimensions, TouchableOpacity, Alert, Linking, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db, auth } from '../../../config/firebaseConfig';
//import styles from './viewhistory.styles';
import { Feather } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
const { width, height } = Dimensions.get('window');


export default function VaultView() {
    const { uid: uidParam, date: dateParam, docId: docIdParam } = useLocalSearchParams() as any;
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [doc, setDoc] = useState<any>(null);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const getCurrentUid = () => auth.currentUser ? auth.currentUser.uid : null;

    const [textContent, setTextContent] = useState<string | null>(null);

    useEffect(() => {
        const uid = uidParam || getCurrentUid();
        const date = dateParam;
        const docId = docIdParam;
        if (!uid || !date || !docId) {
            Alert.alert('Missing params', 'Cannot load document: missing parameters');
            setLoading(false);
            return;
        }

        const loadDoc = async () => {
            setLoading(true);
            try {
                const docRef = db.collection('Patient').doc(uid)
                    .collection('health').doc('history')
                    .collection('vault').doc(date)
                    .collection('documents').doc(docId);

                const snap = await docRef.get();
                if (snap.exists) {
                    setDoc({ id: snap.id, ...(snap.data() || {}) });
                    setLoading(false);
                    return;
                }

                // Fallback: nested map
                const userDoc = await db.collection('Patient').doc(uid).get();
                if (userDoc.exists) {
                    const data = userDoc.data() || {};
                    const nested = (((data as any).health || {}).history || {}).vault || {};
                    const dateNode = nested[date];
                    const docMap = dateNode && dateNode.documents ? dateNode.documents : null;
                    if (docMap && docMap[docId]) {
                        setDoc({ id: docId, ...(docMap[docId] || {}) });
                        setLoading(false);
                        return;
                    }
                }

                Alert.alert('Not found', 'Document not found');
            } catch {
                console.error('Failed to load vault document:');
                Alert.alert('Error', 'Failed to load document');
            } finally {
                setLoading(false);
            }
        };

        loadDoc();
    }, [uidParam, dateParam, docIdParam]);

    const handleBack = () => {
        router.back();
    };

    const createTempFileFromBase64 = async (base64: string, ext: string) => {
        try {
            const filename = `${FileSystem.cacheDirectory}vault_${Date.now()}.${ext}`;
            await FileSystem.writeAsStringAsync(filename, base64, { encoding: FileSystem.EncodingType.Base64 } as any);
            return filename;
        } catch (err) {
            console.error('Failed to write temp file:', err);
            throw err;
        }
    };

    const openFile = async (base64: string | undefined, mime: string | undefined, fallbackExt = 'bin') => {
        if (!base64) {
            Alert.alert('No content', 'No file content available to open.');
            return;
        }
        const ext = mime && mime.includes('pdf') ? 'pdf' : (mime && mime.split('/')[1]) ? mime.split('/')[1].replace(/[^a-z0-9]/gi, '') : fallbackExt;
        try {
            const fileUri = await createTempFileFromBase64(base64, ext);
            // Try to open with Linking - platform handlers should pick an app
            await Linking.openURL(fileUri);
        } catch (error) {
            console.error('Failed to open file:', error);
            Alert.alert('Open failed', 'Unable to open the file.');
        }
    };

    // decode text content when a text document is loaded
    useEffect(() => {
        const run = async () => {
            if (!doc || !doc.contentBase64) {
                setTextContent(null);
                return;
            }
            const t = (doc.type || '').toLowerCase();
            const isText = t.startsWith('text') || t.includes('json') || t.includes('xml');
            if (!isText) {
                setTextContent(null);
                return;
            }
            try {
                const tmp = await createTempFileFromBase64(doc.contentBase64, 'txt');
                const txt = await FileSystem.readAsStringAsync(tmp, { encoding: FileSystem.EncodingType.UTF8 } as any);
                setTextContent(txt);
            } catch (e) {
                console.error('Failed to decode text content', e);
                setTextContent('Unable to decode text content');
            }
        };
        run();
    }, [doc]);
    const handleDownload = () => {
        setShowOptionsMenu(false);
        Alert.alert('Success', 'Lab report downloaded successfully!');
    };

    const handleShare = () => {
        setShowOptionsMenu(false);
        Alert.alert('Share', 'Share options opened');
    };

    const toggleOptionsMenu = () => {
        setShowOptionsMenu(!showOptionsMenu);
    };

    if (loading) return (
        <SafeAreaView style={styles.container}>
            <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 40 }} />
        </SafeAreaView>
    );

    if (!doc) return (
        <SafeAreaView style={styles.container}>
            <Text style={{ padding: 20 }}>No document loaded.</Text>
        </SafeAreaView>
    );

    const isImage = doc.type && doc.type.startsWith('image');

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
                <Text style={styles.headerTitle}>{doc.name || 'Vault Document'}</Text>
            </View>

            {/* Main Content Area */}
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.mainContent}>
                    {/* Lab Report Container - Purple background area */}
                    <View style={styles.labReportContainer}>
                        {/* Three dots menu button - positioned in upper right corner */}
                        <TouchableOpacity
                            style={styles.optionsButton}
                            onPress={toggleOptionsMenu}
                        >
                            <Feather name="more-vertical" size={20} color="#666" />
                        </TouchableOpacity>

                        {/* Options Menu Dropdown */}
                        {showOptionsMenu && (
                            <View style={styles.optionsMenu}>
                                <TouchableOpacity
                                    style={styles.optionItem}
                                    onPress={handleDownload}
                                >
                                    <Feather name="download" size={16} color="#8b5cf6" />
                                    <Text style={styles.optionText}>Download</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.optionItem}
                                    onPress={handleShare}
                                >
                                    <Feather name="share-2" size={16} color="#8b5cf6" />
                                    <Text style={styles.optionText}>Share</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Content Area - full document display (image / pdf / text / fallback) */}
                        <View style={styles.contentArea}>
                            {isImage && doc.contentBase64 ? (
                                <Image source={{ uri: `data:${doc.type};base64,${doc.contentBase64}` }} style={{ width: '100%', height: '100%', resizeMode: 'stretch', borderRadius: 12 }} />
                            ) : (doc.type && doc.type.includes('pdf') && doc.contentBase64) ? (
                                // Render PDF via WebView using data URI
                                <View style={{ height: height * 0.85, width: width - 40 }}>
                                    <WebView
                                        originWhitelist={["*"]}
                                        source={{ uri: `data:application/pdf;base64,${doc.contentBase64}` }}
                                        style={{ flex: 1, borderRadius: 8, overflow: 'hidden' }}
                                    />
                                </View>
                            ) : (doc.contentBase64 && (doc.type && (doc.type.startsWith('text') || doc.type.includes('json') || doc.type.includes('xml')))) ? (
                                // Text content: decode by writing to temp file and reading as utf8
                                <ScrollView style={{ maxHeight: height * 0.8 }}>
                                    <Text style={{ color: '#111', lineHeight: 20 }}>
                                        {textContent ?? 'Loading content...'}
                                    </Text>
                                </ScrollView>
                            ) : (
                                <View>
                                    <Text style={{ color: '#6c757d', marginBottom: 12 }}>Preview not available for this file type.</Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity onPress={() => openFile(doc.contentBase64, doc.type)} style={{ marginRight: 12, backgroundColor: '#fff', padding: 10, borderRadius: 8 }}>
                                            <Text style={{ color: '#8B5CF6' }}>Open</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => openFile(doc.contentBase64, doc.type)} style={{ backgroundColor: '#fff', padding: 10, borderRadius: 8 }}>
                                            <Text style={{ color: '#8B5CF6' }}>Download</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Floating Action Buttons - Remove since options are now in dropdown */}
                </View>

                {/* Overlay to close options menu when touching outside */}
                {showOptionsMenu && (
                    <TouchableOpacity
                        style={styles.overlay}
                        onPress={() => setShowOptionsMenu(false)}
                        activeOpacity={1}
                    />
                )}


            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    backButton: {
        padding: 4,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#1f2937',
    },
    mainContent: {
        flex: 1,
        padding: 16,
        position: 'relative' as const,
    },
    labReportContainer: {
        backgroundColor: '#e9d5ff',
        borderRadius: 16,
        minHeight: height * 0.7,
        position: 'relative' as const,
        height: '100%',
        overflow: 'hidden',
    },
    optionsButton: {
        position: 'absolute' as const,
        top: 16,
        right: 16,
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 20,
        zIndex: 20,
    },
    optionsMenu: {
        position: 'absolute' as const,
        top: 60,
        right: 16,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
        minWidth: 120,
        zIndex: 30,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    optionText: {
        marginLeft: 12,
        fontSize: 14,
        color: '#374151',
    },
    contentArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,

    },
    floatingButtons: {
        position: 'absolute' as const,
        top: 16,
        right: 16,
        zIndex: 10,
    },
    floatingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    floatingButtonText: {
        marginLeft: 12,
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    overlay: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
    },
});