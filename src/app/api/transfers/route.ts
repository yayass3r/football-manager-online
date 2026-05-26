import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const transfers = await db.transferListing.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      transfers: transfers.map(t => ({
        id: t.id,
        playerId: t.playerId,
        playerName: t.playerName,
        position: t.position,
        overall: t.overall,
        askingPrice: t.askingPrice,
        sellerTeam: t.sellerTeam,
      })),
    });
  } catch (error) {
    console.error('Transfers error:', error);
    return NextResponse.json({ error: 'Failed to get transfers' }, { status: 500 });
  }
}
