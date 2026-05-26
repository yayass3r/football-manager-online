import { create } from 'zustand';

export type GameView = 
  | 'home' | 'create-team' | 'squad' | 'tactics' | 'transfers' 
  | 'match' | 'league' | 'training' | 'stadium' | 'settings'
  | 'daily-rewards' | 'achievements' | 'scout' | 'news' | 'season-summary';

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

export interface DailyRewardState {
  id: string;
  day: number;
  coins: number;
  gems: number;
  isClaimed: boolean;
  claimedAt: string | null;
}

export interface AchievementState {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  target: number;
  reward: number;
  progress: number;
  isCompleted: boolean;
  completedAt: string | null;
  managerAchievementId: string | null;
  isClaimed: boolean;
}

export interface ScoutReportState {
  id: string;
  playerName: string;
  position: string;
  overall: number;
  potential: number;
  nationality: string;
  age: number;
  askingPrice: number;
  scoutRating: number;
  createdAt: string;
  expiresAt: string;
}

export interface NewsArticleState {
  id: string;
  title: string;
  content: string;
  category: string;
  imageEmoji: string;
  isRead: boolean;
  createdAt: string;
}

export interface SeasonHistoryState {
  id: string;
  season: number;
  leagueLevel: number;
  leagueName: string;
  finalPosition: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  promoted: boolean;
  relegated: boolean;
  createdAt: string;
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

  // New data
  dailyRewards: DailyRewardState[];
  currentRewardDay: number;
  rewardStreak: number;
  canClaimReward: boolean;
  achievements: AchievementState[];
  scoutReports: ScoutReportState[];
  news: NewsArticleState[];
  newsUnreadCount: number;
  seasonHistory: SeasonHistoryState[];
  teamChemistry: number;
  seasonSummary: Record<string, unknown> | null;

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
  
  // New actions
  setDailyRewards: (rewards: DailyRewardState[]) => void;
  setCurrentRewardDay: (day: number) => void;
  setRewardStreak: (streak: number) => void;
  setCanClaimReward: (can: boolean) => void;
  setAchievements: (achievements: AchievementState[]) => void;
  setScoutReports: (reports: ScoutReportState[]) => void;
  setNews: (news: NewsArticleState[]) => void;
  setNewsUnreadCount: (count: number) => void;
  setSeasonHistory: (history: SeasonHistoryState[]) => void;
  setTeamChemistry: (chemistry: number) => void;
  setSeasonSummary: (summary: Record<string, unknown> | null) => void;
  
  updateManagerCoins: (delta: number) => void;
  updateManagerGems: (delta: number) => void;
  updateManagerXP: (xp: number) => void;
  updatePlayer: (playerId: string, updates: Partial<PlayerState>) => void;
  
  fetchDailyRewards: () => Promise<void>;
  claimDailyReward: () => Promise<void>;
  fetchAchievements: () => Promise<void>;
  fetchScoutReports: () => Promise<void>;
  refreshScoutReports: () => Promise<void>;
  fetchNews: () => Promise<void>;
  markNewsRead: () => Promise<void>;
  fetchSeasonHistory: () => Promise<void>;
  
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

  // New state
  dailyRewards: [],
  currentRewardDay: 1,
  rewardStreak: 0,
  canClaimReward: false,
  achievements: [],
  scoutReports: [],
  news: [],
  newsUnreadCount: 0,
  seasonHistory: [],
  teamChemistry: 50,
  seasonSummary: null,

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

  // New setters
  setDailyRewards: (rewards) => set({ dailyRewards: rewards }),
  setCurrentRewardDay: (day) => set({ currentRewardDay: day }),
  setRewardStreak: (streak) => set({ rewardStreak: streak }),
  setCanClaimReward: (can) => set({ canClaimReward: can }),
  setAchievements: (achievements) => set({ achievements }),
  setScoutReports: (reports) => set({ scoutReports: reports }),
  setNews: (news) => set({ news }),
  setNewsUnreadCount: (count) => set({ newsUnreadCount: count }),
  setSeasonHistory: (history) => set({ seasonHistory: history }),
  setTeamChemistry: (chemistry) => set({ teamChemistry: chemistry }),
  setSeasonSummary: (summary) => set({ seasonSummary: summary }),

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

  fetchDailyRewards: async () => {
    try {
      const res = await fetch('/api/daily-reward');
      if (res.ok) {
        const data = await res.json();
        set({
          dailyRewards: data.rewards,
          currentRewardDay: data.currentDay,
          rewardStreak: data.streak,
          canClaimReward: data.canClaim,
        });
      }
    } catch (e) {
      console.error('Failed to fetch daily rewards:', e);
    }
  },

  claimDailyReward: async () => {
    try {
      const res = await fetch('/api/daily-reward', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const state = get();
          set({
            canClaimReward: false,
            manager: state.manager ? {
              ...state.manager,
              coins: state.manager.coins + data.coins,
              gems: state.manager.gems + data.gems,
            } : null,
            dailyRewards: state.dailyRewards.map(r =>
              r.day === state.currentRewardDay ? { ...r, isClaimed: true, claimedAt: new Date().toISOString() } : r
            ),
          });
        }
      }
    } catch (e) {
      console.error('Failed to claim daily reward:', e);
    }
  },

  fetchAchievements: async () => {
    try {
      const res = await fetch('/api/achievements');
      if (res.ok) {
        const data = await res.json();
        set({ achievements: data.achievements });
      }
    } catch (e) {
      console.error('Failed to fetch achievements:', e);
    }
  },

  fetchScoutReports: async () => {
    try {
      const res = await fetch('/api/scout');
      if (res.ok) {
        const data = await res.json();
        set({ scoutReports: data.reports });
      }
    } catch (e) {
      console.error('Failed to fetch scout reports:', e);
    }
  },

  refreshScoutReports: async () => {
    try {
      const res = await fetch('/api/scout', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const state = get();
          set({
            scoutReports: data.reports,
            manager: state.manager ? { ...state.manager, gems: state.manager.gems - 15 } : null,
          });
        }
      }
    } catch (e) {
      console.error('Failed to refresh scout reports:', e);
    }
  },

  fetchNews: async () => {
    try {
      const res = await fetch('/api/news');
      if (res.ok) {
        const data = await res.json();
        set({ news: data.news, newsUnreadCount: data.unreadCount });
      }
    } catch (e) {
      console.error('Failed to fetch news:', e);
    }
  },

  markNewsRead: async () => {
    try {
      await fetch('/api/news', { method: 'POST' });
      set({ newsUnreadCount: 0, news: get().news.map(n => ({ ...n, isRead: true })) });
    } catch (e) {
      console.error('Failed to mark news as read:', e);
    }
  },

  fetchSeasonHistory: async () => {
    try {
      const manager = get().manager;
      if (!manager) return;
      const res = await fetch('/api/game/state');
      if (res.ok) {
        const data = await res.json();
        if (data.seasonHistory) {
          set({ seasonHistory: data.seasonHistory });
        }
      }
    } catch (e) {
      console.error('Failed to fetch season history:', e);
    }
  },

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
            seasonHistory: data.seasonHistory || [],
          });

          // Calculate team chemistry
          const { calculateTeamChemistry } = await import('@/lib/game-engine');
          const players = data.players || [];
          const team = data.team;
          if (team && players.length > 0) {
            const chemistry = calculateTeamChemistry({
              name: team.name,
              logo: team.logo,
              formation: team.formation,
              morale: team.morale,
              fanSupport: team.fanSupport,
              players: players.map((p: PlayerState) => ({
                name: p.name,
                position: p.position,
                overall: p.overall,
                pace: p.pace,
                shooting: p.shooting,
                passing: p.passing,
                dribbling: p.dribbling,
                defending: p.defending,
                physical: p.physical,
                stamina: p.stamina,
                form: p.form,
                morale: p.morale,
                isInjured: p.isInjured,
              })),
            });
            set({ teamChemistry: chemistry });
          }

          // Fetch new features data in background
          get().fetchDailyRewards();
          get().fetchAchievements();
          get().fetchScoutReports();
          get().fetchNews();
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
        dailyRewards: [],
        achievements: [],
        scoutReports: [],
        news: [],
        newsUnreadCount: 0,
        seasonHistory: [],
        teamChemistry: 50,
        seasonSummary: null,
      });
    } catch (e) {
      console.error('Failed to reset game:', e);
    }
    set({ isLoading: false });
  },
}));
