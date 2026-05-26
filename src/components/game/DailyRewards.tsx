'use client';

import { useGameStore } from '@/lib/game-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const dayNames = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];

export function DailyRewards() {
  const dailyRewards = useGameStore((s) => s.dailyRewards);
  const currentRewardDay = useGameStore((s) => s.currentRewardDay);
  const rewardStreak = useGameStore((s) => s.rewardStreak);
  const canClaimReward = useGameStore((s) => s.canClaimReward);
  const claimDailyReward = useGameStore((s) => s.claimDailyReward);

  const formatCoins = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val.toString();
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">🎁 المكافآت اليومية</h2>
        <div className="flex items-center gap-1 bg-amber-500/20 rounded-full px-3 py-1">
          <span className="text-amber-400 text-sm">🔥</span>
          <span className="text-amber-400 text-sm font-bold">{rewardStreak} يوم متتالي</span>
        </div>
      </div>

      {/* Weekly Calendar */}
      <Card className="bg-slate-800/80 border-slate-700 overflow-hidden">
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1.5">
            {dailyRewards.map((reward, idx) => {
              const isCurrentDay = reward.day === currentRewardDay;
              const isClaimed = reward.isClaimed;
              const isPast = reward.day < currentRewardDay;
              const isFuture = reward.day > currentRewardDay;

              return (
                <div
                  key={reward.id}
                  className={`
                    relative rounded-xl p-2 text-center transition-all duration-300
                    ${isCurrentDay && !isClaimed ? 'bg-emerald-500/20 border-2 border-emerald-400 animate-pulse-glow' : ''}
                    ${isCurrentDay && isClaimed ? 'bg-emerald-600/30 border-2 border-emerald-500' : ''}
                    ${isClaimed && !isCurrentDay ? 'bg-slate-600/50 border border-slate-500' : ''}
                    ${isPast && !isClaimed ? 'bg-red-900/20 border border-red-800/50 opacity-60' : ''}
                    ${isFuture ? 'bg-slate-800/50 border border-slate-700 opacity-70' : ''}
                  `}
                >
                  {/* Day label */}
                  <div className={`text-[9px] font-medium mb-1 ${isCurrentDay ? 'text-emerald-300' : 'text-slate-400'}`}>
                    {dayNames[idx] || `يوم ${reward.day}`}
                  </div>

                  {/* Day number */}
                  <div className={`text-lg font-black mb-1 ${
                    isCurrentDay ? 'text-emerald-400' :
                    isClaimed ? 'text-emerald-300' :
                    isPast && !isClaimed ? 'text-red-400' : 'text-slate-300'
                  }`}>
                    {reward.day}
                  </div>

                  {/* Reward */}
                  <div className="text-[10px] space-y-0.5">
                    <div className="flex items-center justify-center gap-0.5">
                      <span className="text-amber-400">🪙</span>
                      <span className="text-amber-300 font-bold">{formatCoins(reward.coins)}</span>
                    </div>
                    <div className="flex items-center justify-center gap-0.5">
                      <span className="text-purple-400">💎</span>
                      <span className="text-purple-300 font-bold">{reward.gems}</span>
                    </div>
                  </div>

                  {/* Status icon */}
                  {isClaimed && (
                    <div className="absolute top-1 left-1 text-emerald-400 text-xs">✅</div>
                  )}
                  {isCurrentDay && !isClaimed && (
                    <div className="absolute top-1 left-1 text-emerald-400 text-xs animate-bounce">👇</div>
                  )}
                  {isPast && !isClaimed && (
                    <div className="absolute top-1 left-1 text-red-400 text-xs">❌</div>
                  )}

                  {/* Day 7 special indicator */}
                  {reward.day === 7 && (
                    <div className="mt-1 text-[8px] text-amber-400 font-bold">⭐ خاص</div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Claim Button */}
      {canClaimReward && (
        <Card className="border-0 overflow-hidden animate-slide-up" style={{
          background: 'linear-gradient(135deg, #059669, #10b981)',
        }}>
          <CardContent className="p-4 text-center">
            <div className="text-3xl mb-2 animate-bounce-in">🎁</div>
            <h3 className="text-white font-bold text-lg mb-1">مكافأة اليوم جاهزة!</h3>
            <p className="text-white/80 text-sm mb-3">يوم {currentRewardDay} - لا تنسَ استلام مكافأتك</p>
            <Button
              onClick={claimDailyReward}
              className="bg-white text-emerald-700 hover:bg-white/90 font-bold text-lg px-8 py-3 rounded-xl shadow-lg animate-glow-pulse"
            >
              🎁 استلام المكافأة!
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Streak info */}
      <Card className="bg-slate-800/80 border-slate-700">
        <CardContent className="p-4">
          <h3 className="text-white font-bold mb-3">📊 معلومات المتتالية</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">المتتالية الحالية</span>
              <span className="text-amber-400 font-bold">{rewardStreak} يوم</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">اليوم الحالي</span>
              <span className="text-white font-bold">{dayNames[currentRewardDay - 1]}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">مكافأة اليوم السابع</span>
              <span className="text-amber-400 font-bold">500K + 30 💎 + 200K بونص!</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-slate-800/80 border-slate-700">
        <CardContent className="p-4">
          <h3 className="text-white font-bold mb-2">💡 نصائح</h3>
          <ul className="text-slate-400 text-sm space-y-1">
            <li>• استلم مكافأتك يومياً للحفاظ على المتتالية</li>
            <li>• المتتالية الأطول = مكافآت أكبر</li>
            <li>• اليوم السابع يحتوي على مكافأة خاصة!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
