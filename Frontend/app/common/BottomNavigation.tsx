import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather,} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SideNavigationDrawer from './sideNavigation';

interface BottomNavigationProps {
  activeTab: 'home' | 'statistics' | 'notification' | 'more' | 'none';
  onTabPress?: (tabName: string) => void;
}

export default function BottomNavigation({ 
  activeTab, 
  onTabPress = () => {} 
}: BottomNavigationProps) {
  const router = useRouter();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

   const handleTabPress = (tabName: string) => {
    // Call the optional onTabPress callback
    onTabPress(tabName);
    
    // Handle navigation based on tab
    switch (tabName) {
      case 'home':
        router.push('../patientProfile/patientHome'); 
        break;
      case 'statistics':
        router.push('../patientProfile/statistics'); 
        break;
      case 'notification':
        router.push('../patientProfile/notification'); 
        break;
      case 'more':
        // Toggle side navigation drawer instead of navigating
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
      
      <View style={styles.container}>
      
      <TouchableOpacity 
        style={styles.tabButton} 
        onPress={() => handleTabPress('home')}
      >
        {/* <View style={[
          styles.tabIconContainer,
          activeTab === 'home' && styles.activeTabIconContainer
        ]}> */}
        
          <Feather 
            name="home" 
            size={22} 
            color={activeTab === 'home' ? '#7d4c9e' : '#666'} 
          />
        {/* </View> */}
        <Text style={[
          styles.tabLabel,
          activeTab === 'home' && styles.activeTabLabel
        ]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabButton} 
        onPress={() => handleTabPress('statistics')}
      >
        <Feather 
          name="bar-chart-2" 
          size={22} 
          color={activeTab === 'statistics' ? '#7d4c9e' : '#666'} 
        />
        <Text style={[
          styles.tabLabel,
          activeTab === 'statistics' && styles.activeTabLabel
        ]}>Statistics</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabButton} 
        onPress={() => handleTabPress('notification')}
      >
        <Feather 
          name="bell" 
          size={22} 
          color={activeTab === 'notification' ? '#7d4c9e' : '#666'} 
        />
        <Text style={[
          styles.tabLabel,
          activeTab === 'notification' && styles.activeTabLabel
        ]}>Notification</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabButton} 
        onPress={() => handleTabPress('more')}
      >
        <Feather 
          name="menu" 
          size={22} 
          color={activeTab === 'more' ? '#7d4c9e' : '#666'} 
        />
        <Text style={[
          styles.tabLabel,
          activeTab === 'more' && styles.activeTabLabel
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
