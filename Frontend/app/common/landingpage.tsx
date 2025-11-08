import { View, Image, StyleSheet, Dimensions, ImageSourcePropType, TouchableOpacity, Text } from 'react-native';
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

const { height, width } = Dimensions.get('window');

// Update these paths to your actual asset locations
const pillsImg: ImageSourcePropType = require('../../assets/images/pills.png');
const stethoscopeImg: ImageSourcePropType = require('../../assets/images/st.png');
const bandageImg: ImageSourcePropType = require('../../assets/images/bandage.png');
const plaster: ImageSourcePropType = require('../../assets/images/plaster.png');

const Landingpage: React.FC = () => {
  const router = useRouter();
  useEffect(() => {
    // Auto-navigate to welcome screen after 3 seconds
    const timer = setTimeout(() => {
      router.push('/common/welcomeScreen');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleSkip = () => {
    // Navigate immediately if user taps anywhere
    router.push('/common/welcomeScreen');
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={handleSkip}>

      <Image source={pillsImg} style={styles.pills} resizeMode="contain" />
      <Image source={stethoscopeImg} style={styles.stethoscope} resizeMode="contain" />
      <Image source={bandageImg} style={styles.bandage} resizeMode="contain" />
      <Image source={plaster} style={styles.plaster} resizeMode="contain" />

      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Powered by footer - Industry standard placement */}
      <View style={styles.poweredByContainer}>
        <Text style={styles.poweredByText}>Powered by</Text>
        <Text style={styles.companyName}>Agentic Ensemble AI</Text>
      </View>

    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9d6f7', // Light purple
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.18,
  },
  logo: {
    width: 470,
    height: 470,
    marginBottom: 10,
  },
  pills: {
    position: 'absolute',
    top: 30,
    left: 5,
    width: 200,
    height: 200,
    opacity: 0.3,
  },
  stethoscope: {
    position: 'absolute',
    bottom: -100,
    right: -200,
    width: 520,
    height: 520,
    opacity: 0.4,
    transform: [{ rotate: '-35deg' }],
  },
  bandage: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    width: 150,
    height: 75,
    opacity: 0.3,
  },
  plaster: {
    position: 'absolute',
    top: 10,
    right: -50,
    width: 200,
    height: 100,
    opacity: 0.3,
    transform: [{ rotate: '5deg' }],
  },
  poweredByContainer: {
    position: 'absolute',
    bottom: 30, // Standard spacing from bottom
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    //backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white background
    paddingHorizontal: 16,
    paddingVertical: 8,
     elevation: 3, // For Android shadow
  },
  poweredByText: {
    fontSize: 12,
    color: '#666', // Subtle gray color
    fontWeight: '400',
    marginBottom: 2,
  },
  companyName: {
    fontSize: 14,
    color: '#460404ff', // Darker color for company name
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default Landingpage;