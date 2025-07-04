import { StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export default StyleSheet.create({
  // Modal Overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  
  overlayBackground: {
    flex: 1,
  },
  
  // Drawer Container
  drawerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.85,
    minHeight: height * 0.60,
  },
  
  safeArea: {
    flex: 1,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start', 
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12, 
    marginBottom: -25, 
  },
  
  logoContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 0, 
  },
  
  logoImage: {
    width: 180,
    height: 140,
    //resizeMode: 'contain',
  },
  
  closeButton: {
    padding: 5,
    marginTop: 15, // Added top margin to position close button higher
    position: 'absolute',
    right: 15,
    top: 10,
  },
  
  headerDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 20,
    marginTop: -30, // Changed to negative margin to move it up
  },
  
  // Navigation Container
  navigationContainer: {
    flex: 1,
    paddingTop: 10,
  },
  
  // Navigation Item Styles
  navigationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
    color: '#f0f0ff',
  },
  
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    color: '#f0f0ff'
  },
  
  iconContainer: {
    width: 35,
    height: 35,
    // borderRadius: 8,
    // backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  
  itemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  
  // Logout Item Styles
  logoutItem: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  
  logoutIconContainer: {
    backgroundColor: '#f0f0ff',
  },
  
  logoutText: {
    color: '#7d4c9e',
    fontWeight: '600',
  },
  
  // Hover/Active States (for better UX)
  navigationItemActive: {
    backgroundColor: '#f8f8ff',
  },
  
  activeItemText: {
    color: '#7d4c9e',
  },
  
  activeIconContainer: {
    backgroundColor: '#7d4c9e',
  },
});