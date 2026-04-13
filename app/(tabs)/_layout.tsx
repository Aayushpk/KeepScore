import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333',
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        },
        tabBarActiveTintColor: '#4caf50',
        tabBarInactiveTintColor: '#888',
        sceneStyle: { backgroundColor: '#121212' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'KeepScore',
          tabBarLabel: 'Home',
          // Use name "home" if preferred, but "index" is standard for the group
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: 'Teams',
          tabBarLabel: 'Teams',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Match History',
          tabBarLabel: 'History',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tabs>
  );
}
