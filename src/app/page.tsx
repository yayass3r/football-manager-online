'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/game-store';
import { GameShell } from '@/components/game/GameShell';

export default function Home() {
  const isLoading = useGameStore((s) => s.isLoading);
  const isInitialized = useGameStore((s) => s.isInitialized);
  const loadGameState = useGameStore((s) => s.loadGameState);

  useEffect(() => {
    loadGameState();
  }, [loadGameState]);

  if (isLoading && !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⚽</div>
          <h1 className="text-2xl font-black text-white mb-2">مدير كرة القدم</h1>
          <p className="text-emerald-300/60 text-sm">جاري التحميل...</p>
          <div className="mt-4 w-48 h-1 bg-slate-700 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  return <GameShell />;
}
