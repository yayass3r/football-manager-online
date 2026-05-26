import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { playerId, trainingType } = await request.json();
    
    const player = await db.player.findUnique({ where: { id: playerId } });
    if (!player) {
      return NextResponse.json({ error: 'player_not_found' }, { status: 404 });
    }

    const trainingCosts: Record<string, { cost: number; stat: string; max: number }> = {
      stamina: { cost: 50000, stat: 'stamina', max: 99 },
      shooting: { cost: 80000, stat: 'shooting', max: 99 },
      passing: { cost: 60000, stat: 'passing', max: 99 },
      dribbling: { cost: 70000, stat: 'dribbling', max: 99 },
      defending: { cost: 60000, stat: 'defending', max: 99 },
      physical: { cost: 50000, stat: 'physical', max: 99 },
    };

    const training = trainingCosts[trainingType];
    if (!training) {
      return NextResponse.json({ error: 'invalid_training_type' }, { status: 400 });
    }

    // Check if player is injured
    if (player.isInjured) {
      return NextResponse.json({ error: 'player_injured' }, { status: 400 });
    }

    // Check manager coins
    const manager = await db.manager.findFirst();
    if (!manager || manager.coins < training.cost) {
      return NextResponse.json({ error: 'insufficient_coins' }, { status: 400 });
    }

    // Apply training
    const currentValue = (player as Record<string, unknown>)[training.stat] as number;
    const improvement = Math.min(
      Math.floor(Math.random() * 3) + 1, // 1-3 improvement
      training.max - currentValue
    );

    if (improvement <= 0) {
      return NextResponse.json({ error: 'max_stat_reached' }, { status: 400 });
    }

    // Injury chance (5%)
    const isInjured = Math.random() < 0.05;
    const injuryWeeks = isInjured ? Math.floor(Math.random() * 3) + 1 : 0;

    // Update player
    const updateData: Record<string, unknown> = {
      overall: Math.min(99, player.overall + (improvement > 1 ? 1 : 0)),
      isInjured: isInjured ? true : player.isInjured,
      injuryWeeks: isInjured ? injuryWeeks : player.injuryWeeks,
      value: Math.round(player.value * (1 + improvement * 0.02)),
      form: Math.min(99, player.form + Math.floor(Math.random() * 3)),
    };
    updateData[training.stat] = currentValue + improvement;
    await db.player.update({
      where: { id: playerId },
      data: updateData,
    });

    // Deduct coins
    await db.manager.update({
      where: { id: manager.id },
      data: {
        coins: manager.coins - training.cost,
        xp: manager.xp + 10,
      },
    });

    // Create training session record
    await db.trainingSession.create({
      data: {
        type: trainingType,
        cost: training.cost,
        duration: 2,
      },
    });

    return NextResponse.json({
      improvement,
      stat: training.stat,
      cost: training.cost,
      isInjured,
      injuryWeeks,
    });
  } catch (error) {
    console.error('Training error:', error);
    return NextResponse.json({ error: 'Failed to train' }, { status: 500 });
  }
}
