'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/game-store';
import { formations, formationLabels } from '@/lib/game-data';
import { getFormationPositions } from '@/lib/game-engine';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export function TacticsBoard() {
  const team = useGameStore((s) => s.team);
  const setView = useGameStore((s) => s.setView);

  const [selectedFormation, setSelectedFormation] = useState(team?.formation || '4-4-2');
  const [attackingStyle, setAttackingStyle] = useState(50);
  const [pressingIntensity, setPressingIntensity] = useState(50);
  const [tempo, setTempo] = useState(50);
  const [isSaving, setIsSaving] = useState(false);

  if (!team) return null;

  const positions = getFormationPositions(selectedFormation);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/team/formation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formation: selectedFormation }),
      });
    } catch (e) {
      console.error(e);
    }
    setIsSaving(false);
    setView('squad');
  };

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-white font-bold text-lg">التكتيكات</h2>

      {/* Formation Selector */}
      <Card className="bg-slate-800/80 border-slate-700">
        <CardContent className="p-4">
          <h3 className="text-white font-bold mb-3">التشكيلة</h3>
          <div className="grid grid-cols-3 gap-2">
            {formations.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFormation(f)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  selectedFormation === f
                    ? 'border-emerald-500 bg-emerald-500/20 text-white'
                    : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-base font-bold">{f}</div>
                <div className="text-[10px] opacity-70">{formationLabels[f]}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Formation Preview */}
      <Card className="overflow-hidden border-0">
        <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-emerald-700 via-emerald-600 to-emerald-700">
          <div className="absolute inset-4 border-2 border-white/30 rounded-lg">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/30 rounded-full" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-16 border-b-2 border-l-2 border-r-2 border-white/30" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-16 border-t-2 border-l-2 border-r-2 border-white/30" />
          </div>

          {positions.map((pos, index) => {
            const adjustedX = 100 - pos.x;
            return (
              <div
                key={index}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${adjustedX}%`, top: `${pos.y}%` }}
              >
                <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-emerald-800 font-bold text-xs shadow-lg">
                  {pos.position}
                </div>
                <div className="text-center mt-0.5 text-white text-[8px] font-bold drop-shadow-lg">
                  {pos.position}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Style Sliders */}
      <Card className="bg-slate-800/80 border-slate-700">
        <CardContent className="p-4 space-y-5">
          <h3 className="text-white font-bold">أسلوب اللعب</h3>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">دفاعي</span>
              <span className="text-white font-bold">{attackingStyle}%</span>
              <span className="text-slate-400">هجومي</span>
            </div>
            <Slider
              value={[attackingStyle]}
              onValueChange={(v) => setAttackingStyle(v[0])}
              max={100}
              step={1}
              className="[&_[role=slider]]:bg-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">ضغط خفيف</span>
              <span className="text-white font-bold">{pressingIntensity}%</span>
              <span className="text-slate-400">ضغط عالي</span>
            </div>
            <Slider
              value={[pressingIntensity]}
              onValueChange={(v) => setPressingIntensity(v[0])}
              max={100}
              step={1}
              className="[&_[role=slider]]:bg-emerald-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">بطيء</span>
              <span className="text-white font-bold">{tempo}%</span>
              <span className="text-slate-400">سريع</span>
            </div>
            <Slider
              value={[tempo]}
              onValueChange={(v) => setTempo(v[0])}
              max={100}
              step={1}
              className="[&_[role=slider]]:bg-emerald-500"
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
      >
        {isSaving ? '⏳ جاري الحفظ...' : '💾 حفظ التكتيكات'}
      </Button>
    </div>
  );
}
