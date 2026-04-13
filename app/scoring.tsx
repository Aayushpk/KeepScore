import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTeams } from './context/TeamsContext';
import { useMatchHistory } from './context/MatchHistoryContext';
import Ionicons from '@expo/vector-icons/Ionicons';

type BatsmanStat = { runs: number; balls: number };
type BowlerStat = { balls: number; runs: number; wickets: number };
type HistoryLog = { id: string; over: number; bowler: string; runsInOver: number; currentScore: string };
import { FowLogItem } from './context/MatchHistoryContext';

export default function ScoringScreen() {
  const router = useRouter();
  const { battingTeamName, bowlingTeamName, overs, result, matchId } = useLocalSearchParams();
  const { teams } = useTeams();
  const { addMatchToHistory, updateActiveMatch, clearActiveMatch } = useMatchHistory();

  // Innings and Main State
  const [innings, setInnings] = useState<number>(1);
  const [targetScore, setTargetScore] = useState<number | null>(null);
  
  const [currentBattingTeamName, setCurrentBattingTeamName] = useState<string>(String(battingTeamName));
  const [currentBowlingTeamName, setCurrentBowlingTeamName] = useState<string>(String(bowlingTeamName));

  const battingTeam = teams.find(t => t.name === currentBattingTeamName);
  const bowlingTeam = teams.find(t => t.name === currentBowlingTeamName);

  // Score State
  const [totalRuns, setTotalRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [balls, setBalls] = useState(0);
  const [currentOver, setCurrentOver] = useState<string[]>([]);
  const [currentOverRuns, setCurrentOverRuns] = useState(0);
  
  // Players State
  const [striker, setStriker] = useState<string | null>(null);
  const [nonStriker, setNonStriker] = useState<string | null>(null);
  const [bowler, setBowler] = useState<string | null>(null);
  const [previousBowler, setPreviousBowler] = useState<string | null>(null);
  const [battedPlayers, setBattedPlayers] = useState<string[]>([]);
  
  // Individual Stats
  const [batsmanStats, setBatsmanStats] = useState<Record<string, BatsmanStat>>({});
  const [bowlerStats, setBowlerStats] = useState<Record<string, BowlerStat>>({});

  // History State
  const [historyLog, setHistoryLog] = useState<HistoryLog[]>([]);
  const [fowLogs, setFowLogs] = useState<FowLogItem[]>([]);
  const [currentPartnershipRuns, setCurrentPartnershipRuns] = useState(0);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  // Modals Visibility
  const [pickerModalMode, setPickerModalMode] = useState<'striker' | 'nonStriker' | 'bowler' | null>(null);
  const [isOverCompleteVisible, setIsOverCompleteVisible] = useState(false);
  const [isInningsCompleteVisible, setIsInningsCompleteVisible] = useState(false);
  const [isWagonWheelVisible, setIsWagonWheelVisible] = useState(false);
  const [pendingRun, setPendingRun] = useState<number | null>(null);

  // Calculated Rules
  const maxWickets = battingTeam ? Math.max(battingTeam.players.length - 1, 1) : 10;
  const totalOvers = parseInt(String(overs)) || 20;

  const oversBowled = Math.floor(balls / 6);
  const ballsInOver = balls % 6;

  // Dual Innings History Caching
  const [firstInningsData, setFirstInningsData] = useState<any>(null);

  // Structural UI Lock out
  const isProcessing = (balls > 0 && balls % 6 === 0 && currentOver.length > 0) || isOverCompleteVisible || isInningsCompleteVisible;

  // Master State Reset upon New Match
  useEffect(() => {
    if (matchId) {
      setInnings(1);
      setTargetScore(null);
      setCurrentBattingTeamName(String(battingTeamName));
      setCurrentBowlingTeamName(String(bowlingTeamName));
      setTotalRuns(0);
      setWickets(0);
      setBalls(0);
      setCurrentOver([]);
      setCurrentOverRuns(0);
      setStriker(null);
      setNonStriker(null);
      setBowler(null);
      setPreviousBowler(null);
      setBattedPlayers([]);
      setBatsmanStats({});
      setBowlerStats({});
      setHistoryLog([]);
      setFowLogs([]);
      setCurrentPartnershipRuns(0);
      setIsHistoryVisible(false);
      setPickerModalMode(null);
      setIsOverCompleteVisible(false);
      setIsInningsCompleteVisible(false);
      setFirstInningsData(null);
    }
  }, [matchId, battingTeamName, bowlingTeamName]);

  // Sync globally to Live Context
  useEffect(() => {
    if (battingTeam && bowlingTeam) {
      updateActiveMatch({
        battingTeamName: currentBattingTeamName,
        bowlingTeamName: currentBowlingTeamName,
        totalRuns,
        wickets,
        oversBowled,
        ballsInOver,
        targetScore,
        innings,
        batsmanStats,
        bowlerStats,
        historyLog,
        fowLogs,
        firstInningsData
      });
    }
  }, [totalRuns, wickets, balls, innings, currentBattingTeamName]);

  // Initialize pickers if empty
  useEffect(() => {
    if (battingTeam && bowlingTeam) {
      if (!striker) setPickerModalMode('striker');
      else if (!nonStriker) setPickerModalMode('nonStriker');
      else if (!bowler) setPickerModalMode('bowler');
    }
  }, [striker, nonStriker, bowler]);

  // Check end of innings
  useEffect(() => {
    if (wickets >= maxWickets || (oversBowled >= totalOvers && ballsInOver === 0 && balls > 0)) {
      if (!isInningsCompleteVisible && !isOverCompleteVisible) {
        setIsInningsCompleteVisible(true);
      }
    }
    if (targetScore && totalRuns >= targetScore) {
      setIsInningsCompleteVisible(true);
    }
  }, [totalRuns, wickets, balls]);

  const checkEndOver = (currentBalls: number, currentWickets: number) => {
    if (currentWickets >= maxWickets) return;
    if (currentBalls >= totalOvers * 6 && currentBalls > 0) return;
    if (targetScore && totalRuns >= targetScore) return;

    if (currentBalls % 6 === 0 && currentBalls > 0) {
      setTimeout(() => {
        setIsOverCompleteVisible(true);
      }, 500);
    }
  };

  const initBatsman = (name: string) => {
    setBatsmanStats(prev => ({ ...prev, [name]: prev[name] || { runs: 0, balls: 0, wagonWheel: {} } }));
  };

  const initBowler = (name: string) => {
    setBowlerStats(prev => ({ ...prev, [name]: prev[name] || { balls: 0, runs: 0, wickets: 0 } }));
  };

  const handleRun = (run: number) => {
    if (isProcessing) return;
    if (!striker || !nonStriker || !bowler) return Alert.alert('Action Required', 'Select all players first!');
    
    setPendingRun(run);
    setIsWagonWheelVisible(true);
  };

  const commitRun = (region: string) => {
    if (pendingRun === null || !striker || !nonStriker || !bowler) return;
    const run = pendingRun;
    
    setIsWagonWheelVisible(false);
    setPendingRun(null);

    initBatsman(striker);
    initBowler(bowler);

    setTotalRuns(prev => prev + run);
    setBalls(prev => prev + 1);
    setCurrentOverRuns(prev => prev + run);
    setCurrentPartnershipRuns(prev => prev + run);
    setCurrentOver(prev => [...prev, run.toString()]);
    
    // Stats Update
    setBatsmanStats(prev => {
      const p = prev[striker];
      const newWagon = { ...(p.wagonWheel || {}) };
      newWagon[region] = (newWagon[region] || 0) + 1;
      return { 
        ...prev, 
        [striker]: { runs: p.runs + run, balls: p.balls + 1, wagonWheel: newWagon } 
      };
    });
    setBowlerStats(prev => ({ ...prev, [bowler]: { ...prev[bowler], runs: prev[bowler].runs + run, balls: prev[bowler].balls + 1 } }));

    if (run % 2 !== 0) {
      setStriker(nonStriker);
      setNonStriker(striker);
    }
    checkEndOver(balls + 1, wickets);
  };

  const handleExtra = (extra: string, runVal: number, legalBall: boolean) => {
    if (isProcessing) return;
    if (!striker || !nonStriker || !bowler) return;
    initBatsman(striker);
    initBowler(bowler);

    setTotalRuns(prev => prev + runVal);
    if (legalBall) setBalls(prev => prev + 1);
    setCurrentOverRuns(prev => prev + runVal);
    setCurrentPartnershipRuns(prev => prev + runVal);
    setCurrentOver(prev => [...prev, extra]);
    
    // Stats Mapping
    if (extra === 'Wd') {
      setBowlerStats(prev => ({ ...prev, [bowler]: { ...prev[bowler], runs: prev[bowler].runs + runVal } }));
    } else if (extra === 'Nb') {
      setBowlerStats(prev => ({ ...prev, [bowler]: { ...prev[bowler], runs: prev[bowler].runs + runVal } }));
      setBatsmanStats(prev => ({ ...prev, [striker]: { ...prev[striker], balls: prev[striker].balls + 1 } }));
    } else if (extra === 'Lb' || extra === 'B') {
      setBatsmanStats(prev => ({ ...prev, [striker]: { ...prev[striker], balls: prev[striker].balls + 1 } }));
      if (legalBall) {
         setBowlerStats(prev => ({ ...prev, [bowler]: { ...prev[bowler], balls: prev[bowler].balls + 1 } }));
      }
    }

    if (runVal % 2 !== 0 && (extra === 'Lb' || extra === 'B')) {
      setStriker(nonStriker);
      setNonStriker(striker);
    }
    
    if (legalBall) checkEndOver(balls + 1, wickets);
  };

  const handleWicket = () => {
    if (isProcessing) return;
    if (!striker || !nonStriker || !bowler) return;
    initBatsman(striker);
    initBowler(bowler);

    setWickets(prev => prev + 1);
    setBalls(prev => prev + 1);
    setCurrentOver(prev => [...prev, 'W']);
    
    setBatsmanStats(prev => ({ ...prev, [striker]: { ...prev[striker], balls: prev[striker].balls + 1 } }));
    setBowlerStats(prev => ({ ...prev, [bowler]: { ...prev[bowler], balls: prev[bowler].balls + 1, wickets: prev[bowler].wickets + 1 } }));

    setFowLogs(prev => [...prev, {
      id: Date.now().toString(),
      wicketNumber: wickets + 1,
      score: totalRuns,
      batsmanOut: striker,
      partnershipRuns: currentPartnershipRuns
    }]);
    setCurrentPartnershipRuns(0);

    setBattedPlayers(prev => [...prev, striker]);
    setStriker(null);

    // After wicket, evaluate next over popups but with +1 wickets explicitly checked
    checkEndOver(balls + 1, wickets + 1);
  };

  const startNextOver = () => {
    if (bowler) {
      const strikerStat = striker && batsmanStats[striker] ? `${striker}: ${batsmanStats[striker].runs}(${batsmanStats[striker].balls})` : '';
      const nonStrikerStat = nonStriker && batsmanStats[nonStriker] ? `${nonStriker}: ${batsmanStats[nonStriker].runs}(${batsmanStats[nonStriker].balls})` : '';

      setHistoryLog(prev => [{
        id: Date.now().toString(),
        over: oversBowled,
        bowler: bowler,
        runsInOver: currentOverRuns,
        currentScore: `${totalRuns}/${wickets} | ${strikerStat} | ${nonStrikerStat}`
      }, ...prev]);
    }

    setIsOverCompleteVisible(false);
    setCurrentOver([]);
    setCurrentOverRuns(0);
    setPreviousBowler(bowler);
    setBowler(null);
    
    const temp = striker;
    setStriker(nonStriker);
    setNonStriker(temp);
    
    setPickerModalMode('bowler');
  };

  const startNextInnings = () => {
    if (innings === 1) {
      setFirstInningsData({
        teamName: currentBattingTeamName,
        totalRuns,
        wickets,
        batsmanStats,
        bowlerStats,
        timeline: historyLog,
        fowLogs: fowLogs
      });

      setTargetScore(totalRuns + 1);
      setInnings(2);
      setCurrentBattingTeamName(String(bowlingTeamName));
      setCurrentBowlingTeamName(String(battingTeamName));
      setTotalRuns(0);
      setWickets(0);
      setBalls(0);
      setCurrentOver([]);
      setCurrentOverRuns(0);
      setStriker(null);
      setNonStriker(null);
      setBowler(null);
      setPreviousBowler(null);
      setBattedPlayers([]);
      setBatsmanStats({});
      setBowlerStats({});
      setHistoryLog([]);
      setFowLogs([]);
      setCurrentPartnershipRuns(0);
      setIsInningsCompleteVisible(false);
    } else {
      let resultText = '';
      if (totalRuns >= (targetScore || 0)) {
        resultText = `${currentBattingTeamName} won by ${Math.max(1, maxWickets - wickets)} wickets!`;
      } else if (totalRuns === (targetScore || 0) - 1) {
        resultText = 'Match Tied!';
      } else {
        resultText = `${currentBowlingTeamName} won by ${(targetScore || 0) - 1 - totalRuns} runs!`;
      }

      addMatchToHistory({
        match: `${String(battingTeamName)} vs ${String(bowlingTeamName)}`,
        result: resultText,
        innings1: firstInningsData,
        innings2: {
          teamName: currentBattingTeamName,
          totalRuns,
          wickets,
          batsmanStats,
          bowlerStats,
          timeline: historyLog,
          fowLogs: fowLogs
        }
      });

      clearActiveMatch();
      setIsInningsCompleteVisible(false);
      router.replace('/');
    }
  };

  const handlePlayerSelect = (playerName: string) => {
    if (pickerModalMode === 'striker') setStriker(playerName);
    else if (pickerModalMode === 'nonStriker') setNonStriker(playerName);
    else if (pickerModalMode === 'bowler') setBowler(playerName);
    setPickerModalMode(null);
  };

  if (!battingTeam || !bowlingTeam) {
    return <View style={styles.container}><Text style={{color:'#fff', marginTop:50, textAlign:'center'}}>Invalid Match Setup.</Text></View>;
  }

  const renderOverTimeline = () => {
    const slots = [...currentOver];
    while (slots.length < 6) slots.push('-');
    return (
      <View style={styles.overStrip}>
        <Text style={styles.overStripLabel}>This Over:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.overBallsRow}>
          {slots.map((s, idx) => (
            <View key={idx} style={[styles.ballCircle, s === 'W' && styles.ballWicket, s === '4' || s === '6' ? styles.ballBoundary : null]}>
              <Text style={[styles.ballText, s === 'W' && styles.ballTextWicket, s === '4' || s === '6' ? styles.ballTextBoundary : null]}>{s}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const availableBatterList = battingTeam.players.filter(p => p !== striker && p !== nonStriker && !battedPlayers.includes(p));
  const availableBowlerList = bowlingTeam.players.filter(p => p !== previousBowler);

  const renderInningsTable = (inningData: any, title: string) => {
    if (!inningData) return null;
    return (
      <View style={{ marginVertical: 10 }}>
        <Text style={styles.inningsTitle}>{title} - {inningData.teamName}</Text>
        <Text style={styles.inningsScore}>{inningData.totalRuns} / {inningData.wickets}</Text>
        
        <View style={styles.tableBlock}>
          <Text style={styles.tableHeader}>Batsmen</Text>
          {Object.entries(inningData.batsmanStats).map(([name, stats]: any) => (
            <View key={name} style={styles.tableRow}>
              <Text style={styles.tableCellName}>{name}</Text>
              <Text style={styles.tableCellScore}>{stats.runs} ({stats.balls})</Text>
            </View>
          ))}
          {Object.keys(inningData.batsmanStats).length === 0 && <Text style={{color: '#666', fontStyle: 'italic', fontSize: 13, marginTop: 5}}>No batsmen tracked.</Text>}
        </View>

        <View style={styles.tableBlock}>
          <Text style={styles.tableHeader}>Bowlers</Text>
          {Object.entries(inningData.bowlerStats).map(([name, stats]: any) => (
            <View key={name} style={styles.tableRow}>
              <Text style={styles.tableCellName}>{name}</Text>
              <Text style={styles.tableCellScore}>
                O: {Math.floor(stats.balls/6)}.{stats.balls%6} | R: {stats.runs} | W: {stats.wickets}
              </Text>
            </View>
          ))}
          {Object.keys(inningData.bowlerStats).length === 0 && <Text style={{color: '#666', fontStyle: 'italic', fontSize: 13, marginTop: 5}}>No bowlers tracked.</Text>}
        </View>
        
        <View style={styles.tableBlock}>
          <Text style={styles.tableHeader}>Fall of Wickets</Text>
          {inningData.fowLogs && inningData.fowLogs.length > 0 ? (
             inningData.fowLogs.map((fow: any) => (
               <View key={fow.id} style={styles.fowRow}>
                 <Text style={styles.fowWicketNum}>{fow.score}-{fow.wicketNumber}</Text>
                 <Text style={styles.fowPlayer}>{fow.batsmanOut}</Text>
                 <Text style={styles.fowPartnership}>Pship: {fow.partnershipRuns}</Text>
               </View>
             ))
          ) : (
            <Text style={{color: '#888', textAlign: 'center', fontStyle: 'italic', marginVertical: 10}}>No wickets fell yet.</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
             <Text style={styles.teamTitle}>{currentBattingTeamName} vs {currentBowlingTeamName}</Text>
             <TouchableOpacity style={styles.historyBtn} onPress={() => setIsHistoryVisible(true)}>
               <Ionicons name="time-outline" size={26} color="#4caf50" />
             </TouchableOpacity>
          </View>
          <Text style={styles.targetInfo}>{innings === 1 ? result : `Target: ${targetScore}`}</Text>
        </View>

        <View style={styles.scoreboardArea}>
          <Text style={styles.mainScore}>{totalRuns}/{wickets}</Text>
          <Text style={styles.overCount}>Overs: {oversBowled}.{ballsInOver} / {totalOvers}</Text>
          <Text style={styles.currRR}>CRR: {balls > 0 ? ((totalRuns / (balls / 6))).toFixed(2) : '0.00'}</Text>
        </View>

        <View style={styles.playersArea}>
          <TouchableOpacity style={styles.batterRow} onPress={() => setPickerModalMode('striker')}>
            <Text style={styles.playerRole}>Striker 🏏</Text>
            <Text style={styles.playerName}>{striker || 'Tap to select...'}</Text>
            {striker && batsmanStats[striker] && (
              <Text style={styles.playerStats}>{batsmanStats[striker].runs} ({batsmanStats[striker].balls})</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.batterRow} onPress={() => setPickerModalMode('nonStriker')}>
            <Text style={styles.playerRole}>Non-Striker</Text>
            <Text style={styles.playerName}>{nonStriker || 'Tap to select...'}</Text>
            {nonStriker && batsmanStats[nonStriker] && (
              <Text style={styles.playerStats}>{batsmanStats[nonStriker].runs} ({batsmanStats[nonStriker].balls})</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.bowlerRow} onPress={() => setPickerModalMode('bowler')}>
            <Text style={styles.playerRole}>Bowler 🔴</Text>
            <Text style={styles.playerName}>{bowler || 'Tap to select...'}</Text>
            {bowler && bowlerStats[bowler] && (
              <Text style={styles.playerStats}>
                O: {Math.floor(bowlerStats[bowler].balls/6)}.{bowlerStats[bowler].balls%6} | R: {bowlerStats[bowler].runs} | W: {bowlerStats[bowler].wickets}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {renderOverTimeline()}

        {/* Control Pad */}
        <View style={styles.controlPad}>
          <View style={styles.runsGrid}>
             {[0,1,2,3,4,6].map(r => (
               <TouchableOpacity key={r} style={[styles.runBtn, r===4||r===6 ? styles.boundaryBtn : null]} onPress={() => handleRun(r)}>
                 <Text style={[styles.runBtnText, r===4||r===6 ? styles.boundaryText : null]}>{r}</Text>
               </TouchableOpacity>
             ))}
          </View>
          
          <View style={styles.extrasRow}>
            <TouchableOpacity style={styles.extraBtn} onPress={() => handleExtra('Wd', 1, false)}>
              <Text style={styles.extraText}>Wide</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.extraBtn} onPress={() => handleExtra('Nb', 1, false)}>
              <Text style={styles.extraText}>No Ball</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.extraBtn} onPress={() => handleExtra('Lb', 1, true)}>
              <Text style={styles.extraText}>Leg Bye</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.extraBtn} onPress={() => handleExtra('B', 1, true)}>
              <Text style={styles.extraText}>Bye</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.wicketBtn} onPress={handleWicket}>
              <Text style={styles.wicketText}>WICKET</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Player Picker Modal */}
      <Modal visible={!!pickerModalMode} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>
              Select {pickerModalMode === 'bowler' ? 'Bowler' : 'Batsman'}
            </Text>
            <FlatList
              data={pickerModalMode === 'bowler' ? availableBowlerList : availableBatterList}
              keyExtractor={item => item}
              renderItem={({item}) => (
                <TouchableOpacity style={styles.pickerItem} onPress={() => handlePlayerSelect(item)}>
                  <Text style={styles.pickerItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            {pickerModalMode !== 'bowler' && availableBatterList.length === 0 && (
               <Text style={{color: '#888', textAlign: 'center', marginTop: 20}}>No players remaining.</Text>
            )}
            {pickerModalMode === 'bowler' && availableBowlerList.length === 0 && (
               <Text style={{color: '#888', textAlign: 'center', marginTop: 20}}>No other bowlers available.</Text>
            )}
            <TouchableOpacity style={styles.cancelPickerBtn} onPress={() => setPickerModalMode(null)}>
              <Text style={styles.cancelPickerText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Match Scorecard Modal (Formerly Timeline) */}
      <Modal visible={isHistoryVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.pickerContent, {maxHeight: '90%', marginTop: 'auto'}]}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
               <Text style={[styles.pickerTitle, {marginBottom: 0}]}>Match Scorecard</Text>
               <TouchableOpacity onPress={() => setIsHistoryVisible(false)}>
                 <Ionicons name="close" size={28} color="#fff" />
               </TouchableOpacity>
            </View>

            <View style={styles.liveTimelineHeader}>
              <Text style={{color: '#4caf50', fontWeight: 'bold'}}>LIVE: Over {oversBowled}.{ballsInOver}</Text>
              {striker && <Text style={{color: '#bbb', fontSize: 13, marginTop: 5}}>{striker}: {batsmanStats[striker]?.runs || 0}({batsmanStats[striker]?.balls || 0})</Text>}
              {nonStriker && <Text style={{color: '#bbb', fontSize: 13}}>{nonStriker}: {batsmanStats[nonStriker]?.runs || 0}({batsmanStats[nonStriker]?.balls || 0})</Text>}
              {bowler && <Text style={{color: '#ef5350', fontSize: 13, marginTop: 5}}>{bowler}: {currentOverRuns} Runs given</Text>}
              {(!striker && !bowler) && <Text style={{color: '#bbb', fontSize: 13, marginTop: 5}}>Match Setup Phase</Text>}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{marginBottom: 15}}>
               {innings === 1 ? (
                 <>
                   {renderInningsTable({ teamName: currentBattingTeamName, totalRuns, wickets, batsmanStats, bowlerStats, fowLogs }, "1st Innings")}
                   <View style={styles.inningsDivider} />
                   <View style={styles.inningsSection}>
                     <Text style={[styles.inningsTitle, {color: '#888'}]}>2nd Innings - {currentBowlingTeamName}</Text>
                     <Text style={{color: '#666', fontStyle: 'italic', marginTop: 5}}>(Yet to Bat)</Text>
                   </View>
                 </>
               ) : (
                 <>
                   {renderInningsTable(firstInningsData, "1st Innings")}
                   <View style={styles.inningsDivider} />
                   {renderInningsTable({ teamName: currentBattingTeamName, totalRuns, wickets, batsmanStats, bowlerStats, fowLogs }, "2nd Innings")}
                 </>
               )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Over Complete Modal */}
      <Modal visible={isOverCompleteVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>Over Completed</Text>
            <Text style={styles.summarySubtitle}>Score: {totalRuns}/{wickets}</Text>
            <TouchableOpacity style={styles.proceedBtn} onPress={startNextOver}>
              <Text style={styles.proceedBtnText}>Start Next Over</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Innings Complete Modal */}
      <Modal visible={isInningsCompleteVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>{innings === 1 ? 'Innings Complete!' : 'Match Complete!'}</Text>
            <Text style={styles.summarySubtitle}>{currentBattingTeamName}: {totalRuns}/{wickets}</Text>
            {innings === 1 ? (
              <Text style={styles.targetText}>Target: {totalRuns + 1}</Text>
            ) : (
              <Text style={styles.matchWinnerResult}>
                {totalRuns >= (targetScore || 0) 
                  ? `${currentBattingTeamName} won by ${Math.max(1, maxWickets - wickets)} wickets!` 
                  : totalRuns === (targetScore || 0) - 1 
                    ? 'Match Tied!' 
                    : `${currentBowlingTeamName} won by ${(targetScore || 0) - 1 - totalRuns} runs!`}
              </Text>
            )}
            <TouchableOpacity style={styles.proceedBtn} onPress={startNextInnings}>
              <Text style={styles.proceedBtnText}>{innings === 1 ? 'Start 2nd Innings' : 'Finish Match'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Wagon Wheel Modal */}
      <Modal visible={isWagonWheelVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.pickerContent, { alignItems: 'center' }]}>
            <Text style={styles.pickerTitle}>Select Shot Region</Text>
            <View style={styles.wheelArea}>
              {/* Pizza Slices Background Lines */}
              <View style={styles.sliceLine} />
              <View style={[styles.sliceLine, { transform: [{ rotate: '45deg' }] }]} />
              <View style={[styles.sliceLine, { transform: [{ rotate: '90deg' }] }]} />
              <View style={[styles.sliceLine, { transform: [{ rotate: '135deg' }] }]} />
              
              <View style={styles.pitchCenter} />
              
              {[
                { name: 'Third Man', angle: 225 },
                { name: 'Point', angle: 270 },
                { name: 'Cover', angle: 315 },
                { name: 'Mid Off', angle: 340 },
                { name: 'Straight', angle: 0 },
                { name: 'Mid On', angle: 20 },
                { name: 'Mid Wicket', angle: 45 },
                { name: 'Square Leg', angle: 90 },
                { name: 'Fine Leg', angle: 135 }
              ].map(reg => {
                const r = (reg.angle - 90) * Math.PI / 180;
                const radius = 95;
                const left = 140 + radius * Math.cos(r) - 43; // 86 width / 2
                const top = 140 + radius * Math.sin(r) - 20; // 40 height / 2
                return (
                  <TouchableOpacity key={reg.name} style={[styles.wheelBtn, {left, top}]} onPress={() => commitRun(reg.name)}>
                     <Text style={styles.wheelText} numberOfLines={1}>{reg.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={{color: '#888', fontStyle: 'italic', marginTop: 20, fontSize: 13}}>Selecting a region records the {pendingRun} run(s).</Text>
            <TouchableOpacity style={[styles.cancelPickerBtn, {width: '100%'}]} onPress={() => { setIsWagonWheelVisible(false); setPendingRun(null); }}>
              <Text style={styles.cancelPickerText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  scrollContent: { paddingBottom: 50 },
  header: { backgroundColor: '#1a1a1a', padding: 20, borderBottomWidth: 1, borderBottomColor: '#333', alignItems: 'center' },
  teamTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  historyBtn: { position: 'absolute', right: 0, padding: 5 },
  historyEmoji: { fontSize: 24 },
  targetInfo: { color: '#4caf50', fontSize: 14, marginTop: 4, textAlign: 'center', fontWeight: '500' },
  scoreboardArea: { alignItems: 'center', paddingVertical: 20 },
  mainScore: { fontSize: 68, fontWeight: 'bold', color: '#fff' },
  overCount: { fontSize: 20, color: '#aaa', marginTop: 5 },
  currRR: { fontSize: 14, color: '#888', marginTop: 5 },
  playersArea: { backgroundColor: '#1e1e1e', margin: 15, borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#333' },
  batterRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingVertical: 5 },
  bowlerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#333' },
  playerRole: { color: '#888', width: 90 },
  playerName: { color: '#fff', fontWeight: 'bold', flex: 1 },
  playerStats: { color: '#fff', fontWeight: '600' },
  overStrip: { marginHorizontal: 15, marginBottom: 20 },
  overStripLabel: { color: '#bbb', marginBottom: 10, fontWeight: '600', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 },
  overBallsRow: { flexDirection: 'row', gap: 8 },
  ballCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#4caf50', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(76, 175, 80, 0.05)', marginRight: 8 },
  ballBoundary: { borderColor: '#2196f3', backgroundColor: 'rgba(33, 150, 243, 0.1)' },
  ballWicket: { borderColor: '#f44336', backgroundColor: 'rgba(244, 67, 54, 0.1)' },
  ballText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  ballTextWicket: { color: '#f44336' },
  ballTextBoundary: { color: '#2196f3' },
  controlPad: { flex: 1, backgroundColor: '#1a1a1a', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, paddingTop: 25, marginTop: 'auto' },
  runsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 15 },
  runBtn: { width: '30%', backgroundColor: '#2a2a2a', paddingVertical: 18, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#444' },
  runBtnText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  boundaryBtn: { borderColor: '#2196f3', backgroundColor: 'rgba(33, 150, 243, 0.1)' },
  boundaryText: { color: '#2196f3' },
  extrasRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10 },
  extraBtn: { flex: 1, backgroundColor: '#333', paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  extraText: { color: '#bbb', fontWeight: '600', fontSize: 12 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 15, paddingBottom: 20 },
  wicketBtn: { flex: 1, backgroundColor: '#f44336', paddingVertical: 20, borderRadius: 12, alignItems: 'center', shadowColor: '#f44336', shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  wicketText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  pickerContent: { backgroundColor: '#1e1e1e', borderRadius: 15, padding: 20, maxHeight: '80%' },
  pickerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 15, textAlign: 'center' },
  pickerItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
  pickerItemText: { color: '#fff', fontSize: 16, textAlign: 'center' },
  cancelPickerBtn: { marginTop: 15, padding: 15, backgroundColor: '#333', borderRadius: 10, alignItems: 'center' },
  cancelPickerText: { color: '#ccc', fontSize: 16, fontWeight: 'bold' },
  liveTimelineHeader: { backgroundColor: '#2a2a2a', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
  historyItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, paddingBottom: 5 },
  historyDetailRow: { color: '#bbb', fontSize: 13, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
  historyOverLabel: { color: '#4caf50', fontWeight: 'bold', fontSize: 14, width: 60 },
  historyBowler: { color: '#fff', fontSize: 14, flex: 1 },
  historyScore: { color: '#ef5350', fontWeight: 'bold', fontSize: 14, width: 60, textAlign: 'right' },
  summaryContent: { backgroundColor: '#1e1e1e', borderRadius: 15, padding: 30, alignItems: 'center' },
  summaryTitle: { fontSize: 24, fontWeight: 'bold', color: '#ef5350', marginBottom: 10 },
  summarySubtitle: { fontSize: 18, color: '#fff', marginBottom: 20 },
  targetText: { fontSize: 22, color: '#4caf50', fontWeight: 'bold', marginBottom: 20 },
  matchWinnerResult: { fontSize: 20, color: '#2196f3', fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  proceedBtn: { backgroundColor: '#4caf50', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 10 },
  proceedBtnText: { color: '#121212', fontSize: 16, fontWeight: 'bold' },
  inningsSection: { marginVertical: 5 },
  inningsTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 2 },
  inningsScore: { color: '#ef5350', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  inningsDivider: { height: 1, backgroundColor: '#333', marginVertical: 15 },
  tableBlock: { backgroundColor: '#252525', borderRadius: 10, padding: 15, marginBottom: 15 },
  tableHeader: { color: '#2196f3', fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase', marginBottom: 10, letterSpacing: 1 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#333', paddingVertical: 8 },
  tableCellName: { color: '#fff', fontSize: 14, flex: 1 },
  tableCellScore: { color: '#bbb', fontSize: 14, fontWeight: 'bold' },
  fowRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#333', paddingVertical: 10 },
  fowWicketNum: { color: '#f44336', fontWeight: 'bold', fontSize: 14, width: 60 },
  fowPlayer: { color: '#fff', fontSize: 14, flex: 1 },
  fowPartnership: { color: '#888', fontSize: 13, width: 80, textAlign: 'right' },
  wheelArea: { width: 280, height: 280, borderRadius: 140, borderWidth: 3, borderColor: '#333', backgroundColor: '#111', marginTop: 10, overflow: 'hidden' },
  sliceLine: { position: 'absolute', top: 0, bottom: 0, left: 138, width: 2, backgroundColor: '#333' },
  pitchCenter: { position: 'absolute', width: 20, height: 60, backgroundColor: '#8d6e63', left: 129, top: 110, borderRadius: 4 },
  wheelBtn: { position: 'absolute', height: 40, width: 86, justifyContent: 'center', alignItems: 'center' },
  wheelText: { color: '#fff', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }
});
