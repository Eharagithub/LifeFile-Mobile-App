import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions, 
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import BottomNavigation from '../common/BottomNavigation';

interface LabResult {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'high' | 'low';
}

export default function DetailedLab() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // Parse parameters from navigation
  const reportId = params.reportId as string;
  const reportName = params.reportName as string;
  const reportType = params.reportType as 'pdf' | 'image';
  const reportUrl = params.reportUrl as string;
  const results = params.results ? JSON.parse(params.results as string) as LabResult[] : [];

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
        <Text style={styles.headerTitle}>Detailed Lab view</Text>
      </View>

      {/* Main Content Area */}
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

          {/* Content Area - Clean empty space for PDF/Image display */}
          <View style={styles.contentArea}>
            {/* This area will display the PDF or image when implemented */}
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
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');

import { StyleSheet } from 'react-native';

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
    padding: 32,
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