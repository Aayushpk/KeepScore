import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type HistoryLogItem = {
  id: string;
  over: number;
  bowler: string;
  runsInOver: number;
  currentScore: string;
};

export type FowLogItem = {
  id: string;
  wicketNumber: number;
  score: number;
  batsmanOut: string;
  partnershipRuns: number;
};

export type PlayerBatStats = { 
  runs: number; 
  balls: number;
  wagonWheel?: Record<string, number>;
};
export type PlayerBowlStats = { runs: number; balls: number; wickets: number };

export type InningsData = {
  teamName: string;
  totalRuns: number;
  wickets: number;
  batsmanStats: Record<string, PlayerBatStats>;
  bowlerStats: Record<string, PlayerBowlStats>;
  timeline: HistoryLogItem[];
  fowLogs: FowLogItem[];
};

export type MatchResult = {
  id: string;
  date: string;
  match: string;
  result: string;
  innings1?: InningsData;
  innings2?: InningsData;
};

export type ActiveMatchState = {
  battingTeamName: string;
  bowlingTeamName: string;
  totalRuns: number;
  wickets: number;
  oversBowled: number;
  ballsInOver: number;
  targetScore: number | null;
  innings: number;
  batsmanStats: Record<string, PlayerBatStats>;
  bowlerStats: Record<string, PlayerBowlStats>;
  historyLog: HistoryLogItem[];
  fowLogs: FowLogItem[];
  firstInningsData: any;
};

type MatchHistoryContextType = {
  matchHistory: MatchResult[];
  activeMatch: ActiveMatchState | null;
  addMatchToHistory: (match: Omit<MatchResult, 'id' | 'date'>) => void;
  deleteMatches: (ids: string[]) => Promise<void>;
  clearHistory: () => Promise<void>;
  updateActiveMatch: (state: ActiveMatchState) => void;
  clearActiveMatch: () => void;
  abandonMatch: () => void;
};

const MatchHistoryContext = createContext<MatchHistoryContextType | undefined>(undefined);

export const MatchHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [matchHistory, setMatchHistory] = useState<MatchResult[]>([]);
  const [activeMatch, setActiveMatch] = useState<ActiveMatchState | null>(null);

  useEffect(() => {
    loadHistory();
    loadActiveMatch();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('@match_history_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setMatchHistory(parsed);
        } else {
          setMatchHistory([]);
        }
      }
    } catch (e) {
      console.error("Failed to load match history:", e);
      setMatchHistory([]);
    }
  };

  const loadActiveMatch = async () => {
    try {
      const stored = await AsyncStorage.getItem('@active_match_data');
      if (stored) setActiveMatch(JSON.parse(stored));
    } catch (e) {
      console.error("Failed to load active match:", e);
    }
  };

  const updateActiveMatch = async (state: ActiveMatchState) => {
    setActiveMatch(state);
    try {
      await AsyncStorage.setItem('@active_match_data', JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save active match:", e);
    }
  };

  const clearActiveMatch = async () => {
    setActiveMatch(null);
    try {
      await AsyncStorage.removeItem('@active_match_data');
    } catch (e) {
      console.error("Failed to clear active match:", e);
    }
  };

  const saveHistory = async (newHistory: MatchResult[]) => {
    try {
      await AsyncStorage.setItem('@match_history_data', JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save match history", e);
    }
  };

  const addMatchToHistory = (match: Omit<MatchResult, 'id' | 'date'>) => {
    const newMatch: MatchResult = {
      ...match,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    const updatedHistory = [newMatch, ...matchHistory];
    setMatchHistory(updatedHistory);
    saveHistory(updatedHistory);
  };

  const deleteMatches = async (ids: string[]) => {
    const updatedHistory = matchHistory.filter(match => !ids.includes(match.id));
    setMatchHistory(updatedHistory);
    saveHistory(updatedHistory);
  };

  const abandonMatch = () => {
    if (!activeMatch) return;
    
    const abandonedInningsData: InningsData = {
      teamName: activeMatch.battingTeamName,
      totalRuns: activeMatch.totalRuns,
      wickets: activeMatch.wickets,
      batsmanStats: activeMatch.batsmanStats || {},
      bowlerStats: activeMatch.bowlerStats || {},
      timeline: activeMatch.historyLog || [],
      fowLogs: activeMatch.fowLogs || []
    };

    const newMatch: MatchResult = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      match: `${activeMatch.innings === 1 ? activeMatch.battingTeamName : activeMatch.bowlingTeamName} vs ${activeMatch.innings === 1 ? activeMatch.bowlingTeamName : activeMatch.battingTeamName}`,
      result: 'Match Abandoned',
      innings1: activeMatch.innings === 1 ? abandonedInningsData : activeMatch.firstInningsData,
      innings2: activeMatch.innings === 2 ? abandonedInningsData : undefined
    };

    const updatedHistory = [newMatch, ...matchHistory];
    setMatchHistory(updatedHistory);
    saveHistory(updatedHistory);
    clearActiveMatch();
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('@match_history_data');
      setMatchHistory([]);
    } catch (e) {
      console.error("Failed to clear", e);
    }
  };

  return (
    <MatchHistoryContext.Provider 
      value={{ 
        matchHistory, 
        activeMatch,
        addMatchToHistory, 
        deleteMatches, 
        clearHistory,
        updateActiveMatch,
        clearActiveMatch,
        abandonMatch
      }}
    >
      {children}
    </MatchHistoryContext.Provider>
  );
};

export const useMatchHistory = () => {
  const context = useContext(MatchHistoryContext);
  if (!context) throw new Error('useMatchHistory must be used within MatchHistoryProvider');
  return context;
};
