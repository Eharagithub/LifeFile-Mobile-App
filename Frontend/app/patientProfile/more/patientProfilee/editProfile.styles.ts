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
   // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Account for bottom navigation
  },

  req: {
    color: '#e24d4d',
    fontWeight: 'bold',
    fontSize: 13,
  },

  // Profile Image Styles
   profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 14,
  },
  profileAvatar: {
    width: 130,
    height: 130,
    borderRadius: 65, 
    backgroundColor: '#f6f6f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    borderWidth: 1,
    borderColor: '#e4e4e4',
  },
  profileIcon: {
    color: '#bdbdbd',
  },
  profileTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  profileLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: '600',
    marginBottom: 2,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
   chooseFileBtn: {
    backgroundColor: '#e9e7ea',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  chooseFileText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 13,
  },
  fileName: {
    color: '#bdbdbd',
    fontSize: 13,
  },

    // Year picker modal styles
  datePickerModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)'
    fontSize: 15,
    color: '#222',
    backgroundColor: 'transparent',
  },
  datePickerContainer: {
    width: '80%',
    height: '20%',
    backgroundColor: '#f6f9f6',
    borderColor: '#e9d6f7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#bdbdbd',
    marginBottom: 15,
  },
  yearPickerContainer: {
    width: '100%',
    height: 50,
    marginBottom: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  yearItem: {
    padding: 10,
    alignItems: 'center',
  },
  yearText: {
    fontSize: 20,
    color: '#333',
  },
  selectedYearText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8A6FD0',
  },
   datePickerButton: {
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  datePickerButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  confirmButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: '#7d4c9e',
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: '#7d4c9e',
    fontWeight: 'bold',
  },

  // Input Styles
  inputLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: 2,
  },
   inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f9f6',
    borderColor: '#e4e4e4',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 14,
    paddingHorizontal: 10,
    height: 44,
  },
    inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    height: 44,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },

  //Buttons
   buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 12,
    gap: 16,
  },
   cancelBtn: {
    flex: 1,
    backgroundColor: '#e9e7ea',
    borderRadius: 22,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelBtnText: {
    color: '#7d4c9e',
    fontWeight: 'bold',
    fontSize: 16,
  },

   submitBtn: {
    flex: 1,
    backgroundColor: '#7d4c9e',
    borderRadius: 22,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },


  });

export default styles;