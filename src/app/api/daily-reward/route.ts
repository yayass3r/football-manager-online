import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const weeklyRewards = [
  { day: 1, coins: 100000, gems: 5 },
  { day: 2, coins: 150000, gems: 8 },
  { day: 3, coins: 200000, gems: 10 },
  { day: 4, coins: 250000, gems: 12 },
  { day: 5, coins: 300000, gems: 15 },
  { day: 6, coins: 400000, gems: 20 },
  { day: 7, coins: 500000, gems: 30 },
];

export async function GET() {
  try {
    const manager = await db.manager.findFirst();
    if (!manager) {
      return NextResponse.json({ error: 'no_manager' }, { status: 404 });
    }

    // Get current day of week (1-7, Monday=1)
    const now = new Date();
    const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // Convert Sunday=0 to 7

    // Get or create daily rewards for this week
    let rewards = await db.dailyReward.findMany({
      where: { managerId: manager.id },
      orderBy: { day: 'asc' },
    });

    // If no rewards exist or they're from a different week, create new ones
    if (rewards.length === 0) {
      const createData = weeklyRewards.map(r => ({
        managerId: manager.id,
        day: r.day,
        coins: r.coins,
        gems: r.gems,
        isClaimed: false,
      }));
      await db.dailyReward.createMany({ data: createData });
      rewards = await db.dailyReward.findMany({
        where: { managerId: manager.id },
        orderBy: { day: 'asc' },
      });
    }

    // Calculate streak
    const claimedDays = rewards.filter(r => r.isClaimed).map(r => r.day).sort((a, b) => a - b);
    let streak = 0;
    for (let i = currentDay - 1; i >= 1; i--) {
      if (claimedDays.includes(i)) {
        streak++;
      } else {
        break;
      }
    }
    if (claimedDays.includes(currentDay) && currentDay > 1 && claimedDays.includes(currentDay - 1)) {
      streak++;
    } else if (claimedDays.includes(currentDay) && currentDay === 1) {
      streak = 1;
    }

    const todayReward = rewards.find(r => r.day === currentDay);
    const canClaim = todayReward && !todayReward.isClaimed;

    return NextResponse.json({
      rewards: rewards.map(r => ({
        id: r.id,
        day: r.day,
        coins: r.coins,
        gems: r.gems,
        isClaimed: r.isClaimed,
        claimedAt: r.claimedAt,
      })),
      currentDay,
      streak,
      canClaim,
      todayCoins: todayReward?.coins || 0,
      todayGems: todayReward?.gems || 0,
    });
  } catch (error) {
    console.error('Daily reward GET error:', error);
    return NextResponse.json({ error: 'Failed to get daily rewards' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const manager = await db.manager.findFirst();
    if (!manager) {
      return NextResponse.json({ error: 'no_manager' }, { status: 404 });
    }

    const now = new Date();
    const currentDay = now.getDay() === 0 ? 7 : now.getDay();

    const todayReward = await db.dailyReward.findFirst({
      where: { managerId: manager.id, day: currentDay },
    });

    if (!todayReward) {
      return NextResponse.json({ error: 'no_reward_today' }, { status: 400 });
    }

    if (todayReward.isClaimed) {
      return NextResponse.json({ error: 'already_claimed' }, { status: 400 });
    }

    // Claim the reward
    await db.dailyReward.update({
      where: { id: todayReward.id },
      data: { isClaimed: true, claimedAt: new Date() },
    });

    // Add coins and gems to manager
    const bonus = currentDay === 7 ? 200000 : 0; // Day 7 special bonus
    await db.manager.update({
      where: { id: manager.id },
      data: {
        coins: manager.coins + todayReward.coins + bonus,
        gems: manager.gems + todayReward.gems,
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        title: '🎁 مكافأة يومية!',
        message: `حصلت على ${(todayReward.coins / 1000).toFixed(0)}K عملة و ${todayReward.gems} جوهرة!${bonus > 0 ? ' + مكافأة خاصة 200K!' : ''}`,
        type: 'success',
      },
    });

    return NextResponse.json({
      success: true,
      coins: todayReward.coins + bonus,
      gems: todayReward.gems,
      bonus,
    });
  } catch (error) {
    console.error('Daily reward POST error:', error);
    return NextResponse.json({ error: 'Failed to claim reward' }, { status: 500 });
  }
}
