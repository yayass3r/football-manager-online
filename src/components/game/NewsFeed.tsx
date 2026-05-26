'use client';

import { useGameStore } from '@/lib/game-store';
import { Card, CardContent } from '@/components/ui/card';

const categoryLabels: Record<string, { label: string; icon: string; color: string }> = {
  transfer: { label: 'انتقالات', icon: '📝', color: 'text-purple-400' },
  match: { label: 'مباريات', icon: '⚽', color: 'text-emerald-400' },
  league: { label: 'دوري', icon: '🏆', color: 'text-amber-400' },
  general: { label: 'عام', icon: '📰', color: 'text-slate-400' },
};

export function NewsFeed() {
  const news = useGameStore((s) => s.news);
  const newsUnreadCount = useGameStore((s) => s.newsUnreadCount);
  const markNewsRead = useGameStore((s) => s.markNewsRead);

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">📰 الأخبار</h2>
        {newsUnreadCount > 0 && (
          <button
            onClick={markNewsRead}
            className="text-emerald-400 text-xs hover:text-emerald-300"
          >
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      {newsUnreadCount > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2">
          <span className="text-emerald-400">🔔</span>
          <span className="text-emerald-300 text-sm">{newsUnreadCount} أخبار غير مقروءة</span>
        </div>
      )}

      {news.length === 0 ? (
        <Card className="bg-slate-800/80 border-slate-700">
          <CardContent className="p-8 text-center">
            <div className="text-4xl mb-2">📰</div>
            <p className="text-slate-400">لا توجد أخبار حالياً</p>
            <p className="text-slate-500 text-sm mt-1">ستظهر الأخبار مع تقدمك في اللعبة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {news.map((article, idx) => {
            const cat = categoryLabels[article.category] || categoryLabels.general;

            return (
              <Card
                key={article.id}
                className={`overflow-hidden transition-all animate-slide-up ${
                  !article.isRead ? 'bg-slate-800/90 border-slate-600' : 'bg-slate-800/50 border-slate-700'
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
                onClick={() => {
                  if (!article.isRead) markNewsRead();
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Emoji image */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                      !article.isRead ? 'bg-slate-700' : 'bg-slate-800'
                    }`}>
                      {article.imageEmoji || cat.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          article.category === 'transfer' ? 'bg-purple-500/20 text-purple-400' :
                          article.category === 'match' ? 'bg-emerald-500/20 text-emerald-400' :
                          article.category === 'league' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-slate-600/30 text-slate-400'
                        }`}>
                          {cat.label}
                        </span>
                        {!article.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </div>
                      <h3 className={`font-bold text-sm leading-tight ${
                        !article.isRead ? 'text-white' : 'text-slate-300'
                      }`}>
                        {article.title}
                      </h3>
                      <p className={`text-xs mt-1 line-clamp-2 ${
                        !article.isRead ? 'text-slate-300' : 'text-slate-500'
                      }`}>
                        {article.content}
                      </p>
                      <div className="text-slate-500 text-[10px] mt-1.5">
                        {formatTimeAgo(article.createdAt)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
