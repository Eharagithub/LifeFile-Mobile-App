import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles from './labresults.styles';
import BottomNavigation from '../../common/BottomNavigation';
import { auth, db } from '../../../config/firebaseConfig';

interface LabResult {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'high' | 'low';
}

interface LabReport {
  id: string;
  name: string;
  results: LabResult[];
  pdfUrl?: string;
  imageUrl?: string;
  type: 'pdf' | 'image';
}

interface DateGroup {
  date: string;
  reports: LabReport[];
}

export default function LabReports() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'results' | 'trends'>('results');
  const [dateKey, setDateKey] = useState(''); // for date-based load (YYYY-MM-DD)

  // live data loaded from Firestore
  const [labData, setLabData] = useState<DateGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    
    const fallbackReadFromUserDoc = async (uid: string): Promise<DateGroup[]> => {
      console.debug('[labresults] attempting fallback read from main user doc for uid:', uid);
      const groups: DateGroup[] = [];
      try {
        const userDoc = await db.collection('Patient').doc(uid).get();
        const data = userDoc.exists ? (userDoc.data() || {}) : {};
        const labsMap = ((data as any).health && (data as any).health.history && (data as any).health.history.labs) || ((data as any).health && (data as any).health.history && (data as any).health.history.lab) || null;
        if (labsMap && typeof labsMap === 'object') {
          for (const dateKey of Object.keys(labsMap)) {
            const dateNode = (labsMap as any)[dateKey];
            const documentsNode = dateNode && dateNode.documents ? dateNode.documents : dateNode; // some fallbacks may nest differently
            const reports: LabReport[] = [];
            if (documentsNode && typeof documentsNode === 'object') {
              for (const docId of Object.keys(documentsNode)) {
                const docData = documentsNode[docId];
                try {
                  reports.push(parseReportFromData(docId, docData));
                } catch (e) {
                  console.warn('[labresults] failed to parse fallback doc', docId, e);
                }
              }
            }

            let displayDate = dateKey;
            try { displayDate = new Date(dateKey).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }); } catch {}
            if (reports.length) groups.push({ date: displayDate, reports });
          }
        }

        // If nothing found in the expected path, do a deep scan for objects that resemble saved docs
        if (groups.length === 0) {
          console.debug('[labresults] no labs found under health.history.labs; performing deep scan of user document');
          const found: { path: string[]; id: string; data: any }[] = [];

          const isDocLike = (obj: any) => {
            if (!obj || typeof obj !== 'object') return false;
            // heuristics: presence of uploadedAt, originalName, contentBase64 or type
            return ('uploadedAt' in obj) || ('originalName' in obj) || ('contentBase64' in obj) || ('type' in obj && 'name' in obj);
          };

          const traverse = (node: any, path: string[]) => {
            if (!node || typeof node !== 'object') return;
            if (isDocLike(node)) {
              // derive an id from path end
              const id = path[path.length - 1] || `${Date.now()}`;
              found.push({ path: [...path], id, data: node });
              return;
            }
            for (const key of Object.keys(node)) {
              try {
                traverse(node[key], [...path, key]);
              } catch {
                // continue
              }
            }
          };

          traverse(data, []);
          console.debug('[labresults] deep scan found', found.length, 'potential docs');

          const groupsMap: Record<string, LabReport[]> = {};
          for (const f of found) {
            // try to find a date key in the path
            const dateKeyFromPath = f.path.find(p => /^\d{4}-\d{2}-\d{2}$/.test(p));
            let dateKey = dateKeyFromPath || (f.data && f.data.date) || (f.data && f.data.uploadedAt ? (new Date(f.data.uploadedAt).toISOString().slice(0, 10)) : 'unknown');
            if (!dateKey) dateKey = 'unknown';
            const parsed = parseReportFromData(f.id, f.data);
            if (!groupsMap[dateKey]) groupsMap[dateKey] = [];
            groupsMap[dateKey].push(parsed);
          }

          for (const dk of Object.keys(groupsMap)) {
            let displayDate = dk;
            try { displayDate = new Date(dk).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }); } catch {}
            groups.push({ date: displayDate, reports: groupsMap[dk] });
          }
        }
      } catch (e) {
        console.error('[labresults] fallback read failed', e);
      }
      return groups.sort((a, b) => (a.date < b.date ? 1 : -1));
    };

    const loadForUid = async (uid: string) => {
      console.debug('[labresults] loading labs for uid:', uid);
      setLoading(true);
      try {
  // Mirror the vault retrieval: only read from the Patient collection first.
  // Attempting to read Doctor collection often causes permission-denied logs in clients
  // because patients don't have access to Doctor/{uid}. Keep retrieval behavior
  // consistent with the vault reader which only reads Patient/{uid}.
  const collectionsToTry = ['Patient'];
        for (const collectionName of collectionsToTry) {
          try {
            const labsRef = db.collection(collectionName).doc(uid)
              .collection('health').doc('history')
              .collection('labs');

            console.debug('[labresults] reading labs collection at', labsRef.path);
            const dateDocs = await labsRef.get();
            const groups: DateGroup[] = [];

            for (const dateDoc of dateDocs.docs) {
              const dateKey = dateDoc.id;
              const docsCol = labsRef.doc(dateKey).collection('documents');
              try {
                console.debug('[labresults] reading documents at', docsCol.path);
                const docsSnap = await docsCol.get();
                const reports: LabReport[] = docsSnap.docs.map((d: any) => parseReportFromData(d.id, d.data() || {}));
                let displayDate = dateKey;
                try { displayDate = new Date(dateKey).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }); } catch {}
                if (reports.length) groups.push({ date: displayDate, reports });
              } catch (e: any) {
                console.warn('[labresults] documents subcollection read failed for date', dateKey, e);
                // If reading documents is permission-denied, break to try next collection
                if (String(e).toLowerCase().includes('permission')) {
                  break;
                }
              }
            }

            if (groups.length) return groups.sort((a, b) => (a.date < b.date ? 1 : -1));
            // otherwise continue to try next collection (Doctor)
          } catch (collectionErr: any) {
            console.warn('[labresults] failed reading labs for collection', collectionName, collectionErr);
            // if permission denied, try next collection
            if (String(collectionErr).toLowerCase().includes('permission')) continue;
          }
        }

        // If no groups found in any subcollection, attempt fallback read from the Patient user doc
        const fbPatient = await fallbackReadFromUserDoc(uid);
        if (fbPatient && fbPatient.length) return fbPatient;

        // nothing found
        return [] as DateGroup[];
      } catch (e: any) {
        console.error('[labresults] failed to load from subcollections', e);
        if (String(e).toLowerCase().includes('permission')) {
          // try fallback (patient doc)
          const fb = await fallbackReadFromUserDoc(uid);
          return fb;
        }
        return [] as DateGroup[];
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const unsub = auth.onAuthStateChanged(async (user: any) => {
      if (!mounted) return;
      if (!user) {
        setLabData([]);
        setLoading(false);
        return;
      }
      const groups = await loadForUid(user.uid);
      if (mounted) setLabData(groups);
    });

    return () => { mounted = false; unsub(); };
  }, []);

  const handleBack = () => {
    router.back();
  };

  // hoist parser so other helpers (like fetchLabsByDate) can reuse it
  const parseReportFromData = (id: string, data: any): LabReport => {
    const typeRaw = (data.type || '').toLowerCase();
    const rtype: 'pdf' | 'image' = typeRaw.includes('pdf') ? 'pdf' : (typeRaw.startsWith('image') ? 'image' : 'pdf');
    const base64 = data.contentBase64 || data.base64 || data.content || undefined;
    const uri = base64 ? `data:${data.type || 'application/octet-stream'};base64,${base64}` : undefined;
    return {
      id,
      name: data.name || data.originalName || 'Lab Report',
      results: Array.isArray(data.results) && data.results.length ? data.results : [{ name: data.name || 'Report', value: 0, unit: '', status: 'normal' }],
      pdfUrl: rtype === 'pdf' ? uri : undefined,
      imageUrl: rtype === 'image' ? uri : undefined,
      type: rtype,
    } as LabReport;
  };

  const getCurrentUid = () => auth.currentUser ? auth.currentUser.uid : null;

  const fetchLabsByDate = async (date: string) => {
    const uid = getCurrentUid();
    if (!uid) {
      Alert.alert('Not signed in', 'You must be signed in to view lab reports.');
      return;
    }

    if (!date) {
      Alert.alert('Enter date', 'Please enter a date in YYYY-MM-DD format');
      return;
    }

    setLoading(true);
    try {
      // Try subcollection path first
      const docsSnap = await db.collection('Patient').doc(uid)
        .collection('health').doc('history')
        .collection('labs').doc(date)
        .collection('documents').get();

      const reports: LabReport[] = [];
      if (!docsSnap.empty) {
        docsSnap.forEach(d => {
          reports.push(parseReportFromData(d.id, d.data() || {}));
        });
      } else {
        // Fallback nested map
        const userDoc = await db.collection('Patient').doc(uid).get();
        if (userDoc.exists) {
          const data = userDoc.data() || {};
          const labsMap = ((data as any).health || {}).history ? (((data as any).health || {}).history.labs || ((data as any).health || {}).history.lab) : null;
          const dateNode = labsMap && labsMap[date] ? labsMap[date] : null;
          const documentsNode = dateNode && dateNode.documents ? dateNode.documents : dateNode;
          if (documentsNode && typeof documentsNode === 'object') {
            for (const docId of Object.keys(documentsNode)) {
              try {
                reports.push(parseReportFromData(docId, documentsNode[docId]));
              } catch (e) {
                console.warn('[labresults] parse fallback doc failed', docId, e);
              }
            }
          }
        }
      }

      const displayDate = (() => {
        try { return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }); } catch { return date; }
      })();

      const groups: DateGroup[] = [];
      if (reports.length) groups.push({ date: displayDate, reports });
      setLabData(groups);
    } catch (e) {
      console.error('[labresults] failed to load labs by date', e);
      Alert.alert('Error', 'Failed to load lab reports for the selected date.');
    } finally {
      setLoading(false);
    }
  };

  const handleLabReportPress = (report: LabReport) => {
    // Navigate to detailed lab report view
    router.push({
      pathname: '/patientProfile/labReports/detailedResult',
      params: {
        reportId: report.id,
        reportName: report.name,
        reportType: report.type,
        reportUrl: report.pdfUrl || report.imageUrl,
        results: JSON.stringify(report.results)
      }
    });
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

  const renderLabReportItem = (report: LabReport) => (
    <TouchableOpacity
      key={report.id}
      style={styles.labReportContainer}
      onPress={() => handleLabReportPress(report)}
      activeOpacity={0.7}
    >
      {/* PDF/Image Preview */}
      <View style={styles.previewContainer}>
        {report.type === 'pdf' ? (
          <View style={styles.pdfPreview}>
            <MaterialIcons name="picture-as-pdf" size={24} color="#ef4444" />
            <Text style={styles.pdfText}>PDF</Text>
          </View>
        ) : (
          <View style={styles.imagePreview}>
            <MaterialIcons name="image" size={24} color="#6366f1" />
            <Text style={styles.imageText}>IMG</Text>
          </View>
        )}
      </View>

      {/* Report Details */}
      <View style={styles.reportDetails}>
        <Text style={styles.reportName}>{report.name}</Text>
        {report.results.map((result, index) => (
          <View key={index} style={styles.resultRow}>
            <Text style={styles.resultValue}>
              {result.value} {result.unit}
            </Text>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: getStatusBackgroundColor(result.status) }
            ]}>
              <View style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(result.status) }
              ]} />
            </View>
          </View>
        )
        )}
      </View>
    </TouchableOpacity>
  );

  const renderDateGroup = ({ item }: { item: DateGroup }) => (
    <View style={styles.dateGroupContainer}>
      <Text style={styles.dateHeader}>{item.date}</Text>
      <View style={styles.reportsContainer}>
        {item.reports.map(report => renderLabReportItem(report))}
      </View>
    </View>
  );

  const renderHealthTrends = () => (
    <View style={styles.trendsContainer}>
      <Text style={styles.trendsPlaceholder}>
        Health trends visualization will be displayed here
      </Text>
    </View>
  );

  // No free-text filtering here — the date loader replaces the old search bar (matching viewhistory.tsx)

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      ) : null}
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Feather name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lab Reports</Text>
      </View>

      {/* Date loader (like viewhistory) */}
      <View style={{ paddingHorizontal: -10 }}>
        <View style={[styles.searchContainer, { marginTop: 8 }]}>
          <TextInput
            style={[styles.searchInput, { flex: 1 }]}
            placeholder="Enter date (YYYY-MM-DD)"
            placeholderTextColor="#999"
            value={dateKey}
            onChangeText={setDateKey}
          />
          <TouchableOpacity style={{ marginLeft: 8, backgroundColor: '#8B5CF6', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, justifyContent: 'center' }} onPress={() => fetchLabsByDate(dateKey)}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Load</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'results' && styles.activeTab]}
          onPress={() => setActiveTab('results')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'results' && styles.activeTabText
          ]}>
            Lab Results
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trends' && styles.activeTab]}
          onPress={() => setActiveTab('trends')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'trends' && styles.activeTabText
          ]}>
            Health Trends
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'results' ? (
          <FlatList
            data={labData}
            renderItem={renderDateGroup}
            keyExtractor={item => item.date}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderHealthTrends()
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab="none" // Using 'none' to indicate no active tab
        onTabPress={() => { }}
      />
    </SafeAreaView>
  );
}