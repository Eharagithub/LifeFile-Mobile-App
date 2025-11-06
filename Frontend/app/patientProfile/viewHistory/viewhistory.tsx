import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  SectionList,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles from './viewhistory.styles';
import { db, auth } from '../../../config/firebaseConfig';
import BottomNavigation from '../../common/BottomNavigation';

// history item shape is defined inline where needed

export default function ViewHistory() {
  const router = useRouter();
  
  const [dateKey, setDateKey] = useState(''); // expect YYYY-MM-DD
  const [loading, setLoading] = useState(false);
  const [vaultItems, setVaultItems] = useState<any[]>([]);
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);


  const handleBack = () => {
    router.back();
  };

  const getCurrentUid = () => auth.currentUser ? auth.currentUser.uid : null;

  // Fetch all vault documents for the authenticated user across both
  // possible storage shapes. Uses the same robust pattern as labresults.tsx.
  const fetchAllVault = async (uid: string) => {
    setLoading(true);
    setVaultItems([]);
    setPreviewBase64(null);

    const groups: { date: string; items: any[] }[] = [];

    try {
      // Attempt to read vault subcollections under Patient/{uid}/health/history/vault
      try {
        const vaultRef = db.collection('Patient').doc(uid)
          .collection('health').doc('history')
          .collection('vault');

        console.debug('[viewhistory] reading vault collection at', vaultRef.path);
        const dateDocs = await vaultRef.get();

        for (const dateDoc of dateDocs.docs) {
          const dateKey = dateDoc.id;
          const docsCol = vaultRef.doc(dateKey).collection('documents');
          try {
            console.debug('[viewhistory] reading documents at', docsCol.path);
            const docsSnap = await docsCol.get();
            const items = docsSnap.docs.map((d: any) => ({ id: d.id, date: dateKey, ...(d.data() || {}) }));
            if (items.length) groups.push({ date: dateKey, items });
          } catch (e: any) {
            console.warn('[viewhistory] documents subcollection read failed for date', dateKey, e);
            if (String(e).toLowerCase().includes('permission')) {
              // permission denied reading docs for this date; skip this date and continue
              continue;
            }
          }
        }
      } catch (collectionErr: any) {
        console.warn('[viewhistory] vault subcollection read failed', collectionErr);
      }

      // If nothing found via subcollections, fallback to reading nested map on user document
      if (groups.length === 0) {
        console.debug('[viewhistory] falling back to reading nested health.history.vault from user doc');
        try {
          const userDoc = await db.collection('Patient').doc(uid).get();
          if (userDoc.exists) {
            const data = userDoc.data() || {};
            const nested = (((data as any).health || {}).history || {}).vault || {};
            Object.keys(nested).forEach(date => {
              const dateNode = nested[date];
              if (dateNode && dateNode.documents) {
                const docsMap = dateNode.documents;
                const items: any[] = [];
                Object.keys(docsMap).forEach(key => {
                  items.push({ id: key, date, ...(docsMap[key] || {}) });
                });
                if (items.length) groups.push({ date, items });
              }
            });
          }
        } catch (err) {
          console.warn('[viewhistory] nested vault read failed', err);
        }
      }

      // Flatten groups into vaultItems and sort groups and items
      groups.forEach(g => {
        g.items.sort((a, b) => {
          const ta = a.uploadedAt && a.uploadedAt.seconds ? a.uploadedAt.seconds : 0;
          const tb = b.uploadedAt && b.uploadedAt.seconds ? b.uploadedAt.seconds : 0;
          return (tb || 0) - (ta || 0);
        });
      });

      groups.sort((a, b) => {
        const da = Date.parse(a.date) || 0;
        const db2 = Date.parse(b.date) || 0;
        return (db2 || 0) - (da || 0);
      });

      // Build flat list but keep date on items
      const combined: any[] = [];
      groups.forEach(g => combined.push(...g.items));
      console.debug('[viewhistory] found vault items count:', combined.length, 'groups:', groups.length);
      // debug first few items
      console.debug('[viewhistory] sample items:', combined.slice(0, 10).map((it: any) => ({ id: it.id, date: it.date })) );
      setVaultItems(combined);
    } catch (err) {
      console.error('[viewhistory] Failed to load all vault documents:', err);
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

      const results: any[] = [];
      if (!docsSnap.empty) {
        docsSnap.forEach(d => {
          results.push({ id: d.id, date, ...(d.data() || {}) });
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
              results.push({ id: key, date, ...(docsMap[key] || {}) });
            });
          }
        }
      }

      // sort by uploadedAt (if present) or by id timestamp
      results.sort((a, b) => {
        const ta = a.uploadedAt && a.uploadedAt.seconds ? a.uploadedAt.seconds : (a.uploadedAt ? Date.parse(a.uploadedAt) / 1000 : parseInt(a.id || '0', 10));
        const tb = b.uploadedAt && b.uploadedAt.seconds ? b.uploadedAt.seconds : (b.uploadedAt ? Date.parse(b.uploadedAt) / 1000 : parseInt(b.id || '0', 10));
        return (tb || 0) - (ta || 0);
      });

      setVaultItems(results.slice(0, 20)); // show latest 20
    } catch (err) {
      console.error('Failed to load vault documents:', err);
      Alert.alert('Error', 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  // Full viewing handled in the vault screen; preview helper removed.



  const renderVaultItem = ({ item }: { item: any }) => (
    <View style={styles.historyItem}>
      <View style={styles.iconContainer}>
        <FontAwesome5 name="file-medical" size={20} color="#7d4c9e" />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemDate}>{item.date || dateKey}</Text>
        <Text style={styles.itemTitle}>{item.name || item.title || 'Document'}</Text>
        <Text style={styles.itemSubtitle}>{item.type || ''} • {item.size || ''} bytes</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.push({ pathname: '/patientProfile/viewHistory/vault', params: { uid: getCurrentUid(), date: item.date, docId: item.id } })} style={{ marginRight: 12 }}>
          <Feather name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Group vaultItems by date into sections for SectionList
  const sections = useMemo(() => {
    const map = new Map<string, any[]>();

    const getItemDateString = (item: any) => {
      if (!item) return 'Unknown';
      if (item.date && typeof item.date === 'string') return item.date;
      const uploaded = item.uploadedAt;
      if (!uploaded) return 'Unknown';
      // Firestore Timestamp-like with seconds
      if (uploaded.seconds && typeof uploaded.seconds === 'number') {
        return new Date(uploaded.seconds * 1000).toISOString().slice(0, 10);
      }
      // Timestamp-like with _seconds (some serializations)
      if (uploaded._seconds && typeof uploaded._seconds === 'number') {
        return new Date(uploaded._seconds * 1000).toISOString().slice(0, 10);
      }
      // If toDate exists and is a function
      if (typeof uploaded.toDate === 'function') {
        try {
          return uploaded.toDate().toISOString().slice(0, 10);
        } catch {
          // fallthrough
        }
      }
      // If it's an ISO string or parseable
      if (typeof uploaded === 'string') {
        const parsed = Date.parse(uploaded);
        if (!isNaN(parsed)) return new Date(parsed).toISOString().slice(0, 10);
      }
      return 'Unknown';
    };

    vaultItems.forEach(item => {
      const date = getItemDateString(item);
      if (!map.has(date)) map.set(date, []);
      map.get(date)!.push(item);
    });

    // Build array sorted by date desc
    const arr = Array.from(map.entries()).map(([date, items]) => {
      // sort items in a section by uploadedAt desc
      items.sort((a, b) => {
        const ta = a.uploadedAt && a.uploadedAt.seconds ? a.uploadedAt.seconds : 0;
        const tb = b.uploadedAt && b.uploadedAt.seconds ? b.uploadedAt.seconds : 0;
        return (tb || 0) - (ta || 0);
      });
      return { title: date, data: items };
    });

    arr.sort((a, b) => {
      const da = Date.parse(a.title) || 0;
      const db = Date.parse(b.title) || 0;
      return (db || 0) - (da || 0);
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
        <Text style={styles.headerTitle}>Medical History Time Line</Text>
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
              {dateKey ? 'No documents for selected date.' : 'No documents in your vault.'}
            </Text>
          ) : (
            <SectionList
              sections={sections}
              keyExtractor={(item, index) => `${item.date || 'unknown'}|${item.id || index}`}
              renderItem={renderVaultItem}
              renderSectionHeader={({ section: { title } }) => (
                <View style={{ paddingVertical: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#333' }}>{title}</Text>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
        </View>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab="none" // Using 'none' to indicate no active tab
        onTabPress={() => { }}
      />
    </SafeAreaView>
  );
}