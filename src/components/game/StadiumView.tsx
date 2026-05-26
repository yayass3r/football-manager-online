'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/game-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function StadiumView() {
  const stadium = useGameStore((s) => s.stadium);
  const team = useGameStore((s) => s.team);
  const manager = useGameStore((s) => s.manager);
  const loadGameState = useGameStore((s) => s.loadGameState);

  const [upgrading, setUpgrading] = useState<string | null>(null);

  if (!stadium || !team || !manager) return null;

  const facilities = [
    {
      key: 'capacity',
      label: 'سعة الملعب',
      icon: '🏟️',
      level: stadium.level,
      value: stadium.capacity.toLocaleString(),
      baseCost: 500000,
      multiplier: 1.5,
      description: 'زيادة عدد المقاعد ودخل التذاكر',
    },
    {
      key: 'facilities',
      label: 'المرافق',
      icon: '🏢',
      level: stadium.facilities,
      value: stadium.facilities.toString(),
      baseCost: 200000,
      multiplier: 1.8,
      description: 'تحسين تجربة الجمهور والإيرادات',
    },
    {
      key: 'youthAcademy',
      label: 'أكاديمية الشباب',
      icon: '🎓',
      level: stadium.youthAcademy,
      value: stadium.youthAcademy.toString(),
      baseCost: 300000,
      multiplier: 2.0,
      description: 'اكتشاف المواهب الشابة وتطويرها',
    },
    {
      key: 'trainingGround',
      label: 'أرضية التدريب',
      icon: '⚽',
      level: stadium.trainingGround,
      value: stadium.trainingGround.toString(),
      baseCost: 250000,
      multiplier: 1.8,
      description: 'تحسين جودة التدريب وتسريع تطور اللاعبين',
    },
    {
      key: 'medicalCenter',
      label: 'المركز الطبي',
      icon: '🏥',
      level: stadium.medicalCenter,
      value: stadium.medicalCenter.toString(),
      baseCost: 200000,
      multiplier: 1.7,
      description: 'تسريع شفاء اللاعبين المصابين',
    },
  ];

  const getUpgradeCost = (base: number, multiplier: number, level: number) => {
    return Math.round(base * Math.pow(multiplier, level - 1));
  };

  const handleUpgrade = async (key: string) => {
    setUpgrading(key);
    try {
      const res = await fetch('/api/stadium/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilityType: key }),
      });

      if (res.ok) {
        await loadGameState();
      } else {
        const data = await res.json();
        if (data.error === 'insufficient_coins') {
          alert('رصيد غير كافي! تحتاج ' + data.cost?.toLocaleString() + ' ريال');
        } else if (data.error === 'max_level') {
          alert('وصلت إلى الحد الأقصى!');
        }
      }
    } catch (e) {
      console.error(e);
    }
    setUpgrading(null);
  };

  // Revenue calculations
  const ticketRevenue = Math.round(stadium.capacity * stadium.ticketPrice * 0.6);
  const facilitiesRevenue = stadium.facilities * 50000;
  const totalRevenue = ticketRevenue + facilitiesRevenue;

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-white font-bold text-lg">الملعب</h2>

      {/* Stadium Visual */}
      <Card className="overflow-hidden border-0">
        <div
          className="relative aspect-video bg-gradient-to-b from-sky-900 via-emerald-800 to-emerald-900"
          style={{ background: `linear-gradient(180deg, ${team.primaryColor}44 0%, ${team.primaryColor}88 100%)` }}
        >
          {/* Stadium outline */}
          <div className="absolute inset-8 border-4 border-white/20 rounded-[50%]" />
          <div className="absolute inset-x-[25%] top-1/2 -translate-y-1/2 h-0.5 bg-white/20" />
          
          {/* Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-4xl">{team.logo}</div>
            <div className="text-white font-bold text-sm mt-1">{stadium.name}</div>
          </div>

          {/* Capacity Label */}
          <div className="absolute bottom-3 left-0 right-0 text-center">
            <div className="text-white/60 text-xs">السعة: {stadium.capacity.toLocaleString()} متفرج</div>
          </div>
        </div>
      </Card>

      {/* Revenue Overview */}
      <Card className="bg-slate-800/80 border-slate-700">
        <CardContent className="p-4">
          <h3 className="text-white font-bold mb-3">💰 الإيرادات</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-slate-400 text-xs">تذاكر</div>
              <div className="text-amber-400 font-bold">{(ticketRevenue / 1000).toFixed(0)}K</div>
            </div>
            <div className="text-center">
              <div className="text-slate-400 text-xs">مرافق</div>
              <div className="text-amber-400 font-bold">{(facilitiesRevenue / 1000).toFixed(0)}K</div>
            </div>
            <div className="text-center">
              <div className="text-slate-400 text-xs">الإجمالي</div>
              <div className="text-emerald-400 font-bold">{(totalRevenue / 1000).toFixed(0)}K</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facilities */}
      <div className="space-y-2">
        {facilities.map((facility) => {
          const cost = getUpgradeCost(facility.baseCost, facility.multiplier, facility.level);
          const canAfford = manager.coins >= cost;
          const isMax = facility.level >= 10;

          return (
            <Card key={facility.key} className="bg-slate-800/80 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{facility.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-bold text-sm">{facility.label}</h4>
                      <span className="text-emerald-400 font-bold text-sm">المستوى {facility.level}</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">{facility.description}</p>

                    {/* Level Progress */}
                    <div className="mt-2">
                      <Progress value={facility.level * 10} className="h-1.5" />
                    </div>

                    {!isMax && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-amber-400 text-xs font-bold">
                          الترقية: {cost.toLocaleString()} ريال
                        </span>
                        <Button
                          size="sm"
                          disabled={!canAfford || upgrading === facility.key}
                          onClick={() => handleUpgrade(facility.key)}
                          className={`text-xs ${
                            canAfford
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-slate-700 text-slate-500'
                          }`}
                        >
                          {upgrading === facility.key ? '⏳' : 'ترقية ↑'}
                        </Button>
                      </div>
                    )}
                    {isMax && (
                      <div className="text-emerald-400 text-xs mt-2 font-bold">✨ الحد الأقصى</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
