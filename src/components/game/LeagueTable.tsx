'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/game-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function LeagueTable() {
  const leagueStandings = useGameStore((s) => s.leagueStandings);
  const matches = useGameStore((s) => s.matches);
  const team = useGameStore((s) => s.team);
  const leagueLevel = useGameStore((s) => s.leagueLevel);
  const currentMatchDay = useGameStore((s) => s.currentMatchDay);

  const [tab, setTab] = useState<'standings' | 'fixtures'>('standings');

  const leagueNames: Record<number, string> = {
    1: 'الدرجة الأولى',
    2: 'الدرجة الثانية',
    3: 'الدرجة الثالثة',
    4: 'الدرجة الرابعة',
  };

  const sortedStandings = [...leagueStandings].sort((a, b) =>
    b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst)
  );

  // Filter matches by day
  const upcomingMatches = matches.filter(m => !m.isPlayed).slice(0, 20);
  const playedMatches = matches.filter(m => m.isPlayed).slice(-20).reverse();

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">الدوري</h2>
        <div className="bg-emerald-600/20 px-3 py-1 rounded-full">
          <span className="text-emerald-400 text-sm font-bold">{leagueNames[leagueLevel] || 'الدوري'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          size="sm"
          className={tab === 'standings' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}
          onClick={() => setTab('standings')}
        >
          📊 الترتيب
        </Button>
        <Button
          size="sm"
          className={tab === 'fixtures' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}
          onClick={() => setTab('fixtures')}
        >
          📅 المباريات
        </Button>
      </div>

      {tab === 'standings' && (
        <Card className="bg-slate-800/80 border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_3.5rem_3.5rem_3rem] gap-1 px-3 py-2 bg-slate-900/50 text-slate-400 text-[10px] font-bold">
            <div>#</div>
            <div>الفريق</div>
            <div className="text-center">ل</div>
            <div className="text-center">ف</div>
            <div className="text-center">ت</div>
            <div className="text-center">خ</div>
            <div className="text-center">له</div>
            <div className="text-center">عليه</div>
            <div className="text-center">نقاط</div>
          </div>

          {/* Standings */}
          <div className="divide-y divide-slate-700/50">
            {sortedStandings.map((s, i) => {
              const isOurTeam = s.teamId === team?.id;
              const goalDiff = s.goalsFor - s.goalsAgainst;

              return (
                <div
                  key={s.id}
                  className={`grid grid-cols-[2rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_3.5rem_3.5rem_3rem] gap-1 px-3 py-2 items-center text-sm ${
                    isOurTeam ? 'bg-emerald-600/20' : 'hover:bg-slate-700/30'
                  }`}
                >
                  <div className={`font-bold text-xs ${i < 3 ? 'text-emerald-400' : i >= sortedStandings.length - 3 ? 'text-red-400' : 'text-slate-400'}`}>
                    {i + 1}
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{s.teamLogo}</span>
                    <span className={`font-bold text-xs truncate ${isOurTeam ? 'text-emerald-400' : 'text-white'}`}>
                      {s.teamName}
                    </span>
                  </div>
                  <div className="text-center text-slate-300 text-xs">{s.played}</div>
                  <div className="text-center text-slate-300 text-xs">{s.won}</div>
                  <div className="text-center text-slate-300 text-xs">{s.drawn}</div>
                  <div className="text-center text-slate-300 text-xs">{s.lost}</div>
                  <div className="text-center text-slate-300 text-xs">{s.goalsFor}</div>
                  <div className="text-center text-slate-300 text-xs">{s.goalsAgainst}</div>
                  <div className="text-center font-black text-xs text-amber-400">{s.points}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {tab === 'fixtures' && (
        <div className="space-y-3">
          {/* Upcoming */}
          {upcomingMatches.length > 0 && (
            <Card className="bg-slate-800/80 border-slate-700">
              <CardContent className="p-4">
                <h3 className="text-white font-bold mb-3">المباريات القادمة</h3>
                <div className="space-y-2">
                  {upcomingMatches.slice(0, 10).map(m => (
                    <div key={m.id} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm">{m.homeTeamLogo}</span>
                        <span className="text-white text-xs font-medium truncate">{m.homeTeam}</span>
                      </div>
                      <div className="px-2 text-slate-500 text-xs font-bold">ضد</div>
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <span className="text-white text-xs font-medium truncate">{m.awayTeam}</span>
                        <span className="text-sm">{m.awayTeamLogo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Played */}
          {playedMatches.length > 0 && (
            <Card className="bg-slate-800/80 border-slate-700">
              <CardContent className="p-4">
                <h3 className="text-white font-bold mb-3">النتائج</h3>
                <div className="space-y-2">
                  {playedMatches.slice(0, 10).map(m => {
                    const isOurMatch = m.homeTeam === team?.name || m.awayTeam === team?.name;

                    return (
                      <div key={m.id} className={`flex items-center justify-between rounded-lg p-2 ${isOurMatch ? 'bg-emerald-600/10' : 'bg-slate-900/50'}`}>
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-sm">{m.homeTeamLogo}</span>
                          <span className="text-white text-xs font-medium truncate">{m.homeTeam}</span>
                        </div>
                        <div className="px-3 text-center">
                          <span className="text-white font-black text-sm">{m.homeGoals} - {m.awayGoals}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="text-white text-xs font-medium truncate">{m.awayTeam}</span>
                          <span className="text-sm">{m.awayTeamLogo}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
