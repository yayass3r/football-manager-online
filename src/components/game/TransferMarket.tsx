'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/game-store';
import { positionLabels, positionColors } from '@/lib/game-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export function TransferMarket() {
  const manager = useGameStore((s) => s.manager);
  const players = useGameStore((s) => s.players);
  const updateManagerCoins = useGameStore((s) => s.updateManagerCoins);
  const setPlayers = useGameStore((s) => s.setPlayers);
  const loadGameState = useGameStore((s) => s.loadGameState);

  const [transfers, setTransfers] = useState<Array<{
    id: string;
    playerId: string;
    playerName: string;
    position: string;
    overall: number;
    askingPrice: number;
    sellerTeam: string;
  }>>([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'overall' | 'price'>('overall');
  const [isLoading, setIsLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [sellPrice, setSellPrice] = useState<Record<string, number>>({});
  const [selling, setSelling] = useState<string | null>(null);
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');

  useEffect(() => {
    const fetchTransfers = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/transfers');
        if (res.ok) {
          const data = await res.json();
          setTransfers(data.transfers || []);
        }
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    };
    fetchTransfers();
  }, []);

  const loadTransfers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/transfers');
      if (res.ok) {
        const data = await res.json();
        setTransfers(data.transfers || []);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const handleBuy = async (transferId: string, price: number) => {
    if (!manager || manager.coins < price) return;
    setBuying(transferId);
    try {
      const res = await fetch('/api/transfers/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transferId }),
      });
      if (res.ok) {
        updateManagerCoins(-price);
        await loadGameState();
        await loadTransfers();
      } else {
        const data = await res.json();
        alert(data.error === 'insufficient_coins' ? 'رصيد غير كافي!' : 'فشل في الشراء');
      }
    } catch (e) {
      console.error(e);
    }
    setBuying(null);
  };

  const handleSell = async (playerId: string) => {
    const price = sellPrice[playerId];
    if (!price || price <= 0) return;
    setSelling(playerId);
    try {
      const res = await fetch('/api/transfers/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, askingPrice: price }),
      });
      if (res.ok) {
        await loadGameState();
      }
    } catch (e) {
      console.error(e);
    }
    setSelling(null);
  };

  const filteredTransfers = transfers
    .filter(t => filter === 'all' || t.position === filter)
    .sort((a, b) => sortBy === 'overall' ? b.overall - a.overall : a.askingPrice - b.askingPrice);

  const myPlayersOnTransfer = players.filter(p => p.isOnTransfer);

  return (
    <div className="space-y-4 pb-4">
      <h2 className="text-white font-bold text-lg">سوق الانتقالات</h2>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          size="sm"
          className={tab === 'buy' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}
          onClick={() => setTab('buy')}
        >
          🛒 شراء
        </Button>
        <Button
          size="sm"
          className={tab === 'sell' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}
          onClick={() => setTab('sell')}
        >
          💰 بيع
        </Button>
      </div>

      {tab === 'buy' && (
        <>
          {/* Budget */}
          <Card className="bg-slate-800/80 border-slate-700">
            <CardContent className="p-3 flex justify-between items-center">
              <span className="text-slate-400 text-sm">الميزانية المتاحة</span>
              <span className="text-amber-400 font-bold">
                🪙 {manager ? (manager.coins / 1000000).toFixed(1) : '0'}M
              </span>
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'outline'}
              className={filter === 'all' ? 'bg-emerald-600 text-white' : 'border-slate-600 text-slate-300'}
              onClick={() => setFilter('all')}
            >
              الكل
            </Button>
            {['GK', 'CB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'].map((pos) => (
              <Button
                key={pos}
                size="sm"
                variant={filter === pos ? 'default' : 'outline'}
                className={filter === pos ? 'bg-emerald-600 text-white' : 'border-slate-600 text-slate-300'}
                onClick={() => setFilter(pos)}
              >
                {positionLabels[pos] || pos}
              </Button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={sortBy === 'overall' ? 'default' : 'outline'}
              className={sortBy === 'overall' ? 'bg-slate-600 text-white' : 'border-slate-600 text-slate-300'}
              onClick={() => setSortBy('overall')}
            >
              الأفضل تقييماً
            </Button>
            <Button
              size="sm"
              variant={sortBy === 'price' ? 'default' : 'outline'}
              className={sortBy === 'price' ? 'bg-slate-600 text-white' : 'border-slate-600 text-slate-300'}
              onClick={() => setSortBy('price')}
            >
              الأرخص
            </Button>
          </div>

          {/* Transfer List */}
          {isLoading ? (
            <div className="text-center text-slate-400 py-8">جاري التحميل...</div>
          ) : filteredTransfers.length === 0 ? (
            <div className="text-center text-slate-400 py-8">لا يوجد لاعبون متاحون</div>
          ) : (
            <div className="space-y-2">
              {filteredTransfers.map((t) => {
                const posColor = positionColors[t.position] || '#6b7280';
                const canAfford = manager ? manager.coins >= t.askingPrice : false;

                return (
                  <Card key={t.id} className="bg-slate-800/80 border-slate-700">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md"
                          style={{ backgroundColor: posColor }}
                        >
                          {t.overall}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-bold text-sm truncate">{t.playerName}</div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400">{positionLabels[t.position] || t.position}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">{t.sellerTeam}</span>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-amber-400 font-bold text-sm">
                            {(t.askingPrice / 1000000).toFixed(1)}M
                          </div>
                          <Button
                            size="sm"
                            disabled={!canAfford || buying === t.id}
                            onClick={() => handleBuy(t.id, t.askingPrice)}
                            className={`mt-1 text-xs ${
                              canAfford
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-slate-700 text-slate-500'
                            }`}
                          >
                            {buying === t.id ? '⏳' : canAfford ? 'تعاقد' : 'رصيد غير كافٍ'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === 'sell' && (
        <>
          <div className="text-slate-400 text-sm mb-2">ضع لاعبيك في سوق الانتقالات</div>
          
          {myPlayersOnTransfer.length > 0 && (
            <div className="mb-4">
              <h3 className="text-white font-bold text-sm mb-2">اللاعبون المعروضون</h3>
              {myPlayersOnTransfer.map(p => (
                <Card key={p.id} className="bg-slate-800/80 border-slate-700 mb-2">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold text-sm">{p.name}</div>
                      <div className="text-slate-400 text-xs">{positionLabels[p.position]} • {p.overall}</div>
                    </div>
                    <Badge className="bg-amber-600 text-white">
                      {(p.transferPrice! / 1000000).toFixed(1)}M
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {players.filter(p => !p.isOnTransfer && !p.isInjured).map(p => (
              <Card key={p.id} className="bg-slate-800/80 border-slate-700">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: positionColors[p.position] || '#6b7280' }}
                    >
                      {p.overall}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold text-sm truncate">{p.name}</div>
                      <div className="text-slate-400 text-xs">{positionLabels[p.position]} • القيمة: {(p.value / 1000000).toFixed(1)}M</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="السعر"
                        className="w-24 h-8 text-xs bg-slate-900 border-slate-600 text-white"
                        value={sellPrice[p.id] || ''}
                        onChange={(e) => setSellPrice({ ...sellPrice, [p.id]: parseInt(e.target.value) || 0 })}
                      />
                      <Button
                        size="sm"
                        disabled={!sellPrice[p.id] || selling === p.id}
                        onClick={() => handleSell(p.id)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                      >
                        {selling === p.id ? '⏳' : 'بيع'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
