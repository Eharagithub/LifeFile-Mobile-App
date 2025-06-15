import { View, Text, Image, StyleSheet, Dimensions, ImageSourcePropType, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Update these paths to your actual asset locations
const pillsImg: ImageSourcePropType = require('../../assets/images/pills.png');
const stethoscopeImg: ImageSourcePropType = require('../../assets/images/st.png');
const bandageImg: ImageSourcePropType = require('../../assets/images/bandage.png');
const logoImg: ImageSourcePropType = require('../../assets/images/logo.png');
// const injection: ImageSourcePropType = require('../../assets/images/injection.png');
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
      };  return (
        <TouchableOpacity 
      style={styles.container} 
      activeOpacity={1}
      onPress={handleSkip}>
     
      <Image source={pillsImg} style={styles.pills} resizeMode="contain" />
      
      <Image source={stethoscopeImg} style={styles.stethoscope} resizeMode="contain" />
      
      <Image source={bandageImg} style={styles.bandage} resizeMode="contain" />
      
      {/* <Image source={injection} style={styles.injection} resizeMode="contain" /> */}

      <Image source={plaster} style={styles.plaster} resizeMode="contain" /> 

       <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
     
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
  injection: {
    position: 'absolute',
    top: 370,
    right: -5,
    width: 250,
    height: 250,
    opacity: 0.3,
    transform: [{ rotate: '-15deg' }], // Add this line to rotate the image 45 degrees
  },
  plaster: {
    position: 'absolute',
    top: 10,
    right: -50,
    width: 200,
    height: 100,
    opacity: 0.3,
    transform: [{ rotate: '5deg' }], // Add this line to rotate the image -45 degrees
  },
 
});

export default Landingpage;




