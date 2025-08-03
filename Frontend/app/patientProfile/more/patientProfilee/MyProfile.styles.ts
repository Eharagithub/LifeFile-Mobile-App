import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Header Styles - Keeping original as requested
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
    paddingBottom: 40,
  },

  // Enhanced Profile Section with Purple Theme
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    marginTop: 15,
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },

  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },

  profileImageGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  profileImagePlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8B5CF6',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },

  userEmail: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },

  healthStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF620',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  healthStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
    marginRight: 8,
  },

  healthStatusText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },

  // Section Styles with Purple Theme
  sectionHeader: {
    marginTop: 32,
    marginBottom: 16,
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },

  sectionDivider: {
    height: 3,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
    width: 40,
  },

  section: {
    marginHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  // Profile Item Styles with Icon Support
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },

  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },


  pencilEmoji: {
    fontSize: 16,
  },

  // Quick Stats Section with Purple Theme
  quickStatsContainer: {
    marginTop: 32,
    marginHorizontal: 20,
    backgroundColor: '#8B5CF610',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  quickStatsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 16,
    textAlign: 'center',
  },

  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#8B5CF6',
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },

  // Loading indicator styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#8B5CF6',
    fontSize: 16,
  },

  // Responsive adjustments for smaller screens
  ...(screenWidth < 375 && {
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },

    profileSection: {
      paddingVertical: 24,
      paddingHorizontal: 16,
      marginHorizontal: 16,
    },

    profileImageGradient: {
      width: 80,
      height: 80,
    },

    profileImage: {
      width: 76,
      height: 76,
      borderRadius: 38,
    },

    profileImagePlaceholder: {
      width: 76,
      height: 76,
      borderRadius: 38,
    },

    userName: {
      fontSize: 20,
    },

    sectionHeader: {
      paddingHorizontal: 16,
    },

    section: {
      marginHorizontal: 16,
    },

    quickStatsContainer: {
      marginHorizontal: 16,
    },

    profileItem: {
      paddingVertical: 16,
      paddingHorizontal: 16,
    },

    itemIcon: {
      width: 40,
      height: 40,
    },
  }),
});

export default styles;

