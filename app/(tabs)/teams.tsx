import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { useTeams, Team } from '../context/TeamsContext';
import { theme } from '../theme';

export default function TeamsScreen() {
  const { teams, addTeam, deleteTeam, updateTeam } = useTeams();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState<string[]>(['', '', '', '']);

  const openCreateModal = () => {
    if (teams.length >= 10) {
      Alert.alert('Team Limit Reached', 'You can only have up to 10 teams at a time.');
      return;
    }
    setEditingTeamId(null);
    setTeamName('');
    setPlayers(['', '', '', '']); // Start with 4 empty inputs
    setIsModalVisible(true);
  };

  const openEditModal = (team: Team) => {
    setEditingTeamId(team.id);
    setTeamName(team.name);
    setPlayers([...team.players]);
    setIsModalVisible(true);
  };

  const closeAndResetModal = () => {
    setIsModalVisible(false);
    setTeamName('');
    setPlayers(['', '', '', '']);
    setEditingTeamId(null);
  };

  const handleUpdatePlayer = (text: string, index: number) => {
    const newPlayers = [...players];
    newPlayers[index] = text;
    setPlayers(newPlayers);
  };

  const handleAddPlayerInput = () => {
    if (players.length < 15) {
      setPlayers([...players, '']);
    }
  };

  const handleRemovePlayerInput = (index: number) => {
    if (players.length > 4) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
    } else {
      Alert.alert('Minimum Players', 'A team must have at least 4 players.');
    }
  };

  const handleSaveTeam = () => {
    if (!teamName.trim()) {
      Alert.alert('Invalid Name', 'Please provide a team name.');
      return;
    }
    const filledPlayers = players.map(p => p.trim()).filter(p => p.length > 0);
    if (filledPlayers.length < 4) {
      Alert.alert('Not Enough Players', 'Please provide names for at least 4 players.');
      return;
    }

    if (editingTeamId) {
      updateTeam({ id: editingTeamId, name: teamName.trim(), players: filledPlayers });
    } else {
      addTeam({ name: teamName.trim(), players: filledPlayers });
    }
    closeAndResetModal();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Your Teams ({teams.length}/10)</Text>
        <TouchableOpacity 
          style={[styles.createBtn, teams.length >= 10 && styles.createBtnDisabled]} 
          onPress={openCreateModal}
          disabled={teams.length >= 10}
        >
          <Text style={styles.createBtnText}>+ New Team</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent}>
        {teams.length === 0 ? (
          <Text style={styles.emptyText}>No teams created yet. Tap "+ New Team" to get started.</Text>
        ) : (
          teams.map(team => (
            <View key={team.id} style={styles.teamCard}>
              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{team.name}</Text>
                <Text style={styles.teamCount}>{team.players.length} Players</Text>
              </View>
              <View style={styles.teamActions}>
                <TouchableOpacity onPress={() => openEditModal(team)} style={styles.actionBtn}>
                  <Text style={styles.actionEmoji}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTeam(team.id)} style={styles.actionBtn}>
                  <Text style={styles.actionEmoji}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create/Edit Team Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingTeamId ? 'Edit Team' : 'Create Team'}</Text>
            
            <Text style={styles.label}>Team Name</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Kathmandu Gorkhas"
              placeholderTextColor="#555"
              value={teamName}
              onChangeText={setTeamName}
            />

            <View style={styles.playersHeader}>
              <Text style={styles.label}>Players ({players.filter(p => p.trim().length > 0).length}/{players.length})</Text>
              {players.length < 15 && (
                <TouchableOpacity onPress={handleAddPlayerInput}>
                  <Text style={styles.addPlayerText}>+ Add Player Slot</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.playersScroll}>
              {players.map((player, index) => (
                <View key={index} style={styles.playerInputRow}>
                  <Text style={styles.playerIndex}>{index + 1}.</Text>
                  <TextInput 
                    style={styles.playerInput} 
                    placeholder={`Player ${index + 1}`}
                    placeholderTextColor="#555"
                    value={player}
                    onChangeText={(text) => handleUpdatePlayer(text, index)}
                  />
                  {players.length > 4 && (
                    <TouchableOpacity onPress={() => handleRemovePlayerInput(index)} style={styles.removePlayerBtn}>
                      <Text style={styles.removePlayerText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeAndResetModal}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveTeam}>
                <Text style={styles.saveBtnText}>Save Team</Text>
              </TouchableOpacity>
            </View>
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
    padding: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  header: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  createBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  createBtnDisabled: {
    backgroundColor: theme.colors.surfaceElevation,
  },
  createBtnText: {
    color: '#fff',
    ...theme.typography.bodyBold,
  },
  scrollContent: {
    flex: 1,
  },
  emptyText: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 50,
    ...theme.typography.body,
  },
  teamCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  teamCount: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  teamActions: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  actionBtn: {
    padding: theme.spacing.xs,
  },
  actionEmoji: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    minHeight: '75%',
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.card
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
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
  playersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  addPlayerText: {
    color: theme.colors.primary,
    ...theme.typography.bodyBold,
  },
  playersScroll: {
    flex: 1,
    marginBottom: theme.spacing.lg,
  },
  playerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  playerIndex: {
    color: theme.colors.textSecondary,
    width: 30,
    ...theme.typography.caption,
  },
  playerInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.text,
    padding: theme.spacing.sm,
    ...theme.typography.body,
  },
  removePlayerBtn: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  removePlayerText: {
    color: theme.colors.danger,
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
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
  saveBtn: {
    flex: 2,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    ...theme.typography.bodyBold,
  },
});
