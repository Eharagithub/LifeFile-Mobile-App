import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '../../config/firebaseConfig';
import AuthService from '../../services/authService';
import SideNavigationDrawer from './sideNavigation';

interface BottomNavigationProps {
  activeTab: 'home' | 'notification' | 'Chat' | 'more' | 'none';
  onTabPress?: (tabName: string) => void;
}


export default function BottomNavigation({
  activeTab,
  onTabPress = () => { }
}: BottomNavigationProps) {
  const router = useRouter();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isDoctor, setIsDoctor] = useState<boolean>(false);

  // Only highlight tab if on these pages
  const highlightTabs = ['home', 'notification', 'Chat', 'more'];
  const shouldHighlight = highlightTabs.includes(activeTab);

  const handleTabPress = (tabName: string) => {
    onTabPress(tabName);
    switch (tabName) {
      case 'home':
        if (isDoctor) router.push('/doctorProfile/doctorHome');
        else router.push('../../../patientProfile/patientHome');
        break;

      case 'notification':
        if (isDoctor) router.push('/doctorProfile/docnotification');
        else router.push('../../../patientProfile/notification');
        break;

      // accept both 'chat' and legacy 'ChatMyProfile'
      case 'chat':
      case 'ChatMyProfile':
        if (isDoctor) router.push('/doctorProfile/docChatbot');
        else router.push('../../../patientProfile/chat');
        break;

      case 'more':
        setIsDrawerVisible(true);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const checkRole = async () => {
      try {
        const user = auth.currentUser;
        if (!user || !user.uid) return;
        const roles = await AuthService.determineRoles(user.uid);
        setIsDoctor(!!(roles && roles.isDoctor));
      } catch (err) {
        console.warn('Failed to determine roles for bottom nav:', err);
        setIsDoctor(false);
      }
    };
    checkRole();

    if (global.EventEmitter) {
      const handler = () => checkRole();
      global.EventEmitter.on('USER_CHANGED', handler);
      return () => global.EventEmitter.off('USER_CHANGED', handler);
    }
  }, []);

  return (
    <>
      <SideNavigationDrawer
        isVisible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
      />

      <View style={styles && styles.container}>

        <TouchableOpacity
          style={styles && styles.tabButton}
          onPress={() => handleTabPress('home')}
        >
          <Feather
            name="home"
            size={22}
            color={shouldHighlight && activeTab === 'home' ? '#7d4c9e' : '#666'}
          />
          <Text style={styles && [
            styles.tabLabel,
            shouldHighlight && activeTab === 'home' && styles.activeTabLabel
          ]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles && styles.tabButton}
          onPress={() => handleTabPress('notification')}
        >
          <Feather
            name="bell"
            size={22}
            color={shouldHighlight && activeTab === 'notification' ? '#7d4c9e' : '#666'}
          />
          <Text style={styles && [
            styles.tabLabel,
            shouldHighlight && activeTab === 'notification' && styles.activeTabLabel
          ]}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles && styles.tabButton}
          onPress={() => handleTabPress('chat')}
        >
          <Feather
            name="message-circle"
            size={22}
            color={shouldHighlight && activeTab === 'Chat' ? '#7d4c9e' : '#666'}
          />
          <Text style={styles && [
            styles.tabLabel,
            shouldHighlight && activeTab === 'Chat' && styles.activeTabLabel
          ]}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles && styles.tabButton}
          onPress={() => handleTabPress('more')}
        >
          <Feather
            name="menu"
            size={22}
            color={shouldHighlight && activeTab === 'more' ? '#7d4c9e' : '#666'}
          />
          <Text style={styles && [
            styles.tabLabel,
            shouldHighlight && activeTab === 'more' && styles.activeTabLabel
          ]}>More</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 10,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabIconContainer: {
    backgroundColor: '#7d4c9e',
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  activeTabLabel: {
    color: '#7d4c9e',
    fontWeight: '500',
  },
});
