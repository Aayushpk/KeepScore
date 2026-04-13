import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Modal,
  TextInput,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTeams } from './context/TeamsContext';
import { useMatchHistory } from './context/MatchHistoryContext';
import { theme } from './theme';

export default function Dashboard() {
  const router = useRouter();
  
  // Dashboard Interactive States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAbandonModalVisible, setIsAbandonModalVisible] = useState(false);
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [overs, setOvers] = useState('');

  const { teams } = useTeams();
  const { matchHistory, activeMatch, abandonMatch } = useMatchHistory();
  const [isTeamPickerVisible, setIsTeamPickerVisible] = useState(false);
  const [pickingFor, setPickingFor] = useState<'team1' | 'team2'>('team1');

  const openTeamPicker = (target: 'team1' | 'team2') => {
    setPickingFor(target);
    setIsTeamPickerVisible(true);
  };

  const handleSelectTeam = (name: string) => {
    if (pickingFor === 'team1') setTeam1(name);
    else setTeam2(name);
    setIsTeamPickerVisible(false);
  };

  const handleNewMatchPress = () => {
    if (activeMatch) {
      setIsAbandonModalVisible(true);
    } else {
      setIsModalVisible(true);
    }
  };

  const confirmAbandon = () => {
    abandonMatch();
    setIsAbandonModalVisible(false);
    setIsModalVisible(true);
  };

  const launchScoring = () => {
    setIsModalVisible(false);
    router.push({
      pathname: '/toss',
      params: {
        t1: team1 || 'Team A',
        t2: team2 || 'Team B',
        overs: overs || '20'
      }
    });
  };
  
  const resumeScoring = () => {
    router.push('/scoring');
  };

  const generateHighlights = () => {
    let rawHighlights: any[] = [];

    matchHistory.slice(0, 8).forEach((match) => {
      if (match.result && match.result !== 'Match Abandoned') {
        rawHighlights.push({ id: `m-${match.id}`, emoji: '🏆', text: match.result, date: match.date, weight: 1 });
      }

      const processInnings = (inn: any) => {
        if (!inn) return;
        if (inn.batsmanStats) {
          Object.entries(inn.batsmanStats).forEach(([name, stats]: any) => {
            if (stats.runs >= 50) {
              rawHighlights.push({ id: `b50-${match.id}-${name}`, emoji: '🏏', text: `${name} smashed an incredible ${stats.runs} off ${stats.balls} balls!`, date: match.date, weight: 4 });
            } else if (stats.runs >= 30) {
              rawHighlights.push({ id: `b30-${match.id}-${name}`, emoji: '🔥', text: `${name} played a solid knock of ${stats.runs} runs!`, date: match.date, weight: 2 });
            }
          });
        }
        if (inn.bowlerStats) {
           Object.entries(inn.bowlerStats).forEach(([name, stats]: any) => {
            if (stats.wickets >= 3) {
              rawHighlights.push({ id: `w3-${match.id}-${name}`, emoji: '🎯', text: `${name} tore through the lineup with ${stats.wickets} wickets!`, date: match.date, weight: 4 });
            } else if (stats.wickets === 2) {
              rawHighlights.push({ id: `w2-${match.id}-${name}`, emoji: '⚡', text: `${name} picked up a crucial ${stats.wickets} wickets!`, date: match.date, weight: 2 });
            }
          });
        }
      };

      processInnings(match.innings1);
      processInnings(match.innings2);
    });

    // Sort by weight to surface best individual stats first, fallback to standard results
    rawHighlights.sort((a, b) => b.weight - a.weight);
    return rawHighlights.slice(0, 6);
  };

  const dynamicHighlights = generateHighlights();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Live Match Widget */}
        {activeMatch ? (
          <View style={styles.liveMatchCard}>
            <View style={styles.liveHeader}>
              <Text style={styles.liveTitle}>🔴 LIVE • Innings {activeMatch.innings}</Text>
              <Text style={styles.currRR}>
                CRR: {activeMatch.oversBowled > 0 || activeMatch.ballsInOver > 0 
                  ? (activeMatch.totalRuns / ((activeMatch.oversBowled * 6 + activeMatch.ballsInOver) / 6)).toFixed(2) 
                  : '0.00'}
              </Text>
            </View>
            <Text style={styles.liveScore}>
              {activeMatch.battingTeamName} {activeMatch.totalRuns}/{activeMatch.wickets} <Text style={styles.overs}>({activeMatch.oversBowled}.{activeMatch.ballsInOver} Ov)</Text>
            </Text>
            {activeMatch.innings === 2 && activeMatch.targetScore ? (
               <Text style={styles.liveTarget}>
                 {activeMatch.battingTeamName} needs {activeMatch.targetScore - activeMatch.totalRuns} runs to win.
               </Text>
            ) : (
               <Text style={styles.liveTarget}>
                 vs {activeMatch.bowlingTeamName}
               </Text>
            )}
            
            <TouchableOpacity style={styles.resumeBtn} onPress={resumeScoring}>
              <Text style={styles.resumeBtnText}>Resume Scoring</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.liveMatchCard, styles.placeholderCard]}>
            <Text style={styles.placeholderLabel}>No Active Match</Text>
            <Text style={styles.placeholderSub}>Start a new match to see live stats here!</Text>
          </View>
        )}

        {/* Quick Actions Grid */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.gridContainer}>
          <TouchableOpacity 
            style={[styles.gridItem, styles.primaryGridItem]}
            onPress={handleNewMatchPress}
          >
            <Text style={styles.gridEmoji}>🏏</Text>
            <Text style={styles.gridItemText}>New Match</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} onPress={() => router.push('/teams')}>
            <Text style={styles.gridEmoji}>👥</Text>
            <Text style={styles.gridItemText}>Teams</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridItem} onPress={() => alert('DLS Calculator (Coming Soon)')}>
            <Text style={styles.gridEmoji}>📊</Text>
            <Text style={styles.gridItemText}>Calculator</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gridItem}
            onPress={() => router.push('/history')}
          >
            <Text style={styles.gridEmoji}>📖</Text>
            <Text style={styles.gridItemText}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Highlights - Horizontal Scroll */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Highlights</Text>
        </View>
        
        {dynamicHighlights.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.highlightsContainer}>
            {dynamicHighlights.map((hl) => (
              <View key={hl.id} style={styles.highlightCard}>
                <Text style={styles.highlightEmoji}>{hl.emoji}</Text>
                <Text style={styles.highlightText}>{hl.text}</Text>
                <Text style={styles.highlightDate}>{hl.date}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
           <Text style={styles.emptyHighlights}>Play a complete match to generate highlights.</Text>
        )}
      </ScrollView>

      {/* New Match Setup Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Setup New Match</Text>
            
            <Text style={styles.label}>Team 1</Text>
            <TouchableOpacity style={styles.dropdownBtn} onPress={() => openTeamPicker('team1')}>
              <Text style={team1 ? styles.dropdownText : styles.dropdownPlaceholder}>
                {team1 || "Select Team 1"}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Team 2</Text>
            <TouchableOpacity style={styles.dropdownBtn} onPress={() => openTeamPicker('team2')}>
              <Text style={team2 ? styles.dropdownText : styles.dropdownPlaceholder}>
                {team2 || "Select Team 2"}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Total Overs</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. 20"
              placeholderTextColor="#555"
              keyboardType="number-pad"
              value={overs}
              onChangeText={setOvers}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.startBtn} 
                onPress={launchScoring}
              >
                <Text style={styles.startBtnText}>Start Toss</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Abandon Match Alert Modal */}
      <Modal visible={isAbandonModalVisible} animationType="fade" transparent={true}>
        <View style={styles.pickerOverlay}>
           <View style={{ backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl, padding: theme.spacing.xl, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 15, elevation: 10 }}>
             <Text style={{ fontSize: 48, marginBottom: theme.spacing.md }}>⚠️</Text>
             <Text style={{ color: theme.colors.text, ...theme.typography.h2, marginBottom: theme.spacing.sm }}>Ongoing Match</Text>
             <Text style={{ color: theme.colors.textSecondary, ...theme.typography.body, textAlign: 'center', marginBottom: theme.spacing.xl, lineHeight: 22 }}>
               You currently have an active match. Do you want to ABANDON it and start a new one? {"\n\n"}
               <Text style={{color: theme.colors.danger, ...theme.typography.bodyBold}}>The unfinished match will be permanently saved to your History.</Text>
             </Text>
             <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: theme.spacing.md }}>
               <TouchableOpacity style={{ flex: 1, paddingVertical: 14, borderRadius: theme.borderRadius.md, alignItems: 'center', backgroundColor: theme.colors.surfaceElevation }} onPress={() => setIsAbandonModalVisible(false)}>
                 <Text style={{ color: theme.colors.text, ...theme.typography.bodyBold }}>Cancel</Text>
               </TouchableOpacity>
               <TouchableOpacity style={{ flex: 1, paddingVertical: 14, borderRadius: theme.borderRadius.md, alignItems: 'center', backgroundColor: theme.colors.danger }} onPress={confirmAbandon}>
                 <Text style={{ color: '#fff', ...theme.typography.bodyBold }}>Abandon Match</Text>
               </TouchableOpacity>
             </View>
           </View>
        </View>
      </Modal>

      {/* Team Picker Modal */}
      <Modal
        visible={isTeamPickerVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>Select a Team</Text>
            {teams.length === 0 ? (
              <Text style={styles.pickerEmpty}>No teams available. Please create a team first.</Text>
            ) : (
              <FlatList
                data={teams}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.pickerItem}
                    onPress={() => handleSelectTeam(item.name)}
                  >
                    <Text style={styles.pickerItemText}>{item.name}</Text>
                    <Text style={styles.pickerItemSubtext}>{item.players.length} Players</Text>
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 300 }}
              />
            )}
            <TouchableOpacity 
              style={styles.pickerCancelBtn}
              onPress={() => setIsTeamPickerVisible(false)}
            >
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  liveMatchCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card,
  },
  placeholderCard: {
    alignItems: 'center',
    paddingVertical: 35,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: theme.colors.textMuted,
    backgroundColor: 'transparent',
    shadowOpacity: 0
  },
  placeholderLabel: {
    color: theme.colors.textSecondary,
    ...theme.typography.h3,
    marginBottom: 5
  },
  placeholderSub: {
    color: theme.colors.textMuted,
    ...theme.typography.caption
  },
  liveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  liveTitle: {
    color: theme.colors.danger,
    ...theme.typography.small,
  },
  currRR: {
    color: theme.colors.textSecondary,
    ...theme.typography.caption,
  },
  liveScore: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: 5,
  },
  overs: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
  },
  liveTarget: {
    color: theme.colors.textSecondary,
    ...theme.typography.body,
    marginBottom: theme.spacing.lg,
  },
  resumeBtn: {
    backgroundColor: theme.colors.success,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.glowSuccess
  },
  resumeBtnText: {
    color: '#000',
    ...theme.typography.bodyBold,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  gridItem: {
    width: '47%',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card
  },
  primaryGridItem: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  gridEmoji: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  gridItemText: {
    color: theme.colors.text,
    ...theme.typography.caption,
  },
  highlightsContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  highlightCard: {
    backgroundColor: theme.colors.surface,
    width: 240,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    ...theme.shadows.card
  },
  highlightEmoji: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
    textAlign: 'center'
  },
  highlightText: {
    color: theme.colors.text,
    ...theme.typography.bodyBold,
    textAlign: 'center',
    lineHeight: 22
  },
  highlightDate: {
    color: theme.colors.textMuted,
    ...theme.typography.small,
    marginTop: theme.spacing.md,
    textAlign: 'center'
  },
  emptyHighlights: {
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    minHeight: '65%',
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  label: {
    color: theme.colors.textSecondary,
    ...theme.typography.caption,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text,
    padding: theme.spacing.md,
    ...theme.typography.body,
    marginBottom: theme.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  cancelBtn: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceElevation,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: theme.colors.textSecondary,
    ...theme.typography.bodyBold,
  },
  startBtn: {
    flex: 2,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  startBtnText: {
    color: '#fff',
    ...theme.typography.bodyBold,
  },
  dropdownBtn: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: theme.colors.text,
    ...theme.typography.body,
  },
  dropdownPlaceholder: {
    color: theme.colors.textMuted,
    ...theme.typography.body,
  },
  dropdownIcon: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  pickerContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card
  },
  pickerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  pickerEmpty: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  pickerItem: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerItemText: {
    color: theme.colors.text,
    ...theme.typography.bodyBold,
  },
  pickerItemSubtext: {
    color: theme.colors.textSecondary,
    ...theme.typography.caption,
  },
  pickerCancelBtn: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pickerCancelText: {
    color: theme.colors.textSecondary,
    ...theme.typography.bodyBold,
  },
});
