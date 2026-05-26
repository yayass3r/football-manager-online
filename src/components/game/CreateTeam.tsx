'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/game-store';
import { teamLogos, formations, formationLabels } from '@/lib/game-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const teamColors = [
  '#1a7a2e', '#c41e3a', '#1e3a5f', '#ff6b00', '#6b21a8',
  '#be123c', '#059669', '#d97706', '#0d9488', '#dc2626',
];

export function CreateTeam() {
  const [step, setStep] = useState(1);
  const [teamName, setTeamName] = useState('');
  const [shortName, setShortName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedLogo, setSelectedLogo] = useState('⚽');
  const [primaryColor, setPrimaryColor] = useState('#1a7a2e');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');
  const [formation, setFormation] = useState('4-4-2');
  const [isCreating, setIsCreating] = useState(false);

  const setView = useGameStore((s) => s.setView);
  const loadGameState = useGameStore((s) => s.loadGameState);

  const handleCreate = async () => {
    if (!teamName || !username) return;
    setIsCreating(true);

    try {
      // First initialize the game world
      await fetch('/api/game/init', { method: 'POST' });

      // Then create the team
      const res = await fetch('/api/game/create-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          teamName,
          shortName: shortName || teamName.substring(0, 3),
          logo: selectedLogo,
          primaryColor,
          secondaryColor,
          formation,
        }),
      });

      if (res.ok) {
        await loadGameState();
        setView('home');
      }
    } catch (error) {
      console.error('Failed to create team:', error);
    }
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚽</div>
          <h1 className="text-3xl font-black text-white mb-2">مدير كرة القدم</h1>
          <p className="text-emerald-300/80">أنشئ فريقك وابدأ رحلتك نحو المجد</p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  s <= step
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {s < step ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-0.5 ${s < step ? 'bg-emerald-500' : 'bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-6">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white mb-1">معلومات المدرب والفريق</h2>
                  <p className="text-slate-400 text-sm">أدخل بياناتك واسم فريقك</p>
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">اسم المدرب</label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل اسمك"
                    className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                    dir="rtl"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">اسم الفريق</label>
                  <Input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="مثال: النصر"
                    className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                    dir="rtl"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">الاسم المختصر</label>
                  <Input
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    placeholder="مثال: نصر"
                    className="bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                    dir="rtl"
                    maxLength={5}
                  />
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!username || !teamName}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  التالي ←
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white mb-1">شعار وألوان الفريق</h2>
                  <p className="text-slate-400 text-sm">اختر شعار فريقك وألوانه</p>
                </div>

                {/* Logo Selection */}
                <div>
                  <label className="text-sm text-slate-300 mb-3 block">شعار الفريق</label>
                  <div className="grid grid-cols-8 gap-2">
                    {teamLogos.map((logo) => (
                      <button
                        key={logo}
                        onClick={() => setSelectedLogo(logo)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                          selectedLogo === logo
                            ? 'bg-emerald-500 ring-2 ring-emerald-400 scale-110'
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                      >
                        {logo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="flex items-center justify-center">
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl shadow-xl"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {selectedLogo}
                  </div>
                </div>

                {/* Primary Color */}
                <div>
                  <label className="text-sm text-slate-300 mb-3 block">اللون الأساسي</label>
                  <div className="flex gap-2 flex-wrap">
                    {teamColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setPrimaryColor(color)}
                        className={`w-9 h-9 rounded-full transition-all ${
                          primaryColor === color ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Secondary Color */}
                <div>
                  <label className="text-sm text-slate-300 mb-3 block">اللون الثانوي</label>
                  <div className="flex gap-2 flex-wrap">
                    {['#ffffff', '#000000', '#f5c518', '#c41e3a', '#1e3a5f', '#1a7a2e'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setSecondaryColor(color)}
                        className={`w-9 h-9 rounded-full transition-all border border-slate-600 ${
                          secondaryColor === color ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    → السابق
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    التالي ←
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-white mb-1">التشكيلة</h2>
                  <p className="text-slate-400 text-sm">اختر التشكيلة الأساسية لفريقك</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {formations.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormation(f)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formation === f
                          ? 'border-emerald-500 bg-emerald-500/20 text-white'
                          : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-lg font-bold">{f}</div>
                      <div className="text-sm opacity-70">{formationLabels[f]}</div>
                    </button>
                  ))}
                </div>

                {/* Summary */}
                <div className="bg-slate-900/50 rounded-xl p-4 space-y-2">
                  <h3 className="text-white font-bold text-center mb-3">ملخص الفريق</h3>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {selectedLogo}
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">{teamName}</div>
                      <div className="text-slate-400 text-sm">@{username}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-slate-400">التشكيلة:</div>
                    <div className="text-white">{formation}</div>
                    <div className="text-slate-400">الميزانية:</div>
                    <div className="text-amber-400 font-bold">5,000,000 ريال</div>
                    <div className="text-slate-400">اللاعبون:</div>
                    <div className="text-white">24 لاعب</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    → السابق
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg"
                  >
                    {isCreating ? '⏳ جاري الإنشاء...' : '🏆 إنشاء الفريق!'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
