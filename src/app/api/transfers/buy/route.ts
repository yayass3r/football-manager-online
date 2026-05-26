import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generatePlayerStats } from '@/lib/game-data';

export async function POST(request: NextRequest) {
  try {
    const { transferId } = await request.json();

    const transfer = await db.transferListing.findUnique({
      where: { id: transferId },
    });

    if (!transfer) {
      return NextResponse.json({ error: 'transfer_not_found' }, { status: 404 });
    }

    const manager = await db.manager.findFirst();
    if (!manager) {
      return NextResponse.json({ error: 'no_manager' }, { status: 404 });
    }

    if (manager.coins < transfer.askingPrice) {
      return NextResponse.json({ error: 'insufficient_coins' }, { status: 400 });
    }

    const team = await db.team.findUnique({
      where: { managerId: manager.id },
    });

    if (!team) {
      return NextResponse.json({ error: 'no_team' }, { status: 404 });
    }

    // Generate stats for the player based on their position and overall
    const stats = generatePlayerStats(transfer.position, transfer.overall);

    // Create player for the team
    const player = await db.player.create({
      data: {
        name: transfer.playerName,
        position: transfer.position,
        nationality: '',
        age: 20 + Math.floor(Math.random() * 10),
        overall: transfer.overall,
        pace: stats.pace,
        shooting: stats.shooting,
        passing: stats.passing,
        dribbling: stats.dribbling,
        defending: stats.defending,
        physical: stats.physical,
        stamina: stats.stamina,
        value: transfer.askingPrice,
        salary: Math.round(transfer.overall * transfer.overall * 8 + 10000),
        morale: 70,
        form: 70,
        teamId: team.id,
      },
    });

    // Deduct coins
    await db.manager.update({
      where: { id: manager.id },
      data: {
        coins: manager.coins - transfer.askingPrice,
        xp: manager.xp + 20,
      },
    });

    // Remove from transfer market
    await db.transferListing.delete({
      where: { id: transferId },
    });

    // Create notification
    await db.notification.create({
      data: {
        title: 'صفقة جديدة! 🎉',
        message: `تم التعاقد مع ${transfer.playerName} (${transfer.position} - ${transfer.overall}) مقابل ${transfer.askingPrice.toLocaleString()} ريال`,
        type: 'success',
      },
    });

    return NextResponse.json({
      player: {
        id: player.id,
        name: player.name,
        position: player.position,
        overall: player.overall,
      },
      cost: transfer.askingPrice,
    });
  } catch (error) {
    console.error('Buy error:', error);
    return NextResponse.json({ error: 'Failed to buy player' }, { status: 500 });
  }
}
