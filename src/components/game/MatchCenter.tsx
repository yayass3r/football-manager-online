'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/lib/game-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function MatchCenter() {
  const team = useGameStore((s) => s.team);
  const manager = useGameStore((s) => s.manager);
  const players = useGameStore((s) => s.players);
  const matches = useGameStore((s) => s.matches);
  const loadGameState = useGameStore((s) => s.loadGameState);
  const updateManagerCoins = useGameStore((s) => s.updateManagerCoins);

  const [phase, setPhase] = useState<'preview' | 'live' | 'result'>('preview');
  const [liveMinute, setLiveMinute] = useState(0);
  const [liveHomeGoals, setLiveHomeGoals] = useState(0);
  const [liveAwayGoals, setLiveAwayGoals] = useState(0);
  const [liveEvents, setLiveEvents] = useState<Array<{
    minute: number;
    type: string;
    team: string;
    playerName: string;
    description: string;
  }>>([]);
  const [homeStats, setHomeStats] = useState({ possession: 50, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0 });
  const [awayStats, setAwayStats] = useState({ possession: 50, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0 });
  const [isSimulating, setIsSimulating] = useState(false);
  const [matchResult, setMatchResult] = useState<{
    homeTeam: string;
    awayTeam: string;
    homeGoals: number;
    awayGoals: number;
    reward: number;
    result: string;
  } | null>(null);

  if (!team || !manager) return null;

  // Find next match
  const nextMatch = matches.find(
    m => !m.isPlayed && (m.homeTeam === team.name || m.awayTeam === team.name)
  );

  // Recent results
  const recentResults = matches
    .filter(m => m.isPlayed && (m.homeTeam === team.name || m.awayTeam === team.name))
    .slice(-5)
    .reverse();

  const startSimulation = async () => {
    if (!nextMatch) return;
    setIsSimulating(true);
    setPhase('live');
    setLiveMinute(0);
    setLiveHomeGoals(0);
    setLiveAwayGoals(0);
    setLiveEvents([]);
    setHomeStats({ possession: 50, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0 });
    setAwayStats({ possession: 50, shots: 0, shotsOnTarget: 0, corners: 0, fouls: 0 });

    try {
      const res = await fetch('/api/match/simulate', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();

        // Find our match result
        const ourMatch = data.results?.find(
          (r: { homeTeam: string; awayTeam: string }) =>
            r.homeTeam === team.name || r.awayTeam === team.name
        );

        if (ourMatch) {
          // Animate the match
          const allEvents = ourMatch.events || [];
          let currentMinute = 0;
          let eventIndex = 0;

          const animate = () => {
            currentMinute += 1;
            setLiveMinute(currentMinute);

            // Process events up to current minute
            while (eventIndex < allEvents.length && allEvents[eventIndex].minute <= currentMinute) {
              const event = allEvents[eventIndex];
              setLiveEvents(prev => [...prev, event]);

              if (event.type === 'goal') {
                if (event.team === 'home') {
                  setLiveHomeGoals(prev => prev + 1);
                } else {
                  setLiveAwayGoals(prev => prev + 1);
                }
              }

              if (event.type === 'shot_saved' || event.type === 'goal') {
                if (event.team === 'home') {
                  setHomeStats(prev => ({ ...prev, shots: prev.shots + 1, shotsOnTarget: prev.shotsOnTarget + 1 }));
                } else {
                  setAwayStats(prev => ({ ...prev, shots: prev.shots + 1, shotsOnTarget: prev.shotsOnTarget + 1 }));
                }
              }
              if (event.type === 'shot_missed') {
                if (event.team === 'home') {
                  setHomeStats(prev => ({ ...prev, shots: prev.shots + 1 }));
                } else {
                  setAwayStats(prev => ({ ...prev, shots: prev.shots + 1 }));
                }
              }
              if (event.type === 'corner') {
                if (event.team === 'home') {
                  setHomeStats(prev => ({ ...prev, corners: prev.corners + 1 }));
                } else {
                  setAwayStats(prev => ({ ...prev, corners: prev.corners + 1 }));
                }
              }
              if (event.type === 'yellow_card') {
                if (event.team === 'home') {
                  setHomeStats(prev => ({ ...prev, fouls: prev.fouls + 1 }));
                } else {
                  setAwayStats(prev => ({ ...prev, fouls: prev.fouls + 1 }));
                }
              }

              eventIndex++;
            }

            if (currentMinute < 90) {
              setTimeout(animate, 40);
            } else {
              // Match finished
              setTimeout(() => {
                const isHome = ourMatch.homeTeam === team.name;
                const ourGoals = isHome ? ourMatch.homeGoals : ourMatch.awayGoals;
                const theirGoals = isHome ? ourMatch.awayGoals : ourMatch.homeGoals;
                const result = ourGoals > theirGoals ? 'فوز' : ourGoals < theirGoals ? 'خسارة' : 'تعادل';
                const reward = ourGoals > theirGoals ? 200000 : ourGoals < theirGoals ? 30000 : 80000;

                setMatchResult({
                  homeTeam: ourMatch.homeTeam,
                  awayTeam: ourMatch.awayTeam,
                  homeGoals: ourMatch.homeGoals,
                  awayGoals: ourMatch.awayGoals,
                  reward,
                  result,
                });
                setPhase('result');
                loadGameState();
              }, 1000);
            }
          };

          setTimeout(animate, 500);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setIsSimulating(false);
  };

  if (!nextMatch && phase === 'preview') {
    return (
      <div className="space-y-4 pb-4">
        <h2 className="text-white font-bold text-lg">مركز المباريات</h2>
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-white font-bold text-lg mb-2">لا توجد مباريات قادمة</h3>
            <p className="text-slate-400 text-sm">تم لعب جميع مباريات هذا الجولة</p>
          </CardContent>
        </Card>

        {recentResults.length > 0 && (
          <Card className="bg-slate-800/80 border-slate-700">
            <CardContent className="p-4">
              <h3 className="text-white font-bold mb-3">النتائج الأخيرة</h3>
              <div className="space-y-2">
                {recentResults.map(m => {
                  const isHome = m.homeTeam === team.name;
                  const ourGoals = isHome ? m.homeGoals : m.awayGoals;
                  const theirGoals = isHome ? m.awayGoals : m.homeGoals;
                  const opponent = isHome ? m.awayTeam : m.homeTeam;
                  const result = ourGoals > theirGoals ? 'فوز' : ourGoals < theirGoals ? 'خسارة' : 'تعادل';
                  const resultColor = result === 'فوز' ? 'text-emerald-400' : result === 'خسارة' ? 'text-red-400' : 'text-amber-400';

                  return (
                    <div key={m.id} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{isHome ? m.awayTeamLogo : m.homeTeamLogo}</span>
                        <span className="text-slate-300 text-sm">{opponent}</span>
                      </div>
                      <span className="text-white font-bold">{ourGoals} - {theirGoals}</span>
                      <span className={`text-xs font-bold ${resultColor}`}>{result}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-white font-bold text-lg">مركز المباريات</h2>

      {phase === 'preview' && nextMatch && (
        <>
          {/* Match Preview */}
          <Card className="bg-slate-800/80 border-slate-700 overflow-hidden">
            <div className="bg-emerald-600/20 px-4 py-2">
              <span className="text-emerald-400 font-bold text-sm">الجولة {nextMatch.matchDay}</span>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-4xl mb-2">{nextMatch.homeTeamLogo}</div>
                  <div className="text-white font-bold">{nextMatch.homeTeam}</div>
                  <div className="text-slate-400 text-xs">المضيف</div>
                </div>
                <div className="px-6">
                  <div className="text-slate-500 text-3xl font-black">VS</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-4xl mb-2">{nextMatch.awayTeamLogo}</div>
                  <div className="text-white font-bold">{nextMatch.awayTeam}</div>
                  <div className="text-slate-400 text-xs">الزائر</div>
                </div>
              </div>

              <Button
                onClick={startSimulation}
                disabled={isSimulating}
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg py-6"
              >
                {isSimulating ? '⏳ جاري التحضير...' : '⚽ خوض المباراة!'}
              </Button>
            </CardContent>
          </Card>

          {/* Squad Overview */}
          <Card className="bg-slate-800/80 border-slate-700">
            <CardContent className="p-4">
              <h3 className="text-white font-bold mb-3">حالة الفريق</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-slate-400 text-xs">متاح</div>
                  <div className="text-emerald-400 font-bold text-lg">{players.filter(p => !p.isInjured).length}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs">مصاب</div>
                  <div className="text-red-400 font-bold text-lg">{players.filter(p => p.isInjured).length}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs">روح الفريق</div>
                  <div className="text-amber-400 font-bold text-lg">{team.morale}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {phase === 'live' && nextMatch && (
        <>
          {/* Live Score */}
          <Card className="bg-slate-800/80 border-slate-700 overflow-hidden">
            <div className="bg-red-600 px-4 py-1 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-white font-bold text-sm">مباشر - الدقيقة {liveMinute}&apos;</span>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-3xl mb-1">{nextMatch.homeTeamLogo}</div>
                  <div className="text-white font-bold text-sm">{nextMatch.homeTeam}</div>
                </div>
                <div className="px-4 text-center">
                  <div className="flex items-center gap-3">
                    <span className="text-white text-4xl font-black">{liveHomeGoals}</span>
                    <span className="text-slate-500 text-2xl">:</span>
                    <span className="text-white text-4xl font-black">{liveAwayGoals}</span>
                  </div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-3xl mb-1">{nextMatch.awayTeamLogo}</div>
                  <div className="text-white font-bold text-sm">{nextMatch.awayTeam}</div>
                </div>
              </div>

              {/* Match Progress */}
              <div className="mt-3">
                <div className="h-1.5 bg-slate-700 rounded-full">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${(liveMinute / 90) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Stats */}
          <Card className="bg-slate-800/80 border-slate-700">
            <CardContent className="p-4">
              <div className="space-y-2">
                {[
                  { label: 'الاستحواذ', home: homeStats.possession, away: awayStats.possession },
                  { label: 'التسديدات', home: homeStats.shots, away: awayStats.shots },
                  { label: 'على المرمى', home: homeStats.shotsOnTarget, away: awayStats.shotsOnTarget },
                  { label: 'الركنيات', home: homeStats.corners, away: awayStats.corners },
                  { label: 'الأخطاء', home: homeStats.fouls, away: awayStats.fouls },
                ].map(stat => {
                  const total = stat.home + stat.away || 1;
                  return (
                    <div key={stat.label} className="flex items-center gap-2 text-xs">
                      <span className="text-white w-8 text-left font-bold">{stat.home}</span>
                      <div className="flex-1 flex h-2 rounded-full overflow-hidden bg-slate-700">
                        <div className="bg-emerald-500 transition-all" style={{ width: `${(stat.home / total) * 100}%` }} />
                        <div className="bg-sky-500 transition-all" style={{ width: `${(stat.away / total) * 100}%` }} />
                      </div>
                      <span className="text-white w-8 font-bold">{stat.away}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Live Commentary */}
          <Card className="bg-slate-800/80 border-slate-700">
            <CardContent className="p-4">
              <h3 className="text-white font-bold mb-3">التعليق المباشر</h3>
              <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                {liveEvents.slice().reverse().map((event, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg text-sm ${
                      event.type === 'goal'
                        ? 'bg-emerald-600/30 border border-emerald-500/50'
                        : event.type === 'yellow_card'
                        ? 'bg-amber-600/20 border border-amber-500/30'
                        : event.type === 'red_card'
                        ? 'bg-red-600/20 border border-red-500/30'
                        : event.type === 'injury'
                        ? 'bg-red-600/10 border border-red-500/20'
                        : 'bg-slate-700/50'
                    }`}
                  >
                    <span className="text-slate-400 text-xs">{event.minute}&apos;</span>{' '}
                    <span className="text-white">{event.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {phase === 'result' && matchResult && (
        <>
          <Card className="bg-slate-800/80 border-slate-700 overflow-hidden">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-4">
                {matchResult.result === 'فوز' ? '🏆' : matchResult.result === 'تعادل' ? '🤝' : '😞'}
              </div>
              <h3 className="text-white text-2xl font-black mb-2">
                {matchResult.result === 'فوز' ? 'فوز رائع!' : matchResult.result === 'تعادل' ? 'تعادل' : 'خسارة'}
              </h3>
              <div className="flex items-center justify-center gap-6 my-4">
                <div className="text-center">
                  <div className="text-white font-bold">{matchResult.homeTeam}</div>
                  <div className="text-4xl font-black text-white">{matchResult.homeGoals}</div>
                </div>
                <span className="text-slate-500 text-2xl">-</span>
                <div className="text-center">
                  <div className="text-white font-bold">{matchResult.awayTeam}</div>
                  <div className="text-4xl font-black text-white">{matchResult.awayGoals}</div>
                </div>
              </div>
              <div className="mt-4 bg-slate-900/50 rounded-lg p-3">
                <span className="text-slate-400 text-sm">المكافأة: </span>
                <span className="text-amber-400 font-bold">🪙 {matchResult.reward.toLocaleString()} ريال</span>
              </div>
            </CardContent>
          </Card>

          {/* Match Events Summary */}
          <Card className="bg-slate-800/80 border-slate-700">
            <CardContent className="p-4">
              <h3 className="text-white font-bold mb-3">أحداث المباراة</h3>
              <div className="max-h-64 overflow-y-auto space-y-1 custom-scrollbar">
                {liveEvents.filter(e => ['goal', 'yellow_card', 'red_card', 'injury', 'half_time', 'full_time'].includes(e.type)).map((event, i) => (
                  <div key={i} className="p-2 bg-slate-900/50 rounded-lg text-sm">
                    <span className="text-slate-400 text-xs">{event.minute}&apos;</span>{' '}
                    <span className="text-white">{event.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={() => {
              setPhase('preview');
              setLiveEvents([]);
              loadGameState();
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            العودة للمباريات
          </Button>
        </>
      )}
    </div>
  );
}
