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
  uploadedAt?: string;
  dateFolder?: string;
}

interface DateGroup {
  date: string;
  originalDate: string;
  reports: LabReport[];
}

export default function LabReports() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'results' | 'trends'>('results');
  const [dateKey, setDateKey] = useState('');
  const [labData, setLabData] = useState<DateGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [navigating, setNavigating] = useState<string | null>(null);

  useEffect(() => {
    loadAllLabReports();
  }, []);

  const loadAllLabReports = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.debug('[labresults] Loading all lab reports from subcollections for user:', user.uid);
      
      const dateGroups = await fetchAllDateGroups(user.uid);
      setLabData(dateGroups);
      
    } catch (error) {
      console.error('[labresults] Failed to load lab reports:', error);
      Alert.alert('Error', 'Failed to load lab reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDateGroups = async (uid: string): Promise<DateGroup[]> => {
    const dateGroups: DateGroup[] = [];
    
    try {
      const labsRef = db.collection('Patient').doc(uid)
        .collection('health').doc('history')
        .collection('labs');

      const dateDocs = await labsRef.get();
      console.debug(`[labresults] Found ${dateDocs.size} date folders`);
      
      // Process each date folder sequentially to avoid overwhelming Firebase
      for (const dateDoc of dateDocs.docs) {
        const dateKey = dateDoc.id;
        console.debug(`[labresults] Processing date folder: ${dateKey}`);
        
        try {
          const docsCol = labsRef.doc(dateKey).collection('documents');
          const docsSnap = await docsCol.get();
          console.debug(`[labresults] Found ${docsSnap.size} documents for date ${dateKey}`);
          
          if (!docsSnap.empty) {
            const reports: LabReport[] = [];
            docsSnap.forEach(doc => {
              const report = parseReportFromData(doc.id, doc.data(), dateKey);
              reports.push(report);
            });
            
            const displayDate = formatDisplayDate(dateKey);
            dateGroups.push({
              date: displayDate,
              originalDate: dateKey,
              reports: reports
            });
          }
        } catch (docError) {
          console.warn(`[labresults] Error reading documents for date ${dateKey}:`, docError);
        }
      }
      
      // Sort by date (newest first)
      dateGroups.sort((a, b) => b.originalDate.localeCompare(a.originalDate));
      console.debug(`[labresults] Final groups:`, dateGroups.map(g => ({ date: g.originalDate, count: g.reports.length })));
      
    } catch (error) {
      console.error('[labresults] Subcollection fetch failed:', error);
      throw error;
    }
    
    return dateGroups;
  };

  const formatDisplayDate = (dateString: string): string => {
    if (dateString === 'Unknown Date') return dateString;
    
    try {
      return new Date(dateString).toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const parseReportFromData = (id: string, data: any, dateFolder: string): LabReport => {
    const typeRaw = (data.type || '').toLowerCase();
    const rtype: 'pdf' | 'image' = typeRaw.includes('pdf') ? 'pdf' : 
                                  (typeRaw.startsWith('image') ? 'image' : 'pdf');
    const base64 = data.contentBase64 || data.base64 || data.content;
    const uri = base64 ? `data:${data.type || 'application/octet-stream'};base64,${base64}` : undefined;
    
    return {
      id,
      name: data.name || data.originalName || 'Lab Report',
      results: Array.isArray(data.results) && data.results.length ? 
               data.results : 
               [{ name: data.name || 'Report', value: 0, unit: '', status: 'normal' }],
      pdfUrl: rtype === 'pdf' ? uri : undefined,
      imageUrl: rtype === 'image' ? uri : undefined,
      type: rtype,
      uploadedAt: data.uploadedAt || data.createdAt || data.date,
      dateFolder: dateFolder
    };
  };

  const handleBack = () => {
    router.back();
  };

  const fetchLabsByDate = async (date: string) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Not signed in', 'You must be signed in to view lab reports.');
      return;
    }

    if (!date) {
      Alert.alert('Enter date', 'Please enter a date in YYYY-MM-DD format');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('Invalid Format', 'Please use YYYY-MM-DD format');
      return;
    }

    setLoading(true);
    try {
      const reports: LabReport[] = [];
      
      const docsSnap = await db.collection('Patient').doc(user.uid)
        .collection('health').doc('history')
        .collection('labs').doc(date)
        .collection('documents').get();

      if (!docsSnap.empty) {
        docsSnap.forEach(doc => {
          reports.push(parseReportFromData(doc.id, doc.data(), date));
        });
        
        const displayDate = formatDisplayDate(date);
        const groups: DateGroup[] = [{ 
          date: displayDate, 
          originalDate: date,
          reports 
        }];
        setLabData(groups);
        console.debug(`[labresults] Loaded ${reports.length} reports for date ${date}`);
      } else {
        Alert.alert('No Reports', `No lab reports found for ${formatDisplayDate(date)}`);
        loadAllLabReports(); // Go back to showing all reports
      }
    } catch (e) {
      console.error('Failed to load labs by date', e);
      Alert.alert('Error', 'Failed to load lab reports for the selected date.');
      loadAllLabReports(); // Go back to showing all reports on error
    } finally {
      setLoading(false);
    }
  };

  const handleLabReportPress = (report: LabReport) => {
    if (navigating) return;
    
    setNavigating(report.id);
    console.log(`[labresults] Navigating to detailed view for report: ${report.id} from date: ${report.dateFolder}`);

    router.push({
      pathname: '/patientProfile/labReports/detailedResult',
      params: {
        reportId: report.id,
        reportName: report.name,
        reportType: report.type,
        reportUrl: report.pdfUrl || report.imageUrl,
        results: JSON.stringify(report.results || [])
      }
    });

    setTimeout(() => setNavigating(null), 1000);
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
      style={[
        styles.labReportContainer,
        navigating === report.id && { opacity: 0.7 }
      ]}
      onPress={() => handleLabReportPress(report)}
      activeOpacity={0.7}
      disabled={navigating !== null}
    >
      {navigating === report.id && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
          borderRadius: 12
        }}>
          <ActivityIndicator size="small" color="#8B5CF6" />
        </View>
      )}

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
        ))}
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Feather name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lab Reports</Text>
      </View>

      {/* Date Search */}
      <View style={{ paddingHorizontal: 16 }}>
        <View style={[styles.searchContainer, { marginTop: 8 }]}>
          <TextInput
            style={[styles.searchInput, { flex: 1 }]}
            placeholder="Enter date (YYYY-MM-DD)"
            placeholderTextColor="#999"
            value={dateKey}
            onChangeText={setDateKey}
          />
          <TouchableOpacity 
            style={{ 
              marginLeft: 8, 
              backgroundColor: '#8B5CF6', 
              paddingHorizontal: 14, 
              paddingVertical: 10, 
              borderRadius: 8, 
              justifyContent: 'center' 
            }} 
            onPress={() => fetchLabsByDate(dateKey)}
          >
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
        {loading ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={{ marginTop: 10, color: '#666' }}>Loading lab reports...</Text>
          </View>
        ) : activeTab === 'results' ? (
          labData.length > 0 ? (
            <FlatList
              data={labData}
              renderItem={renderDateGroup}
              keyExtractor={item => item.originalDate}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#666', textAlign: 'center' }}>
                No lab reports found.{'\n'}Your reports will appear here once they are available.
              </Text>
            </View>
          )
        ) : (
          renderHealthTrends()
        )}
      </ScrollView>

      <BottomNavigation
        activeTab="none"
        onTabPress={() => { }}
      />
    </SafeAreaView>
  );
}