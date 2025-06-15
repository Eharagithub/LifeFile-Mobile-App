import { Stack } from 'expo-router';
import { View, StatusBar } from 'react-native';
import React from 'react';

// App theme color constants
const APP_BACKGROUND_COLOR = '#e9d6f7'; // Light purple - main app background color

export default function RootLayout() {
  // Using our app background color constant
  
  return (    <View style={{ flex: 1, backgroundColor: APP_BACKGROUND_COLOR }}>
      
      <StatusBar 
        backgroundColor={APP_BACKGROUND_COLOR}
        barStyle="dark-content" // This makes the status bar text/icons black
        translucent={false}
      />
      <Stack 
        screenOptions={{
          // Use contentStyle on the Stack component instead of directly on Fragments
          contentStyle: { 
            backgroundColor: APP_BACKGROUND_COLOR 
          },
          // Hide header to remove the navigation bar as well
          headerShown: false
        }}
      />
    </View>
  );
}
