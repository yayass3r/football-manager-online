import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { playerId, askingPrice } = await request.json();

    const player = await db.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return NextResponse.json({ error: 'player_not_found' }, { status: 404 });
    }

    const manager = await db.manager.findFirst();
    if (!manager) {
      return NextResponse.json({ error: 'no_manager' }, { status: 404 });
    }

    const team = await db.team.findUnique({
      where: { managerId: manager.id },
    });

    if (!team || player.teamId !== team.id) {
      return NextResponse.json({ error: 'not_your_player' }, { status: 400 });
    }

    // Mark player as on transfer
    await db.player.update({
      where: { id: playerId },
      data: {
        isOnTransfer: true,
        transferPrice: askingPrice,
      },
    });

    // Create transfer listing
    const listing = await db.transferListing.create({
      data: {
        playerId: player.id,
        playerName: player.name,
        position: player.position,
        overall: player.overall,
        askingPrice,
        sellerTeam: team.name,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      listing: {
        id: listing.id,
        playerName: player.name,
        askingPrice,
      },
    });
  } catch (error) {
    console.error('Sell error:', error);
    return NextResponse.json({ error: 'Failed to sell player' }, { status: 500 });
  }
}
