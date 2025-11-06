import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
// Use legacy FileSystem to preserve read/write API compatibility
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

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

  // Parse parameters from navigation
  const reportId = params.reportId as string;
  const reportName = params.reportName as string;
  const reportType = params.reportType as 'pdf' | 'image';
  const reportUrl = params.reportUrl as string;
  const results = params.results ? JSON.parse(params.results as string) as LabResult[] : [];

  console.debug('[detailedResult] opening report', { reportId, reportName, reportType });

  // If reportUrl is a data URI (base64), write it to a temp file and load from file:// path.
  useEffect(() => {
    let mounted = true;
    const prepareLocalFile = async () => {
      try {
        if (!reportUrl || !reportUrl.startsWith('data:')) return;
        // data:<mime>;base64,<data>
        const parts = reportUrl.split(';base64,');
        if (parts.length !== 2) return;
        const mime = parts[0].replace('data:', '') || 'application/octet-stream';
        const b64 = parts[1];
        const ext = mime.includes('pdf') ? '.pdf' : (mime.includes('png') ? '.png' : (mime.includes('jpeg') || mime.includes('jpg') ? '.jpg' : ''));
        const fname = `lab_${reportId || Date.now()}${ext}`;
        const path = FileSystem.cacheDirectory + fname;

        // Write base64 to cache directory
        await FileSystem.writeAsStringAsync(path, b64, { encoding: FileSystem.EncodingType.Base64 } as any);

        // On Android WebView often cannot load raw file:// paths from app-private storage.
        // Use Expo FileSystem.getContentUriAsync to obtain a content:// URI that WebView can access.
        try {
          if (Platform.OS === 'android' && (FileSystem as any).getContentUriAsync) {
            const contentUri: any = await (FileSystem as any).getContentUriAsync(path);
            const finalUri = contentUri && contentUri.uri ? contentUri.uri : contentUri;
            console.debug('[detailedResult] resolved content URI for WebView', finalUri);
            if (mounted) {
              setLocalUri(finalUri);
              setLoadingPreview(false);
            }
          } else {
            const uri = 'file://' + path;
            console.debug('[detailedResult] using file URI for WebView', uri);
            if (mounted) {
              setLocalUri(uri);
              setLoadingPreview(false);
            }
          }
        } catch (uriErr) {
          console.warn('[detailedResult] getContentUriAsync failed, falling back to file://', uriErr);
          try {
            const uri = 'file://' + path;
            if (mounted) {
              setLocalUri(uri);
              setLoadingPreview(false);
            }
          } catch (e) {
            console.error('[detailedResult] failed to set fallback file URI', e);
          }
        }
      } catch (e) {
        console.warn('[detailedResult] failed to write data URI to file', e);
      }
    };

    prepareLocalFile();
    return () => { mounted = false; };
  }, [reportUrl, reportId]);

  const handleBack = () => {
    router.back();
  };

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

          <View style={styles.contentArea}>
            {(localUri || reportUrl) ? (
              reportType === 'pdf' ? (
                <View style={{ flex: 1, width: '100%'}}>
                  <WebView
                    originWhitelist={["*"]}
                    source={{ uri: localUri || reportUrl }}
                    style={{ flex: 1 }}
                    onLoadEnd={() => setLoadingPreview(false)}
                  />
                  {loadingPreview ? (
                    <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
                      <ActivityIndicator size="large" color="#8B5CF6" />
                    </View>
                  ) : null}
                </View>
              ) : (
                <Image
                  source={{ uri: localUri || reportUrl }}
                  style={{ width: '100%', height: '100%', resizeMode: 'stretch', borderRadius: 12 }}
                  onLoadEnd={() => setLoadingPreview(false)}
                />
              )
            ) : (
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#374151' }}>No preview available</Text>
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

        {showOptionsMenu && (
          <TouchableOpacity 
            style={styles.overlay}
            onPress={() => setShowOptionsMenu(false)}
            activeOpacity={1}
          />
        )}
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
