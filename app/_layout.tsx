import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TeamsProvider } from './context/TeamsContext';
import { MatchHistoryProvider } from './context/MatchHistoryContext';

export default function RootLayout() {
  // Debugging logs to catch "undefined" component errors on live web
  if (Platform.OS === 'web') {
    console.log('[Debug] Root Stack Loaded');
    console.log('[Debug] SafeAreaProvider:', typeof SafeAreaProvider);
    console.log('[Debug] TeamsProvider:', typeof TeamsProvider);
    console.log('[Debug] MatchHistoryProvider:', typeof MatchHistoryProvider);
  }

  return (
    <SafeAreaProvider>
      <MatchHistoryProvider>
        <TeamsProvider>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: '#1a1a1a',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              contentStyle: { backgroundColor: '#121212' },
            }}
          >
            {/* The main tab navigation */}
            <Stack.Screen 
              name="(tabs)" 
              options={{ headerShown: false }} 
            />
            
            {/* Internal pages (not in tabs) */}
            <Stack.Screen 
              name="toss" 
              options={{ title: 'Match Setup' }} 
            />
            <Stack.Screen 
              name="scoring" 
              options={{ 
                title: 'Live Scoring',
                headerBackVisible: false // Prevent accidental back during match
              }} 
            />
          </Stack>
        </TeamsProvider>
      </MatchHistoryProvider>
    </SafeAreaProvider>
  );
}
