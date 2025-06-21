import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';

interface BottomNavigationProps {
  activeTab: 'home' | 'statistics' | 'notification' | 'profile';
  onTabPress?: (tabName: string) => void;
}

export default function BottomNavigation({ 
  activeTab, 
  onTabPress = () => {} 
}: BottomNavigationProps) {
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.tabButton} 
        onPress={() => onTabPress('home')}
      >
        <View style={[
          styles.tabIconContainer,
          activeTab === 'home' && styles.activeTabIconContainer
        ]}>
          <Feather 
            name="home" 
            size={22} 
            color={activeTab === 'home' ? '#fff' : '#666'} 
          />
        </View>
        <Text style={[
          styles.tabLabel,
          activeTab === 'home' && styles.activeTabLabel
        ]}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabButton} 
        onPress={() => onTabPress('statistics')}
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
        onPress={() => onTabPress('notification')}
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
        onPress={() => onTabPress('profile')}
      >
        <Feather 
          name="user" 
          size={22} 
          color={activeTab === 'profile' ? '#7d4c9e' : '#666'} 
        />
        <Text style={[
          styles.tabLabel,
          activeTab === 'profile' && styles.activeTabLabel
        ]}>Profile</Text>
      </TouchableOpacity>
    </View>
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
