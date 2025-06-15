import React, { useEffect, useState, useRef } from 'react';
import {View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView, Platform,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {  useSharedValue, withSpring, useAnimatedStyle, withTiming, interpolate,} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import  styles  from './welcomeScreen.styles';

const { width, height } = Dimensions.get('window');


interface WalkthroughItem {
  id: string;
  image: any;
  title: string;
  description: string;
}

const walkthroughData: WalkthroughItem[] = [
    {
    id: '1',
    image: require('../../assets/images/walk-1.jpg'),
    title: 'Connect With Caregivers',
    description: 'Share your health information securely with your doctors and loved ones',
  },
  {
    id: '2',
    image: require('../../assets/images/walk-2.jpg'),
    title: 'Track Your Health',
    description: 'Monitor and manage your health records in one secure place',
  },
  {
    id: '3',
    image: require('../../assets/images/walk-3.jpg'),
    title: 'Secure & Private',
    description: 'Your health data is encrypted and protected with the highest security standards',
  },
];

// Change from export function to export default function
export default function WelcomeScreen() {
  const router = useRouter();
  const [showFullContent, setShowFullContent] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const logoScale = useSharedValue(1);
  const contentOpacity = useSharedValue(0);
  const scrollX = useSharedValue(0);

  const scrollViewRef = React.useRef<ScrollView>(null);

  useEffect(() => {
    const animationTimeout = Platform.OS === 'web' ? 3000 : 5000;
    
    setTimeout(() => {
      logoScale.value = withSpring(0.8);
      contentOpacity.value = withTiming(1, { duration: 1000 });
      setShowFullContent(true);
    }, animationTimeout);

 // Auto-scroll walkthrough
    const interval = setInterval(() => {
      if (scrollViewRef.current) {
        const nextSlide = (currentSlide + 1) % walkthroughData.length;
        scrollViewRef.current.scrollTo({
          x: nextSlide * width,
          animated: true,
        });
        setCurrentSlide(nextSlide);
      }
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [currentSlide]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  
  const handleLogin = () => {
    if (Platform.OS === 'web') {
      router.push({ pathname: './login' });
    } else {
      router.push('/login' as any);
    }
  };

  const handleCreateAccount = () => {
    router.push('/(auth)/signup' as any);
  };

  //console.log('Firebase Apps:', getApps());

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.floor(offset / slideSize);
    scrollX.value = offset;
    
    if (currentSlide !== currentIndex) {
      setCurrentSlide(currentIndex);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundGradient} />
      <View style={styles.backgroundOverlay} />
      
      
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <View style={styles.logoWrapper}>
          <View>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.heartIcon}
              resizeMode="contain"
            />
          </View>
          
        </View>
      </Animated.View>

      {showFullContent && (
        <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
          <View style={styles.walkthroughContainer}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              decelerationRate="fast"
              snapToInterval={width}
              snapToAlignment="center"
            >
              {walkthroughData.map((item, index) => (
                <View 
                  key={item.id} 
                  style={styles.slide}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      source={item.image}
                      style={styles.walkthroughImage}
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={styles.slideTitle}>{item.title}</Text>
                  <Text style={styles.slideDescription}>
                    {item.description}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.pagination}>
              {walkthroughData.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    currentSlide === index && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Login to Your Account</Text>
            </TouchableOpacity>

          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}