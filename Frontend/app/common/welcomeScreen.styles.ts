import { Dimensions, StyleSheet, Platform } from 'react-native';


const { width, height } = Dimensions.get('window');

const COLORS = {
    primary: '#6B4EAE', // Deep purple
    secondary: '#8A6FD0', // Medium purple
    accent: '#A594E0', // Light purple
    background: '#e9d6f7', // Very light purple
    text: '#2D1B69', // Dark purple
    white: '#FFFFFF',
    gray: '#6B7280',
  };


  
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    backgroundGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: height,
      backgroundColor: COLORS.background,
      opacity: 0.9,
    },
    backgroundOverlay: {
      position: 'absolute',
      top: height * 0.6,
      left: 0,
      right: 0,
      height: height * 0.8,
      backgroundColor: COLORS.white,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      shadowColor: COLORS.primary,
      shadowOffset: {
        width: 0,
        height: -3,
      },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 5,
    },
  
    logoContainer: {
      flex: 2,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      top: 3,
      left: 0,
      right: 0,
      bottom: height * 0.4,
    },
    logoWrapper: {
      alignItems: 'center',
    },
  
    heartIcon: {
      width: 460,
      height: 460,
      marginBottom: 10,
      tintColor: COLORS.primary,
    },
   
    contentContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingBottom: 20,
    },
    walkthroughContainer: {
      height: height * 0.45,
      alignItems: 'center',
    },
    slide: {
      width: width,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    imageContainer: {
      width: width * 0.85,
      height: height * 0.3,
      backgroundColor: COLORS.white,
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: COLORS.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    walkthroughImage: {
      width: '100%',
      height: '100%',
      borderRadius: 20,
    },
    slideTitle: {
      fontSize: 24,
      fontWeight: '600',
      color: COLORS.text,
      marginTop: 20,
      marginBottom: 8,
      textAlign: 'center',
    },
    slideDescription: {
      fontSize: 14,
      textAlign: 'center',
      color: COLORS.gray,
      paddingHorizontal: 20,
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: COLORS.accent,
      marginHorizontal: 4,
      opacity: 0.5,
    },
    paginationDotActive: {
      width: 24,
      height: 8,
      borderRadius: 4,
      backgroundColor: COLORS.primary,
      opacity: 1,
    },
    buttonContainer: {
      padding: 20,
      backgroundColor: COLORS.white,
    },
    loginButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: 16,
      borderRadius: 30,
      alignItems: 'center',
      marginBottom: 12,
      shadowColor: COLORS.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    loginButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: '600',
    },
    createAccountButton: {
      backgroundColor: COLORS.white,
      paddingVertical: 16,
      borderRadius: 30,
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: COLORS.primary,
    },
    createAccountButtonText: {
      color: COLORS.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    termsText: {
      textAlign: 'center',
      color: COLORS.gray,
      fontSize: 12,
    },
    linkText: {
      color: COLORS.primary,
      textDecorationLine: 'underline',
    },
    phoneFrame: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 25,
      borderWidth: 12,
      borderColor: '#E1E8ED',
      overflow: 'hidden',
      backgroundColor: '#F8FAFC',
    },
  }); 
  export default styles;