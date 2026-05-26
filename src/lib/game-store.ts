import { create } from 'zustand';

export type GameView = 
  | 'home' | 'create-team' | 'squad' | 'tactics' | 'transfers' 
  | 'match' | 'league' | 'training' | 'stadium' | 'settings';

export interface ManagerState {
  id: string;
  username: string;
  avatar: string;
  coins: number;
  gems: number;
  level: number;
  xp: number;
}

export interface TeamState {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  formation: string;
  morale: number;
  fanSupport: number;
}

export interface PlayerState {
  id: string;
  name: string;
  position: string;
  nationality: string;
  age: number;
  overall: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  stamina: number;
  morale: number;
  form: number;
  value: number;
  salary: number;
  isInjured: boolean;
  injuryWeeks: number;
  isOnTransfer: boolean;
  transferPrice: number | null;
  teamId: string;
}

export interface StadiumState {
  id: string;
  name: string;
  capacity: number;
  level: number;
  ticketPrice: number;
  facilities: number;
  youthAcademy: number;
  trainingGround: number;
  medicalCenter: number;
}

export interface LeagueStandingState {
  id: string;
  teamName: string;
  teamLogo: string;
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface MatchState {
  id: string;
  homeTeam: string;
  homeTeamLogo: string;
  awayTeam: string;
  awayTeamLogo: string;
  homeGoals: number;
  awayGoals: number;
  matchDay: number;
  isPlayed: boolean;
  events: string;
}

export interface TransferState {
  id: string;
  playerId: string;
  playerName: string;
  position: string;
  overall: number;
  askingPrice: number;
  sellerTeam: string;
}

export interface NotificationState {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface LiveMatchData {
  isLive: boolean;
  minute: number;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number;
  awayGoals: number;
  events: Array<{
    minute: number;
    type: string;
    team: string;
    playerName: string;
    description: string;
  }>;
  homeStats: {
    possession: number;
    shots: number;
    shotsOnTarget: number;
    corners: number;
    fouls: number;
  };
  awayStats: {
    possession: number;
    shots: number;
    shotsOnTarget: number;
    corners: number;
    fouls: number;
  };
}

interface GameState {
  // View management
  currentView: GameView;
  setView: (view: GameView) => void;

  // Data
  manager: ManagerState | null;
  team: TeamState | null;
  players: PlayerState[];
  stadium: StadiumState | null;
  leagueStandings: LeagueStandingState[];
  matches: MatchState[];
  transfers: TransferState[];
  notifications: NotificationState[];
  selectedPlayer: PlayerState | null;
  leagueLevel: number;
  currentMatchDay: number;
  totalMatchDays: number;

  // Match
  isMatchLive: boolean;
  liveMatchData: LiveMatchData | null;
  matchResult: LiveMatchData | null;

  // Loading
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  setManager: (manager: ManagerState) => void;
  setTeam: (team: TeamState) => void;
  setPlayers: (players: PlayerState[]) => void;
  setStadium: (stadium: StadiumState) => void;
  setLeagueStandings: (standings: LeagueStandingState[]) => void;
  setMatches: (matches: MatchState[]) => void;
  setTransfers: (transfers: TransferState[]) => void;
  setNotifications: (notifications: NotificationState[]) => void;
  setSelectedPlayer: (player: PlayerState | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsInitialized: (initialized: boolean) => void;
  setLeagueLevel: (level: number) => void;
  setCurrentMatchDay: (day: number) => void;
  setTotalMatchDays: (days: number) => void;
  setIsMatchLive: (live: boolean) => void;
  setLiveMatchData: (data: LiveMatchData | null) => void;
  setMatchResult: (data: LiveMatchData | null) => void;
  
  updateManagerCoins: (delta: number) => void;
  updateManagerGems: (delta: number) => void;
  updateManagerXP: (xp: number) => void;
  updatePlayer: (playerId: string, updates: Partial<PlayerState>) => void;
  
  loadGameState: () => Promise<void>;
  resetGame: () => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentView: 'home',
  manager: null,
  team: null,
  players: [],
  stadium: null,
  leagueStandings: [],
  matches: [],
  transfers: [],
  notifications: [],
  selectedPlayer: null,
  leagueLevel: 4,
  currentMatchDay: 1,
  totalMatchDays: 38,
  isMatchLive: false,
  liveMatchData: null,
  matchResult: null,
  isLoading: true,
  isInitialized: false,

  setView: (view) => set({ currentView: view }),
  setManager: (manager) => set({ manager }),
  setTeam: (team) => set({ team }),
  setPlayers: (players) => set({ players }),
  setStadium: (stadium) => set({ stadium }),
  setLeagueStandings: (standings) => set({ leagueStandings: standings }),
  setMatches: (matches) => set({ matches }),
  setTransfers: (transfers) => set({ transfers }),
  setNotifications: (notifications) => set({ notifications }),
  setSelectedPlayer: (player) => set({ selectedPlayer: player }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsInitialized: (initialized) => set({ isInitialized: initialized }),
  setLeagueLevel: (level) => set({ leagueLevel: level }),
  setCurrentMatchDay: (day) => set({ currentMatchDay: day }),
  setTotalMatchDays: (days) => set({ totalMatchDays: days }),
  setIsMatchLive: (live) => set({ isMatchLive: live }),
  setLiveMatchData: (data) => set({ liveMatchData: data }),
  setMatchResult: (data) => set({ matchResult: data }),

  updateManagerCoins: (delta) => set((state) => ({
    manager: state.manager ? { ...state.manager, coins: state.manager.coins + delta } : null,
  })),
  updateManagerGems: (delta) => set((state) => ({
    manager: state.manager ? { ...state.manager, gems: state.manager.gems + delta } : null,
  })),
  updateManagerXP: (xp) => set((state) => {
    if (!state.manager) return { manager: null };
    const newXP = state.manager.xp + xp;
    const xpForLevel = state.manager.level * 100;
    let newLevel = state.manager.level;
    let remainingXP = newXP;
    if (remainingXP >= xpForLevel) {
      newLevel++;
      remainingXP -= xpForLevel;
    }
    return { manager: { ...state.manager, xp: remainingXP, level: newLevel } };
  }),

  updatePlayer: (playerId, updates) => set((state) => ({
    players: state.players.map((p) => p.id === playerId ? { ...p, ...updates } : p),
  })),

  loadGameState: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/game/state');
      if (res.ok) {
        const data = await res.json();
        if (data.manager) {
          set({
            manager: data.manager,
            team: data.team,
            players: data.players || [],
            stadium: data.stadium,
            leagueStandings: data.leagueStandings || [],
            matches: data.matches || [],
            leagueLevel: data.leagueLevel || 4,
            currentMatchDay: data.currentMatchDay || 1,
            isInitialized: true,
            currentView: 'home',
          });
        } else {
          set({ currentView: 'create-team', isInitialized: true });
        }
      }
    } catch (e) {
      console.error('Failed to load game state:', e);
      set({ currentView: 'create-team', isInitialized: true });
    }
    set({ isLoading: false });
  },

  resetGame: async () => {
    set({ isLoading: true });
    try {
      await fetch('/api/game/reset', { method: 'POST' });
      set({
        manager: null,
        team: null,
        players: [],
        stadium: null,
        leagueStandings: [],
        matches: [],
        transfers: [],
        notifications: [],
        selectedPlayer: null,
        isMatchLive: false,
        liveMatchData: null,
        matchResult: null,
        currentView: 'create-team',
        isInitialized: true,
      });
    } catch (e) {
      console.error('Failed to reset game:', e);
    }
    set({ isLoading: false });
  },
}));
