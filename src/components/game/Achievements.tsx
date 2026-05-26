'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/game-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const categoryLabels: Record<string, string> = {
  all: 'الكل',
  career: 'المسيرة',
  match: 'المباريات',
  transfer: 'الانتقالات',
  training: 'التدريب',
  league: 'الدوري',
};

const categoryColors: Record<string, string> = {
  career: 'from-amber-500 to-amber-600',
  match: 'from-emerald-500 to-emerald-600',
  transfer: 'from-purple-500 to-purple-600',
  training: 'from-orange-500 to-orange-600',
  league: 'from-cyan-500 to-cyan-600',
};

export function Achievements() {
  const achievements = useGameStore((s) => s.achievements);
  const manager = useGameStore((s) => s.manager);
  const updateManagerCoins = useGameStore((s) => s.updateManagerCoins);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  const completedCount = achievements.filter(a => a.isCompleted).length;
  const totalReward = achievements.filter(a => a.isClaimed).reduce((sum, a) => sum + a.reward, 0);

  const handleClaimReward = async (achievementId: string, reward: number) => {
    if (!manager) return;
    setClaimingId(achievementId);
    // Update local state immediately
    updateManagerCoins(reward);
    // In a full implementation, this would call an API
    setTimeout(() => setClaimingId(null), 1000);
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">🏅 الإنجازات</h2>
        <div className="text-slate-400 text-sm">{completedCount}/{achievements.length}</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="p-3 text-center">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-emerald-400 font-bold text-lg">{completedCount}</div>
            <div className="text-slate-400 text-xs">إنجاز مكتمل</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="p-3 text-center">
            <div className="text-2xl mb-1">🪙</div>
            <div className="text-amber-400 font-bold text-lg">{(totalReward / 1000000).toFixed(1)}M</div>
            <div className="text-slate-400 text-xs">مكافآت محصلة</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filters */}
      <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedCategory === key
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Achievement Cards */}
      <div className="space-y-2">
        {filteredAchievements.map((achievement) => {
          const progressPercent = Math.min(100, Math.round((achievement.progress / achievement.target) * 100));
          const isCompleted = achievement.isCompleted;
          const gradientClass = categoryColors[achievement.category] || 'from-slate-500 to-slate-600';

          return (
            <Card
              key={achievement.id}
              className={`overflow-hidden transition-all duration-300 ${
                isCompleted ? 'border-amber-500/50' : 'border-slate-700'
              }`}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    isCompleted ? 'bg-amber-500/20' : 'bg-slate-700/50'
                  } ${isCompleted ? 'animate-bounce-in' : ''}`}>
                    {achievement.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-sm ${isCompleted ? 'text-amber-300' : 'text-white'}`}>
                        {achievement.title}
                      </h3>
                      {isCompleted && <span className="text-amber-400 text-xs">✅</span>}
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">{achievement.description}</p>

                    {/* Progress bar */}
                    {!isCompleted && (
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-slate-500">{achievement.progress}/{achievement.target}</span>
                          <span className="text-slate-500">{progressPercent}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 bg-gradient-to-l ${gradientClass}`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Reward info */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-amber-400 text-[10px]">🪙 {(achievement.reward / 1000).toFixed(0)}K</span>
                      <span className="text-slate-600 text-[10px]">|</span>
                      <span className="text-slate-400 text-[10px]">{categoryLabels[achievement.category]}</span>
                    </div>
                  </div>

                  {/* Claim button */}
                  {isCompleted && !achievement.isClaimed && (
                    <Button
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs shrink-0"
                      onClick={() => handleClaimReward(achievement.id, achievement.reward)}
                      disabled={claimingId === achievement.id}
                    >
                      {claimingId === achievement.id ? '⏳' : '🎁 استلام'}
                    </Button>
                  )}
                </div>
              </CardContent>

              {/* Completed overlay effect */}
              {isCompleted && (
                <div className={`h-1 bg-gradient-to-l ${gradientClass}`} />
              )}
            </Card>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-2">🏅</div>
            <p className="text-slate-400">لا توجد إنجازات في هذه الفئة بعد</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
