import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { theme } from './theme';

export default function TossScreen() {
  const router = useRouter();
  const { t1, t2, overs } = useLocalSearchParams();
  
  const [tossCompleted, setTossCompleted] = useState(false);
  const [tossWinner, setTossWinner] = useState('');
  const spinValue = useRef(new Animated.Value(0)).current;

  // Coin flip rotation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '2160deg'] // 6 full rotations out
  });

  useFocusEffect(
    useCallback(() => {
      // Reset state every time the screen is focused
      setTossCompleted(false);
      spinValue.setValue(0);

      // Start animation
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 4500, // 4.5 seconds animation
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      // Ensure outcome is random 50/50
      const timer = setTimeout(() => {
        const team1 = t1 ? String(t1) : 'Team 1';
        const team2 = t2 ? String(t2) : 'Team 2';
        
        // Use greater than 0.5 for pure 50% unbiased boolean
        const isTeam1 = Math.random() > 0.5;
        const selectedWinner = isTeam1 ? team1 : team2;
        
        setTossWinner(selectedWinner);
        setTossCompleted(true);
      }, 5000); // Wait strictly 5 seconds

      return () => clearTimeout(timer);
    }, [t1, t2])
  );

  const handleDecision = (action: string) => {
    const result = `${tossWinner} won the toss and decided to ${action} first!`;
    const isTeam1 = tossWinner === t1;

    let battingTeamName = '';
    let bowlingTeamName = '';

    if (action === 'Bat') {
      battingTeamName = isTeam1 ? String(t1) : String(t2);
      bowlingTeamName = isTeam1 ? String(t2) : String(t1);
    } else {
      battingTeamName = isTeam1 ? String(t2) : String(t1);
      bowlingTeamName = isTeam1 ? String(t1) : String(t2);
    }

    router.push({
      pathname: '/scoring',
      params: { 
        battingTeamName, 
        bowlingTeamName, 
        overs, 
        result,
        matchId: Date.now().toString() 
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>The Toss</Text>
      
      <Text style={styles.teams}>{t1} vs {t2}</Text>
      
      <View style={styles.coinContainer}>
        <Animated.View style={[styles.coin, { transform: [{ rotateY: spin }] }]}>
          <Text style={styles.coinText}>★</Text>
        </Animated.View>
      </View>

      <View style={styles.resultContainer}>
        {tossCompleted ? (
          <>
            <Text style={styles.resultText}>{tossWinner} won the toss!</Text>
            <Text style={styles.questionText}>What do they choose to do?</Text>
            
            <View style={styles.decisionRow}>
              <TouchableOpacity 
                style={[styles.decisionBtn, styles.batBtn]}
                onPress={() => handleDecision('Bat')}
              >
                <Text style={styles.decisionBtnText}>🏏 Bat</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.decisionBtn, styles.bowlBtn]}
                onPress={() => handleDecision('Bowl')}
              >
                <Text style={styles.decisionBtnText}>🔴 Bowl</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={styles.tossingText}>Tossing Coin...</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  header: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  teams: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
    marginBottom: 60,
  },
  coinContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coin: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.colors.surfaceElevation,
    borderWidth: 4,
    borderColor: theme.colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  coinText: {
    fontSize: 70,
    color: theme.colors.textSecondary,
    fontWeight: 'normal',
    marginTop: -5,
  },
  resultContainer: {
    marginTop: 60,
    alignItems: 'center',
    minHeight: 150,
    width: '100%',
  },
  tossingText: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  resultText: {
    ...theme.typography.h2,
    color: theme.colors.success,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  questionText: {
    color: theme.colors.textSecondary,
    ...theme.typography.caption,
    marginBottom: theme.spacing.xl,
  },
  decisionRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
    paddingHorizontal: theme.spacing.md,
  },
  decisionBtn: {
    flex: 1,
    paddingVertical: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    ...theme.shadows.card,
  },
  batBtn: {
    backgroundColor: theme.colors.primaryMuted,
    borderColor: theme.colors.primary,
  },
  bowlBtn: {
    backgroundColor: theme.colors.dangerMuted,
    borderColor: theme.colors.danger,
  },
  decisionBtnText: {
    color: '#fff',
    ...theme.typography.h3,
  }
});
