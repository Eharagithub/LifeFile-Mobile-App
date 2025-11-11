import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
   header: {
    backgroundColor: '#f2e6ff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal:35,
    
  },
  
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  
  profileImage: {
    width: 60,
    height: 60,
    borderRadius:25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#f8f8f8',
  },
  
  welcomeText: {
    flex: 1,
  },
  
  welcomeTitle: {
    fontSize: 16,
    color: '#444',
    fontWeight: '500',
  },
  
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  
  welcomeSubtitle: {
    fontSize: 14,
    color: '#777',
    fontWeight: '400',
  },

  // Content styles
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
   
  },

  // Quick Actions styles
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    
    backgroundColor: '#f2e6ff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius:24,
  },
  
  actionButton: {
    alignItems: 'center',
    width: '31%',
  },
  
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7d4c9e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  
  actionText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
  },
    statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

// Consultations Section styles
  consultationsSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -5,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#8B52A8',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },


  consultationsList: {
    flex: 1,
  },
  consultationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  consultationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  consultationInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  appointmentDate: {
    fontSize: 12,
    color: '#999',
  },
  bookmarkButton: {
    padding: 5,
  },

  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  navText: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 4,
    fontWeight: '500',
  },
  navTextActive: {
    color: '#8B52A8',
  },
});

export default styles;