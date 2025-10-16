import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f2e6ff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius:24,
  },
  actionButton: {
    alignItems: 'center',
    width: '31%'
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
     marginBottom: 10,
  },
  articlesSection: {
      marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    marginLeft: 15,
    marginRight: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshIconButton: {
    padding: 8,
    color: '#f8f8f8'
  },
  seeAllLink: {
    fontSize: 14,
    color: '#7d4c9e',
    fontWeight: '600',
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
    marginLeft: 15,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeFilter: {
    backgroundColor: '#f8f8f8',
    borderColor: '#f8f8f8',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  articleItem: {
      flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  articleImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  articleContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#dabaf5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    color: '#242324',
    fontSize: 10,
    fontWeight: 'bold',
  },
  localBadge: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  localText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  articleTitle: {
     fontSize: 14,
    fontWeight: '600',
    color: '#222',
    lineHeight: 20,
  },
  articleDescription: {
    fontSize: 12,
    color: '#666',
      marginTop: 2,
    marginBottom: 4,
  },
  articleMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  articleMetaLeft: {
    flex: 1,
  },
  articleMeta: {
    fontSize: 11,
    color: '#888',
  },
  languageTag: {
    backgroundColor: '#foebf7',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  languageTagText: {
    fontSize: 10,
    color: '#7d4c9e',
    fontWeight: '600',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  separator: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 8,
  },
  noNewsContainer: {
      padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  noNewsText: {
       fontSize: 16,
    color: '#888',
    marginBottom: 15,
  },
  noNewsSubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    backgroundColor: '#7d4c9e',
    paddingVertical:8,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },

  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },

  doctorSpecialty: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 4,
  },

  appointmentButton: {
    marginTop: 10,
    backgroundColor: '#7d4c9e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },

  appointmentButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  }

});

export default styles;
