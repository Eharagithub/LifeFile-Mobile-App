import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
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
            <Text style={{ color: '#6c757d', marginVertical: 8 }}>No documents for selected date.</Text>
          ) : (
            <FlatList
              data={vaultItems}
              renderItem={renderVaultItem}
              keyExtractor={item => item.id}
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