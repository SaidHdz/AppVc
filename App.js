import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BluetoothProvider } from './src/context/BluetoothContext';
import HomeScreen from './src/screens/HomeScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import EventDetail from './src/screens/EventDetail';
import { LayoutDashboard, History, Settings } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Dashboard') return <LayoutDashboard color={color} size={size} />;
          if (route.name === 'Historial') return <History color={color} size={size} />;
          if (route.name === 'Ajustes') return <Settings color={color} size={size} />;
        },
        tabBarActiveTintColor: '#1976D2',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} />
      <Tab.Screen name="Historial" component={HistoryScreen} />
      <Tab.Screen name="Ajustes" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <BluetoothProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="EventDetail" component={EventDetail} />
        </Stack.Navigator>
      </NavigationContainer>
    </BluetoothProvider>
  );
}