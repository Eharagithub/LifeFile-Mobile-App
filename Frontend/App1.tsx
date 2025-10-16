import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";

import { firebase } from "./config/firebaseConfig";

import Login from "./app/auth/login";
import Signup from "./app/auth/Auth/signup";
import Home from "./app/patientProfile/patientHome";
//import Header from "./app/common/header";

// Define the navigation stack parameter list
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  PatientHome: undefined;
};

// Create typed stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

// Export navigation prop type for use in other components
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const App: React.FC = () => {
  const [initializing, setInitializing] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  // Handle user state changes
  useEffect(() => {
    const onAuthStateChanged = (user: any) => {
      setUser(user);
      if (initializing) setInitializing(false);
    };

    const subscriber = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, [initializing]);

  // Show loading screen while initializing
  if (initializing) return null;

  // Show authentication screens if user is not logged in
  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="ForgotPassword" component={Login} />
      </Stack.Navigator>
    );
  }

  // Show main app screens if user is logged in
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="PatientHome" component={Home} />
    </Stack.Navigator>
  );
};

const MainApp: React.FC = () => {
  return (
    <NavigationContainer>
      <App />
    </NavigationContainer>
  );
};

MainApp.displayName = "MainApp";

export default MainApp;