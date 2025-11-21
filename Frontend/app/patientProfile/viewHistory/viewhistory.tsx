import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  SectionList,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles from './viewhistory.styles';
import { db, auth } from '../../../config/firebaseConfig';
import BottomNavigation from '../../common/BottomNavigation';
//import { ScrollView } from 'react-native-reanimated/lib/typescript/Animated';

// Vault record interface
interface VaultRecord {
  id: string;
  name: string;
  originalName?: string;
  type: string;
  size: number;
  date: string;
  uploadedAt: string;
  contentBase64?: string;
}

export default function ViewHistory() {
  const router = useRouter();

  const [dateKey, setDateKey] = useState(''); // expect YYYY-MM-DD
  const [loading, setLoading] = useState(false);
  const [vaultItems, setVaultItems] = useState<VaultRecord[]>([]);
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);


  // Format date string for display (e.g., "2024-11-20" -> "Nov 20, 2024")
  const formatDateForDisplay = (dateStr: string): string => {
    try {
      const date = new Date(dateStr + 'T00:00:00Z');
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleBack = () => {
    router.back();
  };

  const getCurrentUid = () => auth.currentUser ? auth.currentUser.uid : null;



  // Fetch all vault documents for the authenticated user with optimized parallel loading
  const fetchAllVault = async (uid: string) => {
    setLoading(true);
    setVaultItems([]);
    setPreviewBase64(null);

    const groups: Map<string, VaultRecord[]> = new Map();

    try {
      // Generate dates to check (past 90 days)
      const today = new Date();
      const datesToTry: string[] = [];
      for (let i = 0; i < 90; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        datesToTry.push(date.toISOString().split('T')[0]);
      }

      console.log(`[viewhistory] Loading records...`);

      // Fetch dates in parallel (batched by 10 to avoid overwhelming Firebase)
      const batchSize = 10;
      for (let i = 0; i < datesToTry.length; i += batchSize) {
        const batch = datesToTry.slice(i, i + batchSize);
        const promises = batch.map(dateKey =>
          db.collection('Patient').doc(uid)
            .collection('health').doc('history')
            .collection('vault').doc(dateKey)
            .collection('documents').get()
            .then(docsSnap => ({ dateKey, docsSnap }))
            .catch(() => ({ dateKey, docsSnap: null }))
        );

        const results = await Promise.all(promises);
        results.forEach(({ dateKey, docsSnap }) => {
          if (docsSnap && !docsSnap.empty) {
            const items: VaultRecord[] = [];
            docsSnap.forEach((d: any) => {
              const data = d.data() || {};
              items.push({
                id: d.id,
                name: data.name || data.originalName || 'Document',
                originalName: data.originalName,
                type: data.type || '',
                size: data.size || 0,
                date: dateKey,
                uploadedAt: data.uploadedAt || '',
                contentBase64: data.contentBase64,
              });
            });

            if (items.length > 0) {
              items.sort((a, b) => {
                const timeA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
                const timeB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
                return timeB - timeA;
              });
              groups.set(dateKey, items);
            }
          }
        });
      }

      // If nothing found via subcollections, fallback to reading nested map on user document
      if (groups.size === 0) {
        console.log('[viewhistory] Checking fallback...');
        try {
          const userDoc = await db.collection('Patient').doc(uid).get();
          if (userDoc.exists) {
            const data = userDoc.data() || {};
            const nested = (((data as any).health || {}).history || {}).vault || {};

            Object.keys(nested).forEach(date => {
              const dateNode = nested[date];
              if (dateNode && dateNode.documents) {
                const docsMap = dateNode.documents;
                const items: VaultRecord[] = [];
                Object.keys(docsMap).forEach(key => {
                  const doc = docsMap[key];
                  items.push({
                    id: key,
                    name: doc.name || doc.originalName || 'Document',
                    originalName: doc.originalName,
                    type: doc.type || '',
                    size: doc.size || 0,
                    date,
                    uploadedAt: doc.uploadedAt || '',
                    contentBase64: doc.contentBase64,
                  });
                });
                if (items.length > 0) {
                  items.sort((a, b) => {
                    const timeA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
                    const timeB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
                    return timeB - timeA;
                  });
                  groups.set(date, items);
                }
              }
            });
          }
        } catch (err) {
          console.warn('[viewhistory] Fallback read error:', err);
        }
      }

      // Build sorted array - newest dates first
      const sortedDates = Array.from(groups.keys()).sort((a, b) => {
        const dateA = new Date(a).getTime();
        const dateB = new Date(b).getTime();
        return dateB - dateA; // Descending order (newest first)
      });

      const allItems: VaultRecord[] = [];
      sortedDates.forEach(date => {
        const items = groups.get(date) || [];
        allItems.push(...items);
      });

      console.log(`[viewhistory] =================================`);
      console.log(`[viewhistory] FINAL RESULT: Successfully loaded ${allItems.length} total vault records across ${sortedDates.length} dates`);
      if (sortedDates.length > 0) {
        console.log(`[viewhistory] Dates found:`, sortedDates);
      }
      console.log(`[viewhistory] =================================`);
      setVaultItems(allItems);
    } catch (err) {
      console.error('[viewhistory] Failed to load vault documents:', err);
      Alert.alert('Error', 'Failed to load medical records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const unsub = auth.onAuthStateChanged(async (user: any) => {
      if (!mounted) return;
      if (!user) {
        setVaultItems([]);
        return;
      }
      await fetchAllVault(user.uid);
    });
    return () => { mounted = false; unsub(); };
  }, []);

  const fetchVaultByDate = async (date: string) => {
    const uid = getCurrentUid();
    if (!uid) {
      Alert.alert('Not signed in', 'You must be signed in to view vault documents.');
      return;
    }

    if (!date) {
      Alert.alert('Enter date', 'Please enter a date in YYYY-MM-DD format');
      return;
    }

    setLoading(true);
    setVaultItems([]);
    setPreviewBase64(null);

    try {
      // Try subcollection path first
      const docsSnap = await db.collection('Patient').doc(uid)
        .collection('health').doc('history')
        .collection('vault').doc(date)
        .collection('documents').get();

      const results: VaultRecord[] = [];

      if (!docsSnap.empty) {
        docsSnap.forEach(d => {
          const data = d.data() || {};
          results.push({
            id: d.id,
            name: data.name || data.originalName || 'Document',
            originalName: data.originalName,
            type: data.type || '',
            size: data.size || 0,
            date,
            uploadedAt: data.uploadedAt || '',
            contentBase64: data.contentBase64,
          });
        });
      } else {
        // Fallback: check nested map on user document
        const userDoc = await db.collection('Patient').doc(uid).get();
        if (userDoc.exists) {
          const data = userDoc.data() || {};
          const nested = (((data as any).health || {}).history || {}).vault || {};
          const dateNode = nested[date];
          if (dateNode && dateNode.documents) {
            const docsMap = dateNode.documents;
            Object.keys(docsMap).forEach(key => {
              const doc = docsMap[key];
              results.push({
                id: key,
                name: doc.name || doc.originalName || 'Document',
                originalName: doc.originalName,
                type: doc.type || '',
                size: doc.size || 0,
                date,
                uploadedAt: doc.uploadedAt || '',
                contentBase64: doc.contentBase64,
              });
            });
          }
        }
      }

      // Sort by uploadedAt (newest first)
      results.sort((a, b) => {
        const timeA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
        const timeB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
        return timeB - timeA;
      });

      setVaultItems(results);

      if (results.length === 0) {
        Alert.alert('No documents', `No documents found for ${formatDateForDisplay(date)}`);
      } else {
        console.log(`[viewhistory] Found ${results.length} documents for date ${date}`);
      }
    } catch (err) {
      console.error('Failed to load vault documents:', err);
      Alert.alert('Error', 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  // Full viewing handled in the vault screen; preview helper removed.



  const renderVaultItem = ({ item }: { item: VaultRecord }) => (
    <View style={styles.historyItem}>
      <View style={styles.iconContainer}>
        <FontAwesome5 name="file-medical" size={20} color="#7d4c9e" />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemDate}>{formatDateForDisplay(item.date)}</Text>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemSubtitle}>{item.type || 'Medical Record'} • {formatFileSize(item.size)}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => router.push({
            pathname: '/patientProfile/viewHistory/vault',
            params: {
              uid: getCurrentUid(),
              date: item.date,
              docId: item.id
            }
          })}
          style={{ marginRight: 12 }}
        >
          <Feather name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Group vaultItems by date into sections for SectionList - sorted by date descending (newest first)
  const sections = useMemo(() => {
    const map = new Map<string, VaultRecord[]>();

    // Group items by date
    vaultItems.forEach(item => {
      const date = item.date || 'Unknown';
      if (!map.has(date)) map.set(date, []);
      map.get(date)!.push(item);
    });

    // Build array and sort by date descending (newest first)
    const arr = Array.from(map.entries()).map(([date, items]) => {
      // Ensure items in each section are sorted by uploadedAt descending
      items.sort((a, b) => {
        const timeA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
        const timeB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
        return timeB - timeA;
      });
      return {
        title: date,
        displayDate: formatDateForDisplay(date),
        data: items
      };
    });

    // Sort sections by date descending (newest first)
    arr.sort((a, b) => {
      const dateA = new Date(a.title).getTime();
      const dateB = new Date(b.title).getTime();
      return dateB - dateA;
    });

    return arr;
  }, [vaultItems]);

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
        <Text style={styles.headerTitle}>Medical History Records</Text>
      </View>

      {/* Vault loader by date */}
      <View style={[styles.searchContainer, { marginTop: 12 }]}>
        <TextInput
          style={[styles.searchInput, { flex: 1 }]}
          placeholder="Enter date (YYYY-MM-DD)"
          placeholderTextColor="#999"
          value={dateKey}
          onChangeText={setDateKey}
        />
        <TouchableOpacity style={{ marginLeft: 8, backgroundColor: '#8B5CF6', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, justifyContent: 'center' }} onPress={() => fetchVaultByDate(dateKey)}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Load</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Document Retrieval Section */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={true}>
      {loading ? <ActivityIndicator size="large" color="#8B5CF6" style={{ marginVertical: 12 }} /> : null}

      {previewBase64 ? (
        <View style={{ padding: 12, alignItems: 'center' }}>
          <Image source={{ uri: previewBase64 }} style={{ width: 220, height: 220, borderRadius: 8 }} />
          <TouchableOpacity style={{ marginTop: 8 }} onPress={() => setPreviewBase64(null)}>
            <Text style={{ color: '#8B5CF6' }}>Close Preview</Text>
          </TouchableOpacity>
        </View>
      ) : null}


        {/* Vault Items */}
        <View style={styles.content}>
          <View style={{ paddingHorizontal: 20 }}>
            {vaultItems.length === 0 ? (
              <Text style={{ color: '#6c757d', marginVertical: 8 }}>
                {dateKey ? `No documents for ${formatDateForDisplay(dateKey)}.` : 'No documents in your medical records. Start uploading diagnosis records and lab reports.'}
              </Text>
            ) : (
              <SectionList
                sections={sections}
                keyExtractor={(item, index) => `${item.date || 'unknown'}|${item.id || index}`}
                renderItem={renderVaultItem}
                renderSectionHeader={({ section: { displayDate, title } }: any) => (
                  <View style={{ paddingVertical: 12, marginTop: 8 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#333' }}>
                      {displayDate || title}
                    </Text>
                  </View>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                scrollEnabled={false}
              />
            )}
          </View>
        </View>
      </ScrollView>
      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab="none" // Using 'none' to indicate no active tab
        onTabPress={() => { }}
      />
    </SafeAreaView>
  );
}