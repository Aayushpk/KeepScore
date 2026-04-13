import { StyleSheet } from 'react-native';

export const theme = {
  colors: {
    background: '#0a0a0a',      // Pitch black background for aggressive dark mode
    surface: '#151515',         // Floating card surface
    surfaceElevation: '#1e1e1e',// Secondary overlays/pickers
    primary: '#4c8bf5',         // Electric Blue -> standardizes calls to action
    primaryMuted: 'rgba(76, 139, 245, 0.15)',
    success: '#34c759',         // Vibrant Apple-esque green for Runs/Wins
    successMuted: 'rgba(52, 199, 89, 0.1)',
    danger: '#ff3b30',          // Vibrant Red for Wickets/Deletions
    dangerMuted: 'rgba(255, 59, 48, 0.1)',
    text: '#ffffff',            // Pure white 
    textSecondary: '#a1a1aa',   // Slate gray
    textMuted: '#52525b',       // Deep gray
    border: '#27272a',          // Border rings
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
    xl: 30,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
    full: 9999
  },
  typography: {
    h1: { fontSize: 36, fontWeight: '900' as const, letterSpacing: -0.5 },
    h2: { fontSize: 24, fontWeight: '800' as const, letterSpacing: 0 },
    h3: { fontSize: 20, fontWeight: '700' as const },
    body: { fontSize: 16, fontWeight: '500' as const },
    bodyBold: { fontSize: 16, fontWeight: '700' as const },
    caption: { fontSize: 14, fontWeight: '600' as const, letterSpacing: 0.2 },
    small: { fontSize: 12, fontWeight: '500' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5 }
  },
  shadows: {
    // Drop shadow replacing bare borders
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 6,
    },
    glowSuccess: {
      shadowColor: '#34c759',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    }
  }
};
