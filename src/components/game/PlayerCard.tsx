'use client';

import { positionLabels, positionColors } from '@/lib/game-data';

interface PlayerCardProps {
  player: {
    id: string;
    name: string;
    position: string;
    overall: number;
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
    morale: number;
    form: number;
    value: number;
    isInjured: boolean;
    age?: number;
    nationality?: string;
  };
  compact?: boolean;
  onClick?: () => void;
  selected?: boolean;
}

export function PlayerCard({ player, compact = false, onClick, selected }: PlayerCardProps) {
  const posColor = positionColors[player.position] || '#6b7280';
  const posLabel = positionLabels[player.position] || player.position;
  
  const getOverallColor = (ovr: number) => {
    if (ovr >= 85) return 'from-yellow-400 to-amber-600';
    if (ovr >= 75) return 'from-emerald-400 to-emerald-600';
    if (ovr >= 65) return 'from-sky-400 to-sky-600';
    return 'from-gray-400 to-gray-500';
  };

  const getFormIndicator = (form: number) => {
    if (form >= 80) return '🟢';
    if (form >= 60) return '🟡';
    return '🔴';
  };

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all hover:bg-white/10 ${
          selected ? 'ring-2 ring-emerald-400 bg-emerald-500/20' : ''
        } ${player.isInjured ? 'opacity-50' : ''}`}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: posColor }}
        >
          {player.overall}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-medium truncate">{player.name}</div>
          <div className="text-gray-400 text-xs">{posLabel}</div>
        </div>
        <div className="text-left">
          <div className="text-xs">{getFormIndicator(player.form)}</div>
          {player.isInjured && <div className="text-red-400 text-xs">🏥</div>}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl ${
        selected ? 'ring-2 ring-emerald-400' : ''
      } ${player.isInjured ? 'opacity-70' : ''}`}
      style={{
        background: `linear-gradient(135deg, ${posColor}dd, ${posColor}88)`,
      }}
    >
      {/* Overall Badge */}
      <div className={`absolute top-2 right-2 w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg bg-gradient-to-br ${getOverallColor(player.overall)} shadow-lg`}>
        {player.overall}
      </div>

      {/* Position */}
      <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/40 text-white text-xs font-bold">
        {player.position}
      </div>

      {player.isInjured && (
        <div className="absolute top-14 right-2 px-2 py-1 rounded-md bg-red-500/80 text-white text-xs font-bold">
          🏥 مصاب
        </div>
      )}

      <div className="p-4 pt-14">
        {/* Player Name */}
        <div className="text-white font-bold text-base mb-1 text-center">{player.name}</div>
        {player.nationality && (
          <div className="text-white/70 text-xs text-center mb-3">{player.nationality}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[
            { label: 'سرعة', value: player.pace },
            { label: 'تسديد', value: player.shooting },
            { label: 'تمرير', value: player.passing },
            { label: 'مراوغة', value: player.dribbling },
            { label: 'دفاع', value: player.defending },
            { label: 'قوة', value: player.physical },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-white/60 text-[10px]">{stat.label}</div>
              <div className="text-white font-bold text-sm">{stat.value}</div>
              <div className="w-full h-1 rounded-full bg-black/30 mt-0.5">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${stat.value}%`,
                    backgroundColor: stat.value >= 80 ? '#4ade80' : stat.value >= 60 ? '#fbbf24' : '#f87171',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Value */}
        <div className="mt-3 pt-2 border-t border-white/20 flex justify-between items-center">
          <span className="text-white/60 text-xs">القيمة</span>
          <span className="text-amber-300 font-bold text-sm">
            {(player.value / 1000000).toFixed(1)}M
          </span>
        </div>
      </div>
    </div>
  );
}
