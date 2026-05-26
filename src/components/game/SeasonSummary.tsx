'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/game-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function SeasonSummary() {
  const manager = useGameStore((s) => s.manager);
  const team = useGameStore((s) => s.team);
  const seasonSummary = useGameStore((s) => s.seasonSummary);
  const seasonHistory = useGameStore((s) => s.seasonHistory);
  const loadGameState = useGameStore((s) => s.loadGameState);
  const setView = useGameStore((s) => s.setView);
  const [isEnding, setIsEnding] = useState(false);

  const handleEndSeason = async () => {
    setIsEnding(true);
    try {
      const res = await fetch('/api/season/end', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          useGameStore.setState({ seasonSummary: data.seasonSummary });
          await loadGameState();
        }
      }
    } catch (e) {
      console.error('Failed to end season:', e);
    }
    setIsEnding(false);
  };

  const summary = seasonSummary as {
    season?: number;
    leagueLevel?: number;
    leagueName?: string;
    finalPosition?: number;
    played?: number;
    won?: number;
    drawn?: number;
    lost?: number;
    points?: number;
    goalsFor?: number;
    goalsAgainst?: number;
    promoted?: boolean;
    relegated?: boolean;
    newLevel?: number;
    retiredCount?: number;
    youthCount?: number;
    seasonReward?: number;
  } | null;

  if (!manager || !team) return null;

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-white font-bold text-lg">📊 ملخص الموسم</h2>

      {/* Season Summary (if season has ended) */}
      {summary && (
        <div className="space-y-3 animate-slide-up">
          {/* Promotion/Relegation Status */}
          <Card className={`border-0 overflow-hidden ${
            summary.promoted ? 'animate-pulse-glow' : ''
          }`} style={{
            background: summary.promoted
              ? 'linear-gradient(135deg, #059669, #10b981)'
              : summary.relegated
              ? 'linear-gradient(135deg, #991b1b, #dc2626)'
              : 'linear-gradient(135deg, #1e293b, #334155)',
          }}>
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-3">
                {summary.promoted ? '🎉' : summary.relegated ? '📉' : '📊'}
              </div>
              <h2 className="text-2xl font-black text-white mb-1">
                {summary.promoted ? 'صعود رائع!' : summary.relegated ? 'هبوط مؤسف' : 'نهاية الموسم'}
              </h2>
              <p className="text-white/80">
                {summary.promoted
                  ? `صعد فريق ${team.name} إلى الدوري الأعلى!`
                  : summary.relegated
                  ? `هبط فريق ${team.name} إلى الدوري الأدنى`
                  : `أنهى ${team.name} الموسم بنجاح`}
              </p>
            </CardContent>
          </Card>

          {/* Season Stats */}
          <Card className="bg-slate-800/80 border-slate-700">
            <CardContent className="p-4">
              <h3 className="text-white font-bold mb-3">📈 إحصائيات الموسم</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <div className="text-slate-400 text-xs">المركز النهائي</div>
                  <div className="text-white font-black text-xl">{summary.finalPosition}</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <div className="text-slate-400 text-xs">النقاط</div>
                  <div className="text-amber-400 font-black text-xl">{summary.points}</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <div className="text-slate-400 text-xs">فوز / تعادل / خسارة</div>
                  <div className="text-white font-bold text-sm">
                    <span className="text-emerald-400">{summary.won}</span> /
                    <span className="text-amber-400"> {summary.drawn} </span>/
                    <span className="text-red-400"> {summary.lost}</span>
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                  <div className="text-slate-400 text-xs">أهداف له / عليه</div>
                  <div className="text-white font-bold text-sm">
                    <span className="text-emerald-400">{summary.goalsFor}</span> /
                    <span className="text-red-400"> {summary.goalsAgainst}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Youth Academy & Retirements */}
          <div className="grid grid-cols-2 gap-2">
            {(summary.youthCount ?? 0) > 0 && (
              <Card className="bg-emerald-500/10 border-emerald-500/20">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl mb-1">🎓</div>
                  <div className="text-emerald-400 font-bold">{summary.youthCount}</div>
                  <div className="text-emerald-300/70 text-xs">خريجو الأكاديمية</div>
                </CardContent>
              </Card>
            )}
            {(summary.retiredCount ?? 0) > 0 && (
              <Card className="bg-red-500/10 border-red-500/20">
                <CardContent className="p-3 text-center">
                  <div className="text-2xl mb-1">👋</div>
                  <div className="text-red-400 font-bold">{summary.retiredCount}</div>
                  <div className="text-red-300/70 text-xs">لاعبون معتزلون</div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Season Reward */}
          <Card className="bg-amber-500/10 border-amber-500/20">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">🎁</div>
              <h3 className="text-amber-400 font-bold">مكافأة نهاية الموسم</h3>
              <div className="text-white font-black text-2xl mt-1">
                🪙 {((summary.seasonReward ?? 0) / 1000000).toFixed(1)}M
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={() => setView('home')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3"
          >
            🏠 العودة للرئيسية
          </Button>
        </div>
      )}

      {/* No summary yet - show end season option */}
      {!summary && (
        <div className="space-y-3">
          <Card className="bg-slate-800/80 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-3">🏆</div>
              <h3 className="text-white font-bold text-lg mb-2">إنهاء الموسم الحالي</h3>
              <p className="text-slate-400 text-sm mb-4">
                أنهِ الموسم الحالي لمعرفة نتائجك وبدء موسم جديد. سيتم:
              </p>
              <ul className="text-slate-400 text-sm space-y-1 text-right mb-4">
                <li>• حساب الترتيب النهائي</li>
                <li>• معرفة هل صعدت أو هبطت</li>
                <li>• تقدم اللاعبين في العمر سنة</li>
                <li>• اعتزال اللاعبين فوق 38 سنة</li>
                <li>• تصعيد لاعبين من الأكاديمية</li>
                <li>• إنشاء جدول مباريات جديد</li>
              </ul>
              <Button
                onClick={handleEndSeason}
                disabled={isEnding}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-3"
              >
                {isEnding ? '⏳ جاري إنهاء الموسم...' : '🏆 إنهاء الموسم'}
              </Button>
            </CardContent>
          </Card>

          {/* Season History */}
          {seasonHistory.length > 0 && (
            <Card className="bg-slate-800/80 border-slate-700">
              <CardContent className="p-4">
                <h3 className="text-white font-bold mb-3">📜 تاريخ المواسم</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {seasonHistory.map((sh) => (
                    <div key={sh.id} className="bg-slate-900/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-bold text-sm">الموسم {sh.season}</span>
                        {sh.promoted && <span className="text-emerald-400 text-xs font-bold">⬆️ صعود</span>}
                        {sh.relegated && <span className="text-red-400 text-xs font-bold">⬇️ هبوط</span>}
                        {!sh.promoted && !sh.relegated && <span className="text-slate-400 text-xs">باقٍ</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>المركز {sh.finalPosition}</span>
                        <span>{sh.won}ف {sh.drawn}ت {sh.lost}خ</span>
                        <span>{sh.points} نقطة</span>
                      </div>
                      <div className="text-slate-500 text-[10px] mt-1">{sh.leagueName}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
