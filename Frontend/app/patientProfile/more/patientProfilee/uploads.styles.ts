import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export const styles = StyleSheet.create({
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

  // Content Styles
  scrollView: {
    flex: 1,
  },

  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  // File Upload Section Styles
  fileUploadSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },

  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  sectionContent: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },

  sectionDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
    lineHeight: 20,
  },

  fileUploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  fileUploadButton: {
    backgroundColor: '#6c757d',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },

  fileUploadButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },

  fileStatus: {
    fontSize: 14,
    color: '#6c757d',
    flex: 1,
    flexWrap: 'wrap',
  },

  // Navigation Item Styles
  navigationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },

  navigationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  navigationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },

  // Responsive adjustments for smaller screens
  ...(screenWidth < 375 && {
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },

    contentContainer: {
      padding: 16,
    },

    fileUploadSection: {
      padding: 16,
    },

    navigationItem: {
      padding: 16,
    },

    sectionIcon: {
      width: 40,
      height: 40,
    },

    navigationIcon: {
      width: 40,
      height: 40,
    },

    sectionTitle: {
      fontSize: 15,
    },

    navigationTitle: {
      fontSize: 15,
    },
  }),
});

