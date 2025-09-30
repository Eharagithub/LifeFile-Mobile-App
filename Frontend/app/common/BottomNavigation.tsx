import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SideNavigationDrawer from './sideNavigation';

interface BottomNavigationProps {
  activeTab: 'home' | 'CareBot' | 'notification' | 'more' | 'none';
  onTabPress?: (tabName: string) => void;
}


export default function BottomNavigation({
  activeTab,
  onTabPress = () => { }
}: BottomNavigationProps) {
  const router = useRouter();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  // Only highlight tab if on these pages
  const highlightTabs = ['home', 'CareBot', 'notification', 'more'];
  const shouldHighlight = highlightTabs.includes(activeTab);

  const handleTabPress = (tabName: string) => {
    onTabPress(tabName);
    switch (tabName) {
      case 'home':
        router.push('../../../patientProfile/patientHome');
        break;
      case 'CareBot':
        router.push('../../../patientProfile/CareBot');
        break;
      case 'notification':
        router.push('../../../patientProfile/notification');
        break;
      case 'more':
        setIsDrawerVisible(true);
        break;
      default:
        break;
    }
  };

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
          ]}>Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles && styles.tabButton}
          onPress={() => handleTabPress('CareBot')}
        >
          <Feather
            name="message-circle"
            size={22}
            color={shouldHighlight && activeTab === 'CareBot' ? '#7d4c9e' : '#666'}
          />
          <Text style={styles && [
            styles.tabLabel,
            shouldHighlight && activeTab === 'CareBot' && styles.activeTabLabel
          ]}>CareBot</Text>
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
