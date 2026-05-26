'use client';

import { useGameStore, type GameView } from '@/lib/game-store';
import { HomeDashboard } from './HomeDashboard';
import { CreateTeam } from './CreateTeam';
import { SquadManager } from './SquadManager';
import { TacticsBoard } from './TacticsBoard';
import { TransferMarket } from './TransferMarket';
import { MatchCenter } from './MatchCenter';
import { LeagueTable } from './LeagueTable';
import { TrainingCenter } from './TrainingCenter';
import { StadiumView } from './StadiumView';
import { DailyRewards } from './DailyRewards';
import { Achievements } from './Achievements';
import { ScoutCenter } from './ScoutCenter';
import { NewsFeed } from './NewsFeed';
import { SeasonSummary } from './SeasonSummary';
import { Button } from '@/components/ui/button';

const mainNavItems: { view: GameView; label: string; icon: string }[] = [
  { view: 'home', label: 'الرئيسية', icon: '🏠' },
  { view: 'squad', label: 'الفريق', icon: '👥' },
  { view: 'tactics', label: 'التكتيكات', icon: '📋' },
  { view: 'match', label: 'المباريات', icon: '⚽' },
  { view: 'league', label: 'الدوري', icon: '🏆' },
];

const moreNavItems: { view: GameView; label: string; icon: string }[] = [
  { view: 'transfers', label: 'الانتقالات', icon: '💰' },
  { view: 'training', label: 'التدريب', icon: '🏋️' },
  { view: 'stadium', label: 'الملعب', icon: '🏟️' },
  { view: 'scout', label: 'الكشافة', icon: '🔍' },
  { view: 'achievements', label: 'الإنجازات', icon: '🏅' },
  { view: 'daily-rewards', label: 'المكافآت', icon: '🎁' },
  { view: 'news', label: 'الأخبار', icon: '📰' },
  { view: 'season-summary', label: 'المواسم', icon: '📊' },
  { view: 'settings', label: 'الإعدادات', icon: '⚙️' },
];

export function GameShell() {
  const currentView = useGameStore((s) => s.currentView);
  const manager = useGameStore((s) => s.manager);
  const team = useGameStore((s) => s.team);
  const setView = useGameStore((s) => s.setView);
  const resetGame = useGameStore((s) => s.resetGame);
  const canClaimReward = useGameStore((s) => s.canClaimReward);
  const newsUnreadCount = useGameStore((s) => s.newsUnreadCount);
  const currentMatchDay = useGameStore((s) => s.currentMatchDay);
  const totalMatchDays = useGameStore((s) => s.totalMatchDays);
  const fetchNews = useGameStore((s) => s.fetchNews);

  if (!manager || !team) {
    return <CreateTeam />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'home': return <HomeDashboard />;
      case 'squad': return <SquadManager />;
      case 'tactics': return <TacticsBoard />;
      case 'transfers': return <TransferMarket />;
      case 'match': return <MatchCenter />;
      case 'league': return <LeagueTable />;
      case 'training': return <TrainingCenter />;
      case 'stadium': return <StadiumView />;
      case 'daily-rewards': return <DailyRewards />;
      case 'achievements': return <Achievements />;
      case 'scout': return <ScoutCenter />;
      case 'news': return <NewsFeed />;
      case 'season-summary': return <SeasonSummary />;
      case 'settings': return (
        <div className="space-y-4 pb-4">
          <h2 className="text-white font-bold text-lg">الإعدادات</h2>
          <div className="space-y-3">
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-lg"
                  style={{ backgroundColor: team.primaryColor }}
                >
                  {team.logo}
                </div>
                <div>
                  <div className="text-white font-bold">{manager.username}</div>
                  <div className="text-slate-400 text-sm">{team.name}</div>
                  <div className="text-slate-500 text-xs">المستوى {manager.level} • {manager.xp} XP</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 space-y-3">
              <h3 className="text-white font-bold">إحصائيات المدرب</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-slate-400">المواسم</div>
                <div className="text-white font-bold">1</div>
                <div className="text-slate-400">المستوى</div>
                <div className="text-emerald-400 font-bold">{manager.level}</div>
                <div className="text-slate-400">العملات</div>
                <div className="text-amber-400 font-bold">{(manager.coins / 1000000).toFixed(1)}M</div>
                <div className="text-slate-400">الجواهر</div>
                <div className="text-purple-400 font-bold">{manager.gems}</div>
              </div>
            </div>

            <Button
              onClick={resetGame}
              variant="destructive"
              className="w-full"
            >
              🔄 إعادة بدء اللعبة
            </Button>
          </div>
        </div>
      );
      default: return <HomeDashboard />;
    }
  };

  const isMoreActive = moreNavItems.some(item => item.view === currentView);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Top Bar */}
      <header className="bg-slate-800/95 backdrop-blur-md border-b border-slate-700 px-3 py-2 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shadow"
            style={{ backgroundColor: team.primaryColor }}
          >
            {team.logo}
          </div>
          <span className="text-white font-bold text-sm">{team.name}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Season Progress Badge */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900/50 rounded-full px-2 py-1">
            <span className="text-emerald-400 text-[10px]">📅</span>
            <span className="text-white text-[10px] font-bold">ج{currentMatchDay}/{totalMatchDays}</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/50 rounded-full px-2 py-1">
            <span className="text-amber-400 text-xs">🪙</span>
            <span className="text-white text-xs font-bold">{(manager.coins / 1000000).toFixed(1)}M</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-900/50 rounded-full px-2 py-1">
            <span className="text-purple-400 text-xs">💎</span>
            <span className="text-white text-xs font-bold">{manager.gems}</span>
          </div>

          {/* Daily Reward Indicator */}
          <button
            onClick={() => setView('daily-rewards')}
            className={`relative p-1 rounded-lg transition-all ${
              canClaimReward ? 'animate-pulse-glow bg-emerald-500/20' : 'hover:bg-slate-700'
            }`}
          >
            <span className="text-base">🎁</span>
            {canClaimReward && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
            )}
          </button>

          {/* News Bell */}
          <button
            onClick={() => {
              setView('news');
              fetchNews();
            }}
            className="relative p-1 rounded-lg hover:bg-slate-700 transition-all"
          >
            <span className="text-base">🔔</span>
            {newsUnreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] bg-red-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold px-0.5">
                {newsUnreadCount > 9 ? '9+' : newsUnreadCount}
              </span>
            )}
          </button>

          <Button
            size="sm"
            variant="ghost"
            className="text-slate-400 hover:text-white p-1"
            onClick={() => setView('settings')}
          >
            ⚙️
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-4">
        {renderView()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-slate-800/95 backdrop-blur-md border-t border-slate-700 px-2 py-1 sticky bottom-0 z-50">
        <div className="flex items-center justify-around">
          {mainNavItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg transition-all ${
                currentView === item.view
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          ))}

          {/* More menu button */}
          <div className="relative group">
            <button
              className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg transition-all ${
                isMoreActive
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-base">⋯</span>
              <span className="text-[9px] font-medium">المزيد</span>
            </button>

            {/* Dropdown */}
            <div className="absolute bottom-full right-0 mb-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1.5 min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              {moreNavItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => setView(item.view)}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-right transition-all ${
                    currentView === item.view
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                  {item.view === 'daily-rewards' && canClaimReward && (
                    <span className="mr-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  )}
                  {item.view === 'news' && newsUnreadCount > 0 && (
                    <span className="mr-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {newsUnreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
