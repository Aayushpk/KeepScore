import { Tabs, Stack } from 'expo-router';
import { View, StyleSheet, useColorScheme, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TeamsProvider } from './context/TeamsContext';
import { MatchHistoryProvider } from './context/MatchHistoryContext';

export default function Layout() {
  // Debugging logs to catch "undefined" component errors on live web
  if (Platform.OS === 'web') {
    console.log('[Debug] Tabs:', typeof Tabs);
    console.log('[Debug] SafeAreaProvider:', typeof SafeAreaProvider);
    console.log('[Debug] TeamsProvider:', typeof TeamsProvider);
    console.log('[Debug] MatchHistoryProvider:', typeof MatchHistoryProvider);
  }

  return (
    <SafeAreaProvider>
      <MatchHistoryProvider>
      <TeamsProvider>
        <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#fff',
          tabBarStyle: {
            backgroundColor: '#1a1a1a',
            borderTopColor: '#333',
          },
          tabBarActiveTintColor: '#4caf50',
          tabBarInactiveTintColor: '#888',
          sceneStyle: { backgroundColor: '#121212' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'KeepScore - Dashboard',
            tabBarLabel: 'Home',
          }}
        />
        <Tabs.Screen
          name="teams"
          options={{
            title: 'KeepScore - Teams',
            tabBarLabel: 'Teams',
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'KeepScore - Match History',
            tabBarLabel: 'History',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'KeepScore - Profile',
            tabBarLabel: 'Profile',
          }}
        />
        <Tabs.Screen
          name="toss"
          options={{
            title: 'Toss',
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="scoring"
          options={{
            title: 'Scoring',
            tabBarButton: () => null,
          }}
        />
      </Tabs>
      </TeamsProvider>
      </MatchHistoryProvider>
    </SafeAreaProvider>
  );
}
