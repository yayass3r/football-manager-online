import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const news = await db.newsArticle.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Count unread
    const unreadCount = news.filter(n => !n.isRead).length;

    return NextResponse.json({
      news: news.map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        category: n.category,
        imageEmoji: n.imageEmoji,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
      unreadCount,
    });
  } catch (error) {
    console.error('News GET error:', error);
    return NextResponse.json({ error: 'Failed to get news' }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Mark all as read
    await db.newsArticle.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('News POST error:', error);
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}
