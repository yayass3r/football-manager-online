'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/game-store';
import { trainingTypes, positionLabels, positionColors } from '@/lib/game-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function TrainingCenter() {
  const manager = useGameStore((s) => s.manager);
  const players = useGameStore((s) => s.players);
  const updateManagerCoins = useGameStore((s) => s.updateManagerCoins);
  const updatePlayer = useGameStore((s) => s.updatePlayer);
  const loadGameState = useGameStore((s) => s.loadGameState);

  const [selectedTraining, setSelectedTraining] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [result, setResult] = useState<{
    improvement: number;
    stat: string;
    isInjured: boolean;
  } | null>(null);

  const handleTrain = async () => {
    if (!selectedTraining || !selectedPlayerId) return;
    setIsTraining(true);
    setResult(null);

    try {
      const res = await fetch('/api/players/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: selectedPlayerId, trainingType: selectedTraining }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        await loadGameState();
      } else {
        const data = await res.json();
        if (data.error === 'insufficient_coins') {
          alert('رصيد غير كافي!');
        } else if (data.error === 'player_injured') {
          alert('اللاعب مصاب ولا يمكن تدريبه!');
        }
      }
    } catch (e) {
      console.error(e);
    }
    setIsTraining(false);
  };

  const activePlayers = players.filter(p => !p.isInjured);
  const selectedTrainingData = trainingTypes.find(t => t.type === selectedTraining);

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-white font-bold text-lg">مركز التدريب</h2>

      {/* Budget */}
      <Card className="bg-slate-800/80 border-slate-700">
        <CardContent className="p-3 flex justify-between items-center">
          <span className="text-slate-400 text-sm">الميزانية المتاحة</span>
          <span className="text-amber-400 font-bold">
            🪙 {manager ? (manager.coins / 1000000).toFixed(1) : '0'}M
          </span>
        </CardContent>
      </Card>

      {/* Training Types */}
      <div className="grid grid-cols-3 gap-2">
        {trainingTypes.map((t) => (
          <button
            key={t.type}
            onClick={() => { setSelectedTraining(t.type); setResult(null); }}
            className={`p-3 rounded-xl border-2 text-center transition-all ${
              selectedTraining === t.type
                ? 'border-emerald-500 bg-emerald-500/20'
                : 'border-slate-600 bg-slate-800/80 hover:border-slate-500'
            }`}
          >
            <div className="text-2xl mb-1">{t.icon}</div>
            <div className="text-white text-xs font-bold">{t.label}</div>
            <div className="text-amber-400 text-[10px] mt-1">{(t.cost / 1000)}K</div>
          </button>
        ))}
      </div>

      {/* Training Description */}
      {selectedTrainingData && (
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedTrainingData.icon}</span>
              <div>
                <div className="text-white font-bold text-sm">{selectedTrainingData.label}</div>
                <div className="text-slate-400 text-xs">{selectedTrainingData.description}</div>
                <div className="text-amber-400 text-xs mt-1">التكلفة: {selectedTrainingData.cost.toLocaleString()} ريال</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Select Player */}
      {selectedTraining && (
        <>
          <h3 className="text-white font-bold text-sm">اختر اللاعب</h3>
          <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
            {activePlayers.map(p => (
              <div
                key={p.id}
                onClick={() => { setSelectedPlayerId(p.id); setResult(null); }}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                  selectedPlayerId === p.id
                    ? 'bg-emerald-500/20 ring-1 ring-emerald-500'
                    : 'bg-slate-800/80 hover:bg-slate-700/80'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: positionColors[p.position] || '#6b7280' }}
                >
                  {p.overall}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{p.name}</div>
                  <div className="text-slate-400 text-xs">{positionLabels[p.position]} • {(p as Record<string, unknown>)[selectedTrainingData?.stat || ''] as number}</div>
                </div>
                {selectedPlayerId === p.id && (
                  <Badge className="bg-emerald-600 text-white">✓</Badge>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={handleTrain}
            disabled={!selectedPlayerId || isTraining}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            {isTraining ? '⏳ جاري التدريب...' : '🏋️ بدء التدريب'}
          </Button>
        </>
      )}

      {/* Training Result */}
      {result && (
        <Card className={`border-0 ${result.isInjured ? 'bg-red-600/20' : 'bg-emerald-600/20'}`}>
          <CardContent className="p-4 text-center">
            {result.isInjured ? (
              <>
                <div className="text-3xl mb-2">🏥</div>
                <div className="text-red-400 font-bold">إصابة أثناء التدريب!</div>
                <div className="text-slate-400 text-sm mt-1">اللاعب سيغيب لبضعة أسابيع</div>
              </>
            ) : (
              <>
                <div className="text-3xl mb-2">📈</div>
                <div className="text-emerald-400 font-bold">تحسن!</div>
                <div className="text-white text-sm mt-1">
                  +{result.improvement} في {trainingTypes.find(t => t.type === selectedTraining)?.label}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Injured Players */}
      {players.filter(p => p.isInjured).length > 0 && (
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="p-4">
            <h3 className="text-red-400 font-bold mb-2">🏥 المصابون</h3>
            <div className="space-y-1">
              {players.filter(p => p.isInjured).map(p => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <span className="text-white">{p.name}</span>
                  <span className="text-red-400 text-xs">غائب {p.injuryWeeks} أسبوع</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
