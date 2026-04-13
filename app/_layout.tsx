import { Tabs, Stack, Head } from 'expo-router';
import { View, StyleSheet, useColorScheme, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TeamsProvider } from './context/TeamsContext';
import { MatchHistoryProvider } from './context/MatchHistoryContext';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <MatchHistoryProvider>
      <TeamsProvider>
        {Platform.OS === 'web' && (
          <Head>
            <title>KeepScore | Ultimate Cricket Scorer</title>
            <meta name="description" content="Professional cricket score keeping app with advanced analytics and history tracking." />
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
          </Head>
        )}
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
            href: null,
          }}
        />
        <Tabs.Screen
          name="scoring"
          options={{
            title: 'Scoring',
            href: null,
          }}
        />
      </Tabs>
      </TeamsProvider>
      </MatchHistoryProvider>
    </SafeAreaProvider>
  );
}
