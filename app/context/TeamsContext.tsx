import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Team = {
  id: string;
  name: string;
  players: string[];
};

type TeamsContextType = {
  teams: Team[];
  addTeam: (team: Omit<Team, 'id'>) => void;
  updateTeam: (updatedTeam: Team) => void;
  deleteTeam: (id: string) => void;
};

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export const TeamsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const storedTeams = await AsyncStorage.getItem('@teams_data');
      if (storedTeams) setTeams(JSON.parse(storedTeams));
    } catch (e) {
      console.error("Failed to load teams", e);
    }
  };

  const saveTeams = async (newTeams: Team[]) => {
    try {
      await AsyncStorage.setItem('@teams_data', JSON.stringify(newTeams));
    } catch (e) {
      console.error("Failed to save teams", e);
    }
  };

  const addTeam = (team: Omit<Team, 'id'>) => {
    if (teams.length >= 10) {
      alert('Maximum of 10 teams allowed.');
      return;
    }
    const newTeam: Team = { ...team, id: Date.now().toString() };
    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    saveTeams(updatedTeams);
  };

  const updateTeam = (updatedTeam: Team) => {
    const updatedTeams = teams.map(t => t.id === updatedTeam.id ? updatedTeam : t);
    setTeams(updatedTeams);
    saveTeams(updatedTeams);
  };

  const deleteTeam = (id: string) => {
    const updatedTeams = teams.filter(t => t.id !== id);
    setTeams(updatedTeams);
    saveTeams(updatedTeams);
  };

  return (
    <TeamsContext.Provider value={{ teams, addTeam, updateTeam, deleteTeam }}>
      {children}
    </TeamsContext.Provider>
  );
};

export const useTeams = () => {
  const context = useContext(TeamsContext);
  if (!context) throw new Error('useTeams must be used within TeamsProvider');
  return context;
};
