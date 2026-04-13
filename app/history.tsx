import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { useMatchHistory, MatchResult, InningsData } from './context/MatchHistoryContext';
import { Ionicons } from '@expo/vector-icons';

export default function History() {
  const { matchHistory, clearHistory, deleteMatches } = useMatchHistory();
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [isClearModalVisible, setIsClearModalVisible] = useState(false);

  // Selection Mode State
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const confirmClearHistory = () => {
    clearHistory();
    setIsClearModalVisible(false);
    setIsSelectMode(false);
    setSelectedIds([]);
  };

  const handleDeleteSelected = () => {
    deleteMatches(selectedIds);
    setIsSelectMode(false);
    setSelectedIds([]);
  };

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const renderInningsTable = (innings: InningsData | undefined, title: string) => {
    if (!innings) return null;
    
    return (
      <View style={styles.inningsSection}>
        <Text style={styles.inningsTitle}>{title} - {innings.teamName}</Text>
        <Text style={styles.inningsScore}>{innings.totalRuns} / {innings.wickets}</Text>
        
        <View style={styles.tableBlock}>
          <Text style={styles.tableHeader}>Batsmen</Text>
          {Object.entries(innings.batsmanStats).map(([name, stats]) => (
            <View key={name} style={styles.tableRow}>
              <Text style={styles.tableCellName}>{name}</Text>
              <Text style={styles.tableCellScore}>{stats.runs} ({stats.balls})</Text>
            </View>
          ))}
          {Object.keys(innings.batsmanStats).length === 0 && <Text style={styles.emptyTable}>No batsmen tracked.</Text>}
        </View>

        <View style={styles.tableBlock}>
          <Text style={styles.tableHeader}>Bowlers</Text>
          {Object.entries(innings.bowlerStats).map(([name, stats]) => (
            <View key={name} style={styles.tableRow}>
              <Text style={styles.tableCellName}>{name}</Text>
              <Text style={styles.tableCellScore}>
                O: {Math.floor(stats.balls/6)}.{stats.balls%6} | R: {stats.runs} | W: {stats.wickets}
              </Text>
            </View>
          ))}
          {Object.keys(innings.bowlerStats).length === 0 && <Text style={styles.emptyTable}>No bowlers tracked.</Text>}
        </View>
        
        <View style={styles.tableBlock}>
          <Text style={styles.tableHeader}>Fall of Wickets</Text>
          {innings.fowLogs && innings.fowLogs.length > 0 ? (
             innings.fowLogs.map(fow => (
               <View key={fow.id} style={styles.fowRow}>
                 <Text style={styles.fowWicketNum}>{fow.score}-{fow.wicketNumber}</Text>
                 <Text style={styles.fowPlayer}>{fow.batsmanOut}</Text>
                 <Text style={styles.fowPartnership}>Pship: {fow.partnershipRuns}</Text>
               </View>
             ))
          ) : (
            <Text style={styles.emptyTimeline}>No wickets fell in this innings.</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Match History</Text>
        {matchHistory.length > 0 && (
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.actionBtn, isSelectMode && styles.actionBtnActive]} 
              onPress={() => {
                setIsSelectMode(!isSelectMode);
                setSelectedIds([]);
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={22} color={isSelectMode ? "#2196f3" : "#fff"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsClearModalVisible(true)} style={styles.actionBtnClear}>
              <Ionicons name="trash-outline" size={22} color="#f44336" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {matchHistory.length === 0 ? (
        <Text style={styles.emptyText}>No matches have been completed yet. Play some matches to see your history!</Text>
      ) : (
        <FlatList
          data={matchHistory}
          keyExtractor={item => item.id}
          contentContainerStyle={{paddingBottom: 80}}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.date}>{item.date}</Text>
                {isSelectMode && (
                  <TouchableOpacity onPress={() => toggleSelection(item.id)}>
                    <Ionicons 
                      name={selectedIds.includes(item.id) ? "checkbox" : "square-outline"} 
                      size={24} 
                      color={selectedIds.includes(item.id) ? "#2196f3" : "#888"} 
                    />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.match}>{item.match}</Text>
              <Text style={styles.result}>{item.result}</Text>
              
              {!isSelectMode && (
                <TouchableOpacity style={styles.detailsBtn} onPress={() => setSelectedMatch(item)}>
                  <Text style={styles.detailsBtnText}>View Full Scorecard</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}

      {/* Floating Action Bar for Deletion */}
      {isSelectMode && selectedIds.length > 0 && (
         <View style={styles.floatingActionBar}>
           <Text style={styles.floatingText}>{selectedIds.length} Selected</Text>
           <TouchableOpacity style={styles.floatingDeleteBtn} onPress={handleDeleteSelected}>
             <Text style={styles.floatingDeleteText}>Delete</Text>
             <Ionicons name="trash" size={18} color="#fff" />
           </TouchableOpacity>
         </View>
      )}

      {/* Web-Safe Clear Confirmation Modal */}
      <Modal visible={isClearModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
           <View style={styles.alertContent}>
             <Ionicons name="warning" size={40} color="#f44336" style={{marginBottom: 10}} />
             <Text style={styles.alertTitle}>Clear History</Text>
             <Text style={styles.alertMessage}>Are you sure you want to delete all match history? This action cannot be undone.</Text>
             <View style={styles.alertActions}>
               <TouchableOpacity style={[styles.alertBtn, styles.alertCancelBtn]} onPress={() => setIsClearModalVisible(false)}>
                 <Text style={styles.alertCancelText}>Cancel</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.alertBtn, styles.alertDeleteBtn]} onPress={confirmClearHistory}>
                 <Text style={styles.alertDeleteText}>Delete All</Text>
               </TouchableOpacity>
             </View>
           </View>
        </View>
      </Modal>

      {/* Match Details Deep Scorecard Modal */}
      <Modal visible={!!selectedMatch} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Match Scorecard</Text>
              <TouchableOpacity onPress={() => setSelectedMatch(null)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>{selectedMatch?.match}</Text>
            <Text style={styles.modalResult}>{selectedMatch?.result}</Text>

            <ScrollView style={{marginTop: 10}} showsVerticalScrollIndicator={false}>
              {renderInningsTable(selectedMatch?.innings1, "1st Innings")}
              {selectedMatch?.innings2 && <View style={styles.inningsDivider} />}
              {renderInningsTable(selectedMatch?.innings2, "2nd Innings")}
              
              {(!selectedMatch?.innings1 && !selectedMatch?.innings2) && (
                 <Text style={styles.emptyTimeline}>Legacy match data detected. No detailed scorecard available.</Text>
              )}
            </ScrollView>
            
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerActions: { flexDirection: 'row', gap: 10 },
  actionBtn: { padding: 8, backgroundColor: '#2a2a2a', borderRadius: 8 },
  actionBtnActive: { backgroundColor: 'rgba(33, 150, 243, 0.2)' },
  actionBtnClear: { padding: 8, backgroundColor: 'rgba(244, 67, 54, 0.1)', borderRadius: 8 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 50, fontSize: 16 },
  card: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  date: { color: '#888', fontSize: 12 },
  match: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  result: { color: '#4caf50', fontSize: 14, fontWeight: '600', marginBottom: 15 },
  detailsBtn: { backgroundColor: '#2a2a2a', paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#444' },
  detailsBtnText: { color: '#2196f3', fontWeight: 'bold', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1e1e1e', borderRadius: 15, padding: 20, maxHeight: '90%' },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#ef5350' },
  modalSubtitle: { fontSize: 16, color: '#fff', fontWeight: '600', marginTop: 5 },
  modalResult: { fontSize: 14, color: '#4caf50', marginTop: 2, marginBottom: 10 },
  inningsSection: { marginVertical: 10 },
  inningsTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  inningsScore: { color: '#ef5350', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  inningsDivider: { height: 1, backgroundColor: '#333', marginVertical: 20 },
  tableBlock: { backgroundColor: '#252525', borderRadius: 10, padding: 15, marginBottom: 15 },
  tableHeader: { color: '#2196f3', fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase', marginBottom: 10, letterSpacing: 1 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#333', paddingVertical: 8 },
  tableCellName: { color: '#fff', fontSize: 14, flex: 1 },
  tableCellScore: { color: '#bbb', fontSize: 14, fontWeight: 'bold' },
  fowRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#333', paddingVertical: 10 },
  fowWicketNum: { color: '#f44336', fontWeight: 'bold', fontSize: 14, width: 60 },
  fowPlayer: { color: '#fff', fontSize: 14, flex: 1 },
  fowPartnership: { color: '#888', fontSize: 13, width: 80, textAlign: 'right' },
  emptyTable: { color: '#666', fontStyle: 'italic', fontSize: 13, marginTop: 5 },
  emptyTimeline: { color: '#888', textAlign: 'center', fontStyle: 'italic', marginVertical: 10 },
  alertContent: { backgroundColor: '#1e1e1e', borderRadius: 15, padding: 25, alignItems: 'center' },
  alertTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  alertMessage: { color: '#bbb', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  alertActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 15 },
  alertBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  alertCancelBtn: { backgroundColor: '#333' },
  alertDeleteBtn: { backgroundColor: '#f44336' },
  alertCancelText: { color: '#fff', fontWeight: 'bold' },
  alertDeleteText: { color: '#fff', fontWeight: 'bold' },
  floatingActionBar: { position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: '#2a2a2a', borderRadius: 12, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#444', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
  floatingText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  floatingDeleteBtn: { backgroundColor: '#f44336', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  floatingDeleteText: { color: '#fff', fontWeight: 'bold' }
});
