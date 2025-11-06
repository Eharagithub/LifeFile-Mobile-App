import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  
  // Search Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  
  searchIcon: {
    position: 'absolute',
    left: 36,
    zIndex: 1,
  },
  
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingLeft: 48,
    fontSize: 14,
    backgroundColor: '#f9fafb',
    color: '#333',
  },
  
  // Tabs Styles
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 20,
  },
  
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  
  activeTab: {
    borderBottomColor: '#6366f1',
  },
  
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  
  activeTabText: {
    color: '#6366f1',
  },
  
  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Account for bottom navigation
  },
  
  // Date Group Styles
  dateGroupContainer: {
    marginBottom: 24,
  },
  
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  
  reportsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },

  
  
  // Lab Report Item Styles
  labReportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 8,
    backgroundColor: '#fafbfc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  
  previewContainer: {
    width: 50,
    height: 50,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  pdfPreview: {
    width: 50,
    height: 50,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  
  imagePreview: {
    width: 50,
    height: 50,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  
  pdfText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#ef4444',
    marginTop: 2,
  },
  
  imageText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#6366f1',
    marginTop: 2,
  },
  
  reportDetails: {
    flex: 1,
  },
  
  reportName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  resultValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  // Health Trends Styles
  trendsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  
  trendsPlaceholder: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default styles;