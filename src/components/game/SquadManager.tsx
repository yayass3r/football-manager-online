'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/game-store';
import { positionLabels, positionColors } from '@/lib/game-data';
import { getFormationPositions } from '@/lib/game-engine';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayerCard } from './PlayerCard';

export function SquadManager() {
  const team = useGameStore((s) => s.team);
  const players = useGameStore((s) => s.players);
  const selectedPlayer = useGameStore((s) => s.selectedPlayer);
  const setSelectedPlayer = useGameStore((s) => s.setSelectedPlayer);
  const setView = useGameStore((s) => s.setView);

  const [filter, setFilter] = useState<string>('all');

  if (!team) return null;

  const positions = getFormationPositions(team.formation);

  // Group players by position category
  const filteredPlayers = filter === 'all'
    ? players
    : players.filter(p => {
        if (filter === 'GK') return p.position === 'GK';
        if (filter === 'DEF') return ['CB', 'LB', 'RB'].includes(p.position);
        if (filter === 'MID') return ['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(p.position);
        if (filter === 'FWD') return ['ST', 'LW', 'RW', 'CF'].includes(p.position);
        return true;
      });

  // Assign best available player to each position
  const assignedPlayers = new Map<string, typeof players[0]>();
  const usedPlayerIds = new Set<string>();
  
  for (const pos of positions) {
    const compatiblePositions = getCompatiblePositions(pos.position);
    const bestPlayer = players
      .filter(p => compatiblePositions.includes(p.position) && !p.isInjured && !usedPlayerIds.has(p.id))
      .sort((a, b) => b.overall - a.overall)[0];
    
    if (bestPlayer) {
      assignedPlayers.set(pos.position, bestPlayer);
      usedPlayerIds.add(bestPlayer.id);
    }
  }

  const benchPlayers = players.filter(p => !usedPlayerIds.has(p.id));

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">إدارة الفريق</h2>
        <Button
          size="sm"
          variant="outline"
          className="border-slate-600 text-slate-300"
          onClick={() => setView('tactics')}
        >
          ⚙️ التكتيكات
        </Button>
      </div>

      {/* Football Pitch */}
      <Card className="overflow-hidden border-0">
        <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-emerald-700 via-emerald-600 to-emerald-700">
          {/* Pitch markings */}
          <div className="absolute inset-4 border-2 border-white/30 rounded-lg">
            {/* Center line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30" />
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/30 rounded-full" />
            {/* Top penalty area */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-16 border-b-2 border-l-2 border-r-2 border-white/30" />
            {/* Bottom penalty area */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-16 border-t-2 border-l-2 border-r-2 border-white/30" />
          </div>

          {/* Player positions */}
          {positions.map((pos, index) => {
            const player = assignedPlayers.get(pos.position);
            const posColor = positionColors[pos.position] || '#6b7280';
            // Adjust for RTL - mirror X
            const adjustedX = 100 - pos.x;

            return (
              <div
                key={index}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{
                  left: `${adjustedX}%`,
                  top: `${pos.y}%`,
                }}
                onClick={() => {
                  if (player) setSelectedPlayer(player);
                }}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg transition-transform group-hover:scale-110 ${
                    selectedPlayer?.id === player?.id ? 'ring-2 ring-white scale-110' : ''
                  }`}
                  style={{ backgroundColor: posColor }}
                >
                  {player ? player.overall : '?'}
                </div>
                <div className="text-center mt-0.5">
                  <div className="text-white text-[9px] font-bold drop-shadow-lg truncate max-w-[50px]">
                    {player ? player.name.split(' ').pop() : pos.position}
                  </div>
                </div>
                {player?.isInjured && (
                  <div className="absolute -top-1 -right-1 text-xs">🏥</div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Position Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'الكل' },
          { key: 'GK', label: 'حراسة' },
          { key: 'DEF', label: 'دفاع' },
          { key: 'MID', label: 'وسط' },
          { key: 'FWD', label: 'هجوم' },
        ].map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={filter === f.key ? 'default' : 'outline'}
            className={`${
              filter === f.key
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'border-slate-600 text-slate-300 hover:bg-slate-700'
            }`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Player List */}
      <div className="space-y-1">
        {filteredPlayers.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            compact
            selected={selectedPlayer?.id === player.id}
            onClick={() => setSelectedPlayer(selectedPlayer?.id === player.id ? null : player)}
          />
        ))}
      </div>

      {/* Selected Player Detail */}
      {selectedPlayer && (
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg"
                style={{ backgroundColor: positionColors[selectedPlayer.position] || '#6b7280' }}
              >
                {selectedPlayer.overall}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-lg">{selectedPlayer.name}</h3>
                  {selectedPlayer.isInjured && <Badge variant="destructive">مصاب</Badge>}
                </div>
                <div className="text-slate-400 text-sm">
                  {positionLabels[selectedPlayer.position] || selectedPlayer.position} • {selectedPlayer.nationality} • {selectedPlayer.age} سنة
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: 'سرعة', value: selectedPlayer.pace },
                { label: 'تسديد', value: selectedPlayer.shooting },
                { label: 'تمرير', value: selectedPlayer.passing },
                { label: 'مراوغة', value: selectedPlayer.dribbling },
                { label: 'دفاع', value: selectedPlayer.defending },
                { label: 'قوة', value: selectedPlayer.physical },
                { label: 'لياقة', value: selectedPlayer.stamina },
                { label: 'روح', value: selectedPlayer.morale },
                { label: 'حالة', value: selectedPlayer.form },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-slate-400 text-[10px]">{stat.label}</div>
                  <div className="text-white font-bold">{stat.value}</div>
                  <div className="w-full h-1 rounded-full bg-slate-700 mt-0.5">
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

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-700">
              <div>
                <span className="text-slate-400 text-xs">القيمة: </span>
                <span className="text-amber-400 font-bold">{(selectedPlayer.value / 1000000).toFixed(1)}M</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs">الراتب: </span>
                <span className="text-white font-bold">{(selectedPlayer.salary / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getCompatiblePositions(pos: string): string[] {
  const map: Record<string, string[]> = {
    'GK': ['GK'],
    'CB': ['CB'],
    'LB': ['LB', 'CB'],
    'RB': ['RB', 'CB'],
    'CDM': ['CDM', 'CM'],
    'CM': ['CM', 'CDM', 'CAM'],
    'CAM': ['CAM', 'CM', 'LW', 'RW'],
    'LM': ['LM', 'LW', 'CM'],
    'RM': ['RM', 'RW', 'CM'],
    'LW': ['LW', 'LM', 'ST'],
    'RW': ['RW', 'RM', 'ST'],
    'ST': ['ST', 'LW', 'RW', 'CF'],
    'CF': ['CF', 'ST', 'CAM'],
  };
  return map[pos] || [pos];
}
