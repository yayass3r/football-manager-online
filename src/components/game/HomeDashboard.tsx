'use client';

import { useGameStore } from '@/lib/game-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { positionLabels } from '@/lib/game-data';

export function HomeDashboard() {
  const manager = useGameStore((s) => s.manager);
  const team = useGameStore((s) => s.team);
  const players = useGameStore((s) => s.players);
  const matches = useGameStore((s) => s.matches);
  const leagueStandings = useGameStore((s) => s.leagueStandings);
  const setView = useGameStore((s) => s.setView);
  const currentMatchDay = useGameStore((s) => s.currentMatchDay);

  if (!manager || !team) return null;

  // Team stats
  const teamOverall = players.length > 0
    ? Math.round(players.reduce((sum, p) => sum + p.overall, 0) / players.length)
    : 0;
  const injuredCount = players.filter(p => p.isInjured).length;
  const totalSalary = players.reduce((sum, p) => sum + p.salary, 0);
  const teamValue = players.reduce((sum, p) => sum + p.value, 0);

  // Find our standing
  const ourStanding = leagueStandings.find(s => s.teamId === team.id);
  const ourPosition = ourStanding
    ? leagueStandings
        .slice()
        .sort((a, b) => b.points - a.points || b.goalsFor - a.goalsFor)
        .findIndex(s => s.teamId === team.id) + 1
    : '-';

  // Find next match
  const nextMatch = matches.find(m => !m.isPlayed && (m.homeTeam === team.name || m.awayTeam === team.name));

  // Recent results
  const recentMatches = matches
    .filter(m => m.isPlayed && (m.homeTeam === team.name || m.awayTeam === team.name))
    .slice(-3)
    .reverse();

  // Top players
  const topPlayers = [...players].sort((a, b) => b.overall - a.overall).slice(0, 5);

  return (
    <div className="space-y-4 pb-4">
      {/* Team Overview Card */}
      <Card className="overflow-hidden border-0" style={{
        background: `linear-gradient(135deg, ${team.primaryColor}ee, ${team.primaryColor}88)`,
      }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-4xl backdrop-blur-sm">
              {team.logo}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-white">{team.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-white/80 text-sm">التقييم: <span className="font-bold text-white">{teamOverall}</span></span>
                <span className="text-white/80 text-sm">المركز: <span className="font-bold text-white">{ourPosition}</span></span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-black/20 rounded-full px-2 py-0.5">
                  <span className="text-amber-300 text-xs">🪙</span>
                  <span className="text-white text-xs font-bold">{(manager.coins / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex items-center gap-1 bg-black/20 rounded-full px-2 py-0.5">
                  <span className="text-purple-300 text-xs">💎</span>
                  <span className="text-white text-xs font-bold">{manager.gems}</span>
                </div>
                <div className="flex items-center gap-1 bg-black/20 rounded-full px-2 py-0.5">
                  <span className="text-emerald-300 text-xs">⭐</span>
                  <span className="text-white text-xs font-bold">Lv.{manager.level}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Morale Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>الروح المعنوية</span>
              <span>{team.morale}%</span>
            </div>
            <div className="h-2 bg-black/20 rounded-full">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${team.morale}%`,
                  backgroundColor: team.morale > 70 ? '#4ade80' : team.morale > 40 ? '#fbbf24' : '#f87171',
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'فوز', value: ourStanding?.won || 0, icon: '🏆', color: 'text-emerald-400' },
          { label: 'تعادل', value: ourStanding?.drawn || 0, icon: '🤝', color: 'text-amber-400' },
          { label: 'خسارة', value: ourStanding?.lost || 0, icon: '📉', color: 'text-red-400' },
          { label: 'نقاط', value: ourStanding?.points || 0, icon: '⭐', color: 'text-yellow-400' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-slate-800/80 border-slate-700">
            <CardContent className="p-3 text-center">
              <div className="text-lg">{stat.icon}</div>
              <div className={`font-black text-lg ${stat.color}`}>{stat.value}</div>
              <div className="text-slate-400 text-[10px]">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next Match */}
      {nextMatch && (
        <Card className="bg-slate-800/80 border-slate-700 overflow-hidden">
          <div className="bg-emerald-600/20 px-4 py-2 border-b border-slate-700">
            <span className="text-emerald-400 font-bold text-sm">المباراة القادمة - الجولة {nextMatch.matchDay}</span>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="text-2xl mb-1">{nextMatch.homeTeamLogo}</div>
                <div className="text-white font-bold text-sm">{nextMatch.homeTeam}</div>
              </div>
              <div className="px-4">
                <div className="text-slate-400 text-2xl font-black">VS</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-2xl mb-1">{nextMatch.awayTeamLogo}</div>
                <div className="text-white font-bold text-sm">{nextMatch.awayTeam}</div>
              </div>
            </div>
            <Button
              onClick={() => setView('match')}
              className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              🏟️ خوض المباراة
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Results */}
      {recentMatches.length > 0 && (
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="p-4">
            <h3 className="text-white font-bold mb-3">النتائج الأخيرة</h3>
            <div className="space-y-2">
              {recentMatches.map((m) => {
                const isHome = m.homeTeam === team.name;
                const ourGoals = isHome ? m.homeGoals : m.awayGoals;
                const theirGoals = isHome ? m.awayGoals : m.homeGoals;
                const opponent = isHome ? m.awayTeam : m.homeTeam;
                const result = ourGoals > theirGoals ? 'فوز' : ourGoals < theirGoals ? 'خسارة' : 'تعادل';
                const resultColor = ourGoals > theirGoals ? 'text-emerald-400' : ourGoals < theirGoals ? 'text-red-400' : 'text-amber-400';

                return (
                  <div key={m.id} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-2">
                    <span className="text-slate-400 text-xs">ضد {opponent}</span>
                    <span className="text-white font-bold">{ourGoals} - {theirGoals}</span>
                    <span className={`text-xs font-bold ${resultColor}`}>{result}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Players */}
      <Card className="bg-slate-800/80 border-slate-700">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white font-bold">أفضل اللاعبين</h3>
            <Button variant="ghost" size="sm" className="text-emerald-400" onClick={() => setView('squad')}>
              الكل ←
            </Button>
          </div>
          <div className="space-y-2">
            {topPlayers.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-3 bg-slate-900/50 rounded-lg p-2 cursor-pointer hover:bg-slate-700/50"
                onClick={() => setView('squad')}
              >
                <span className={`font-bold w-6 text-center ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-500'}`}>
                  {i + 1}
                </span>
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  {p.overall}
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{p.name}</div>
                  <div className="text-slate-400 text-xs">{positionLabels[p.position] || p.position}</div>
                </div>
                <div className="text-amber-400 text-xs font-bold">{(p.value / 1000000).toFixed(1)}M</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Squad Info */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="p-3 text-center">
            <div className="text-slate-400 text-xs">قيمة الفريق</div>
            <div className="text-emerald-400 font-bold">{(teamValue / 1000000).toFixed(1)}M</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="p-3 text-center">
            <div className="text-slate-400 text-xs">الرواتب الشهرية</div>
            <div className="text-amber-400 font-bold">{(totalSalary / 1000).toFixed(0)}K</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="p-3 text-center">
            <div className="text-slate-400 text-xs">اللاعبون</div>
            <div className="text-white font-bold">{players.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="p-3 text-center">
            <div className="text-slate-400 text-xs">المصابون</div>
            <div className="text-red-400 font-bold">{injuredCount}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
