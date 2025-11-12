import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
  Image
} from 'react-native';
import {
  Feather,
  FontAwesome5,
  MaterialIcons,
  AntDesign,
  Ionicons
} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '../../config/firebaseConfig';
import { signOut } from 'firebase/auth';
import styles from './sideNavigation.styles';
 
import AuthService from '../../services/authService';

interface SideNavigationProps {
  isVisible: boolean;
  onClose: () => void;
}

interface NavigationItem {
  id: string;
  title: string;
  icon: string;
  iconLibrary: 'Feather' | 'FontAwesome5' | 'MaterialIcons' | 'AntDesign' | 'Ionicons';
  route?: string;
  action?: () => void;
  isLogout?: boolean;
}

export default function SideNavigation({
  isVisible,
  onClose
}: SideNavigationProps) {
  const router = useRouter();
  const [isDoctor, setIsDoctor] = useState<boolean>(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);

      // Trigger global event if available
      if (global.EventEmitter) {
        console.log("SideNav: Emitting USER_CHANGED event for sign out");
        global.EventEmitter.emit('USER_CHANGED');
      }

      onClose();
      router.replace('../../../common/welcomeScreen');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Sign Out Error', 'Failed to sign out. Please try again.');
    }
  };
  const navigationItems: NavigationItem[] = [
    {
      id: '1',
      title: 'Home',
      icon: 'home',
      iconLibrary: 'Feather',
      route: '../../../patientProfile/patientHome'
    },
    {
      id: '2',
      title: 'Find  a Doctor',
      icon: 'search',
      iconLibrary: 'Feather',
      route: '../../../patientProfile/more/doctorSearch/doctorSearch'
    },
    {
      id: '3',
      title: 'Uploads',
      icon: 'upload',
      iconLibrary: 'Feather',
      route: '../../../patientProfile/more/patientProfilee/uploads'
    },
    {
      id: '4',
      title: 'Wellness Hub',
      icon: 'heart',
      iconLibrary: 'AntDesign',
      route: '../../../patientProfile/more/patientProfilee/healthtips'
    },
    {
      id: '5',
      title: 'Profile',
      icon: 'user',
      iconLibrary: 'Feather',
      route: '../../../patientProfile/more/patientProfilee/profilePage'
    },
   
    {
      id: '8',
      title: 'Logout',
      icon: 'log-out',
      iconLibrary: 'Feather',
      action: handleSignOut,
      isLogout: true
    }
  ];

  // Doctor-specific reduced menu
  const doctorNavigationItems: NavigationItem[] = [
    {
      id: '1',
      title: 'Home',
      icon: 'home',
      iconLibrary: 'Feather',
      route: '/doctorProfile/doctorHome'
    },
    {
      id: '2',
      title: 'Profile',
      icon: 'user',
      iconLibrary: 'Feather',
      route: '/auth/Auth/createDocProfile'
    },
    {
      id: '8',
      title: 'Logout',
      icon: 'log-out',
      iconLibrary: 'Feather',
      action: handleSignOut,
      isLogout: true
    }
  ];

  useEffect(() => {
    const checkRole = async () => {
      try {
        const user = auth.currentUser;
        if (!user || !user.uid) return;
        const roles = await AuthService.determineRoles(user.uid);
        if (roles && roles.isDoctor) setIsDoctor(true);
        else setIsDoctor(false);
      } catch (err) {
        console.warn('Failed to determine roles for side nav:', err);
        setIsDoctor(false);
      }
    };
    checkRole();
    // also listen for global user change events if available
    if (global.EventEmitter) {
      const handler = () => checkRole();
      global.EventEmitter.on('USER_CHANGED', handler);
      return () => global.EventEmitter.off('USER_CHANGED', handler);
    }
  }, []);

  const handleItemPress = (item: NavigationItem) => {
    if (item.action) {
      item.action();
    } else if (item.route) {
      onClose();
      router.push(item.route as any);
    }
  };

  const renderIcon = (item: NavigationItem) => {
    const iconProps = {
      size: 20,
      color: item.isLogout ? '#7d4c9e' : '#666'
    };

    switch (item.iconLibrary) {
      case 'Feather':
        return <Feather name={item.icon as React.ComponentProps<typeof Feather>['name']} {...iconProps} />;
      case 'FontAwesome5':
        return <FontAwesome5 name={item.icon as React.ComponentProps<typeof FontAwesome5>['name']} {...iconProps} />;
      case 'MaterialIcons':
        return <MaterialIcons name={item.icon as React.ComponentProps<typeof MaterialIcons>['name']} {...iconProps} />;
      case 'AntDesign':
        return <AntDesign name={item.icon as React.ComponentProps<typeof AntDesign>['name']} {...iconProps} />;
      case 'Ionicons':
        return <Ionicons name={item.icon as React.ComponentProps<typeof Ionicons>['name']} {...iconProps} />;
      default:
        return <Feather name={item.icon as React.ComponentProps<typeof Feather>['name']} {...iconProps} />;
    }
  };

  const renderNavigationItem = (item: NavigationItem) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.navigationItem,
        item.isLogout && styles.logoutItem
      ]}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.itemContent}>
        <View style={[
          styles.iconContainer,
          item.isLogout && styles.logoutIconContainer
        ]}>
          {renderIcon(item)}
        </View>
        <Text style={[
          styles.itemText,
          item.isLogout && styles.logoutText
        ]}>
          {item.title}
        </Text>
      </View>
      <Feather
        name="chevron-right"
        size={16}
        color={item.isLogout ? '#7d4c9e' : '#ccc'}
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayBackground}
          onPress={onClose}
          activeOpacity={1}
        />

        <View style={styles.drawerContainer}>
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/images/logo.png')}
                  style={styles.logoImage}
                />
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Feather name="chevron-down" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.headerDivider} />

            {/* Navigation Items */}
            <ScrollView
              style={styles.navigationContainer}
              showsVerticalScrollIndicator={false}
            >
              {(isDoctor ? doctorNavigationItems : navigationItems).map(renderNavigationItem)}
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}