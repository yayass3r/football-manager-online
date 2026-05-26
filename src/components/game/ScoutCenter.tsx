'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/game-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { positionLabels } from '@/lib/game-data';

export function ScoutCenter() {
  const scoutReports = useGameStore((s) => s.scoutReports);
  const manager = useGameStore((s) => s.manager);
  const refreshScoutReports = useGameStore((s) => s.refreshScoutReports);
  const fetchScoutReports = useGameStore((s) => s.fetchScoutReports);
  const fetchAchievements = useGameStore((s) => s.fetchAchievements);
  const loadGameState = useGameStore((s) => s.loadGameState);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [signingId, setSigningId] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshScoutReports();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleSign = async (reportId: string) => {
    setSigningId(reportId);
    try {
      const res = await fetch('/api/scout/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scoutReportId: reportId }),
      });
      if (res.ok) {
        await fetchScoutReports();
        await fetchAchievements();
        await loadGameState();
      } else {
        const data = await res.json();
        if (data.error === 'not_enough_coins') {
          alert('لا تملك عملات كافية لتوقيع هذا اللاعب!');
        }
      }
    } catch (e) {
      console.error('Failed to sign player:', e);
    }
    setSigningId(null);
  };

  const formatPrice = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val.toString();
  };

  const getStarRating = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getTimeUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    if (diffMs <= 0) return 'منتهي';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}س ${minutes}د`;
  };

  const getPotentialColor = (overall: number, potential: number) => {
    const diff = potential - overall;
    if (diff >= 10) return 'text-emerald-400';
    if (diff >= 5) return 'text-amber-400';
    return 'text-slate-400';
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">🔍 مركز الكشافة</h2>
        <div className="flex items-center gap-1 bg-purple-500/20 rounded-full px-3 py-1">
          <span className="text-purple-400 text-xs">💎</span>
          <span className="text-purple-400 text-xs font-bold">15 جوهرة للتحديث</span>
        </div>
      </div>

      {/* Refresh Button */}
      <Button
        onClick={handleRefresh}
        disabled={isRefreshing || (manager?.gems ?? 0) < 15}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold"
      >
        {isRefreshing ? '🔄 جاري البحث...' : `🔍 بحث عن لاعبين جدد (💎 15)`}
      </Button>

      {/* Scout Reports */}
      {scoutReports.length === 0 ? (
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-slate-400">لا توجد تقارير كشافة حالياً</p>
            <p className="text-slate-500 text-sm mt-1">استخدم زر البحث لاكتشاف لاعبين جدد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {scoutReports.map((report, idx) => {
            const potentialDiff = report.potential - report.overall;
            const hasHighPotential = potentialDiff >= 5;

            return (
              <Card
                key={report.id}
                className="bg-slate-800/80 border-slate-700 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Potential indicator bar */}
                <div className={`h-1 ${
                  hasHighPotential ? 'bg-gradient-to-l from-emerald-400 to-emerald-600' :
                  'bg-gradient-to-l from-slate-500 to-slate-600'
                }`} />

                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Player rating circle */}
                    <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                      hasHighPotential ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-700/50'
                    }`}>
                      <span className="text-white font-black text-lg">{report.overall}</span>
                      <span className={`text-[10px] font-bold ${getPotentialColor(report.overall, report.potential)}`}>
                        ↑{report.potential}
                      </span>
                    </div>

                    {/* Player info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-sm truncate">{report.playerName}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-emerald-400 text-xs">{positionLabels[report.position] || report.position}</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-slate-400 text-xs">{report.nationality}</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-slate-400 text-xs">{report.age} سنة</span>
                      </div>

                      {/* Scout rating */}
                      <div className="mt-1 text-[10px]">{getStarRating(report.scoutRating)}</div>

                      {/* Potential badge */}
                      {hasHighPotential && (
                        <span className="inline-block mt-1 bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          ⭐ إمكانية عالية (+{potentialDiff})
                        </span>
                      )}

                      {/* Price and actions */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 text-sm font-bold">🪙 {formatPrice(report.askingPrice)}</span>
                        </div>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                          onClick={() => handleSign(report.id)}
                          disabled={signingId === report.id || (manager?.coins ?? 0) < report.askingPrice}
                        >
                          {signingId === report.id ? '⏳' : '📝 توقيع'}
                        </Button>
                      </div>

                      {/* Expiry timer */}
                      <div className="text-slate-500 text-[10px] mt-1">
                        ⏰ ينتهي خلال: {getTimeUntilExpiry(report.expiresAt)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Scout Tips */}
      <Card className="bg-slate-800/80 border-slate-700">
        <CardContent className="p-4">
          <h3 className="text-white font-bold mb-2">💡 نصائح الكشافة</h3>
          <ul className="text-slate-400 text-sm space-y-1">
            <li>• اللاعبون ذوو الإمكانية العالية يتحسنون بشكل أسرع</li>
            <li>• التقييم الأخضر ↑ يشير للإمكانية المستقبلية</li>
            <li>• توقيع اللاعبين الشباب استثمار للمستقبل</li>
            <li>• التقارير تنتهي خلال 24 ساعة!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
