import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  Image,
  ActivityIndicator,
  StyleSheet, Platform, Share, Modal
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
// Use legacy FileSystem to preserve read/write API compatibility
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';

interface LabResult {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'high' | 'low';
}

export default function DetailedResult() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(true);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [sharingLoading, setSharingLoading] = useState(false);

  // Parse parameters from navigation
  const reportId = params.reportId as string;
  const reportName = params.reportName as string;
  const reportType = params.reportType as 'pdf' | 'image';
  const reportUrl = params.reportUrl as string;
  const results = params.results ? JSON.parse(params.results as string) as LabResult[] : [];

  console.debug('[detailedResult] opening report', { reportId, reportName, reportType });

  // If reportUrl is a data URI (base64), use it directly without file processing
  useEffect(() => {
    let mounted = true;

    const prepareForDisplay = async () => {
      try {
        // For small images, use data URI directly for faster loading
        if (reportType === 'image' && reportUrl && reportUrl.startsWith('data:image')) {
          // Check if it's a small image (under 2MB) - use direct data URI
          const base64Data = reportUrl.split(',')[1];
          if (base64Data && base64Data.length < 2 * 1024 * 1024) { // 2MB limit
            if (mounted) {
              setLocalUri(reportUrl); // Use data URI directly for small images
              setLoadingPreview(false);
              return;
            }
          }
        }

        // For PDFs and large images, proceed with file processing
        if (!reportUrl || !reportUrl.startsWith('data:')) {
          if (mounted) {
            setLoadingPreview(false);
          }
          return;
        }

        const parts = reportUrl.split(';base64,');
        if (parts.length !== 2) {
          if (mounted) setLoadingPreview(false);
          return;
        }

        const mime = parts[0].replace('data:', '') || 'application/octet-stream';
        const b64 = parts[1];
        const ext = mime.includes('pdf') ? '.pdf' : (mime.includes('png') ? '.png' : (mime.includes('jpeg') || mime.includes('jpg') ? '.jpg' : ''));
        const fname = `lab_${reportId || Date.now()}${ext}`;
        const path = FileSystem.cacheDirectory + fname;

        // Write base64 to cache directory
        await FileSystem.writeAsStringAsync(path, b64, { encoding: FileSystem.EncodingType.Base64 } as any);

        // Use content URI for Android, file URI for iOS
        let finalUri;
        if (Platform.OS === 'android' && (FileSystem as any).getContentUriAsync) {
          try {
            const contentUri: any = await (FileSystem as any).getContentUriAsync(path);
            finalUri = contentUri?.uri || contentUri;
          } catch (uriErr) {
            console.warn('getContentUriAsync failed, using file URI', uriErr);
            finalUri = 'file://' + path;
          }
        } else {
          finalUri = 'file://' + path;
        }

        if (mounted) {
          setLocalUri(finalUri);
          setLoadingPreview(false);
        }

      } catch (e) {
        console.warn('Failed to prepare file for display', e);
        if (mounted) {
          setLoadingPreview(false);
        }
      }
    };

    prepareForDisplay();
    return () => { mounted = false; };
  }, [reportUrl, reportId, reportType]);

  // Request media library permissions
  useEffect(() => {
    const requestMediaPermission = async () => {
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        setHasMediaPermission(status === 'granted');

        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Please grant media library permissions to save files to your gallery.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error requesting media permission:', error);
      }
    };

    requestMediaPermission();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleDownload = async () => {
    console.log('handleDownload called, reportId=', reportId);
    setShowOptionsMenu(false);

    if (!reportUrl) {
      Alert.alert('Error', 'No document content available to download.');
      return;
    }

    if (!hasMediaPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant media library permissions in your device settings to save files.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Show loading indicator
      Alert.alert('Downloading', 'Please wait...', [], { cancelable: false });

      // Extract base64 from data URI
      let base64Data = '';
      let mimeType = reportType === 'pdf' ? 'application/pdf' : 'image/jpeg';

      if (reportUrl.startsWith('data:')) {
        const parts = reportUrl.split(';base64,');
        if (parts.length === 2) {
          mimeType = parts[0].replace('data:', '');
          base64Data = parts[1];
        }
      }

      if (!base64Data) {
        Alert.alert('Error', 'Could not extract file data for download.');
        return;
      }

      const fileExt = getFileExtension(mimeType);
      const tempFilePath = await createTempFileFromBase64(base64Data, fileExt);

      let result;
      if (mimeType.startsWith('image/')) {
        // For images, save to gallery
        result = await saveToGallery(tempFilePath, mimeType);
        Alert.alert('Success', 'Image saved to your gallery!');
      } else {
        // For other files, save to documents directory
        result = await saveToGallery(tempFilePath, mimeType);
        Alert.alert(
          'Success',
          `File saved to your documents folder!\n\nPath: ${result}`,
          [{ text: 'OK' }]
        );
      }

      // Clean up temp file
      try {
        await FileSystem.deleteAsync(tempFilePath);
      } catch (cleanupError) {
        console.warn('Could not delete temp file:', cleanupError);
      }

    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert(
        'Download Failed',
        'Could not save the file. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleShare = async () => {
    console.log('handleShare called, reportId=', reportId);
    setShowOptionsMenu(false);

    if (!reportUrl) {
      Alert.alert('Error', 'No document content available to share.');
      return;
    }

    setSharingLoading(true);

    try {
      // Extract base64 from data URI
      let base64Data = '';
      let mimeType = reportType === 'pdf' ? 'application/pdf' : 'image/jpeg';

      if (reportUrl.startsWith('data:')) {
        const parts = reportUrl.split(';base64,');
        if (parts.length === 2) {
          mimeType = parts[0].replace('data:', '');
          base64Data = parts[1];
        }
      }

      if (!base64Data) {
        Alert.alert('Error', 'Could not extract file data for sharing.');
        setSharingLoading(false);
        return;
      }

      const fileExt = getFileExtension(mimeType);
      const tempFilePath = await createTempFileFromBase64(base64Data, fileExt);

      // Get a proper filename
      const fileName = reportName ? `${reportName}.${fileExt}` : `lab_report_${Date.now()}.${fileExt}`;

      // For Android, we need to move the file to a shareable location
      let shareablePath = tempFilePath;
      if (Platform.OS === 'android') {
        const documentDir = FileSystem.documentDirectory;
        const newPath = `${documentDir}${fileName}`;
        await FileSystem.copyAsync({
          from: tempFilePath,
          to: newPath
        });
        shareablePath = newPath;
      }

      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device.');
        setSharingLoading(false);
        return;
      }

      // The loading state will be automatically cleared when component re-renders after share
      await Sharing.shareAsync(shareablePath, {
        mimeType: mimeType || 'application/octet-stream',
        dialogTitle: `Share ${reportName || 'Lab Report'}`,
        UTI: getUTIForFileType(mimeType)
      });

      // Clean up temp files after a delay
      setTimeout(async () => {
        try {
          await FileSystem.deleteAsync(tempFilePath);
          if (Platform.OS === 'android' && shareablePath !== tempFilePath) {
            await FileSystem.deleteAsync(shareablePath);
          }
        } catch (cleanupError) {
          console.warn('Could not delete temp files after sharing:', cleanupError);
        }
      }, 5000);

    } catch (error) {
      console.error('Share failed:', error);
      Alert.alert(
        'Share Failed',
        'Could not share the file. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      // Ensure loading state is cleared even if there's an error
      setSharingLoading(false);
    }
  };

  const toggleOptionsMenu = () => {
    setShowOptionsMenu(!showOptionsMenu);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'high': return '#ef4444';
      case 'low': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getStatusBackgroundColor = (status: string): string => {
    switch (status) {
      case 'high': return '#fef2f2';
      case 'low': return '#fef3c7';
      default: return '#dcfce7';
    }
  };

  const createTempFileFromBase64 = async (base64: string, ext: string) => {
    try {
      const filename = `${FileSystem.cacheDirectory}lab_report_${Date.now()}.${ext}`;
      await FileSystem.writeAsStringAsync(filename, base64, { encoding: FileSystem.EncodingType.Base64 } as any);
      return filename;
    } catch (err) {
      console.error('Failed to write temp file:', err);
      throw err;
    }
  };

  const getFileExtension = (mimeType: string) => {
    const extensions: { [key: string]: string } = {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'text/plain': 'txt',
      'application/json': 'json',
      'text/xml': 'xml',
      'application/xml': 'xml',
    };

    return extensions[mimeType] || 'bin';
  };

  const saveToGallery = async (fileUri: string, mimeType: string) => {
    try {
      // For images, use MediaLibrary to save to gallery
      if (mimeType.startsWith('image/')) {
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync('Download', asset, false);
        return true;
      } else {
        // For other file types, save to Documents folder
        const documentDir = FileSystem.documentDirectory;
        const fileName = `lab_report_${Date.now()}.${getFileExtension(mimeType)}`;
        const newPath = `${documentDir}${fileName}`;

        await FileSystem.copyAsync({
          from: fileUri,
          to: newPath
        });

        return newPath;
      }
    } catch (error) {
      console.error('Error saving to gallery:', error);
      throw error;
    }
  };

  const getUTIForFileType = (mimeType: string): string => {
    const utiMap: { [key: string]: string } = {
      'application/pdf': 'com.adobe.pdf',
      'image/jpeg': 'public.jpeg',
      'image/jpg': 'public.jpeg',
      'image/png': 'public.png',
      'image/gif': 'public.gif',
      'text/plain': 'public.plain-text',
      'application/json': 'public.json',
      'text/xml': 'public.xml',
      'application/xml': 'public.xml',
    };

    return utiMap[mimeType] || 'public.data';
  };

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
        <Text style={styles.headerTitle}>{reportName || 'Detailed Result'}</Text>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Report Container */}
        <View style={styles.labReportContainer}>
          <TouchableOpacity
            style={styles.optionsButton}
            onPress={toggleOptionsMenu}
          >
            <Feather name="more-vertical" size={20} color="#666" />
          </TouchableOpacity>

          {/* Options Menu - Now in Modal */}
          {showOptionsMenu && (
            <Modal transparent animationType="fade" visible={showOptionsMenu} onRequestClose={() => setShowOptionsMenu(false)}>
              <View style={{ flex: 1 }}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowOptionsMenu(false)} />
                <View style={styles.modalMenuPosition} pointerEvents="box-none">
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
                </View>
              </View>
            </Modal>
          )}

          {/* ... content area ... */}
          <View style={styles.contentArea}>
            {(localUri || reportUrl) ? (
              reportType === 'pdf' ? (
                <View style={{ flex: 1, width: '100%' }}>
                  <WebView
                    originWhitelist={["*"]}
                    source={{ uri: localUri || reportUrl }}
                    style={{ flex: 1 }}
                    onLoadEnd={() => setLoadingPreview(false)}
                    onLoadStart={() => console.log('WebView loading started')}
                    renderError={(error) => {
                      console.log('WebView error:', error);
                      return (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                          <Text>Failed to load PDF</Text>
                        </View>
                      );
                    }}
                  />
                  {loadingPreview && (
                    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
                      <ActivityIndicator size="large" color="#8B5CF6" />
                      <Text style={{ marginTop: 10, color: '#666' }}>Loading PDF...</Text>
                    </View>
                  )}
                </View>
              ) : (
                <Image
                  source={{ uri: localUri || reportUrl }}
                  style={{ width: '100%', height: '100%', resizeMode: "stretch", borderRadius: 12 }}
                  onLoadEnd={() => setLoadingPreview(false)}
                  onLoadStart={() => console.log('Image loading started')}
                  onError={(error) => console.log('Image load error:', error.nativeEvent)}
                />
              )
            ) : (
              <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={{ marginTop: 10, color: '#374151' }}>Loading preview...</Text>
              </View>
            )}
          </View>
        </View>

        {/* Results Section */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginVertical: 12 }}>Results</Text>
          {results && results.length > 0 ? (
            results.map((res, idx) => (
              <View key={String(idx)} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 12, marginBottom: 8, backgroundColor: getStatusBackgroundColor(res.status), borderRadius: 8 }}>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '600' }}>{res.name}</Text>
                  <Text style={{ color: '#374151' }}>{res.value} {res.unit}</Text>
                </View>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: getStatusColor(res.status) }} />
                </View>
              </View>
            ))
          ) : (
            <Text style={{ color: '#6b7280' }}>No numeric results available for this report.</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const { height } = Dimensions.get('window');

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
    overflow: 'hidden', // ensure children (image) are clipped to rounded corners
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
  modalOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  modalMenuPosition: {
    position: 'absolute' as const,
    top: 100, // Adjust this based on your header height
    right: 16,
    zIndex: 100,
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
    padding: 12, // ~2mm gap (approx 12 dp) so image has a small border space
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
