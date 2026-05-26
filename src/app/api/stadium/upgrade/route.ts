import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { facilityType } = await request.json();
    
    const manager = await db.manager.findFirst();
    if (!manager) {
      return NextResponse.json({ error: 'no_manager' }, { status: 404 });
    }

    const team = await db.team.findUnique({
      where: { managerId: manager.id },
    });

    if (!team) {
      return NextResponse.json({ error: 'no_team' }, { status: 404 });
    }

    const stadium = await db.stadium.findUnique({
      where: { teamId: team.id },
    });

    if (!stadium) {
      return NextResponse.json({ error: 'no_stadium' }, { status: 404 });
    }

    const upgradeCosts: Record<string, { base: number; multiplier: number; label: string }> = {
      capacity: { base: 500000, multiplier: 1.5, label: 'سعة الملعب' },
      facilities: { base: 200000, multiplier: 1.8, label: 'المرافق' },
      youthAcademy: { base: 300000, multiplier: 2.0, label: 'أكاديمية الشباب' },
      trainingGround: { base: 250000, multiplier: 1.8, label: 'أرضية التدريب' },
      medicalCenter: { base: 200000, multiplier: 1.7, label: 'المركز الطبي' },
    };

    const upgrade = upgradeCosts[facilityType];
    if (!upgrade) {
      return NextResponse.json({ error: 'invalid_facility' }, { status: 400 });
    }

    const currentLevel = (stadium as Record<string, unknown>)[facilityType] as number;
    if (currentLevel >= 10) {
      return NextResponse.json({ error: 'max_level' }, { status: 400 });
    }

    const cost = Math.round(upgrade.base * Math.pow(upgrade.multiplier, currentLevel - 1));

    if (manager.coins < cost) {
      return NextResponse.json({ error: 'insufficient_coins', cost }, { status: 400 });
    }

    // Update stadium
    const updateData: Record<string, unknown> = {
      [facilityType]: currentLevel + 1,
      level: Math.round((stadium.facilities + stadium.youthAcademy + stadium.trainingGround + stadium.medicalCenter) / 4),
    };

    if (facilityType === 'capacity') {
      updateData.capacity = stadium.capacity + 2000 + currentLevel * 1000;
    }

    await db.stadium.update({
      where: { id: stadium.id },
      data: updateData,
    });

    // Deduct coins
    await db.manager.update({
      where: { id: manager.id },
      data: {
        coins: manager.coins - cost,
        xp: manager.xp + 15,
      },
    });

    // Create notification
    await db.notification.create({
      data: {
        title: 'ترقية! 🔨',
        message: `تم ترقية ${upgrade.label} إلى المستوى ${currentLevel + 1} مقابل ${cost.toLocaleString()} ريال`,
        type: 'success',
      },
    });

    return NextResponse.json({
      facilityType,
      newLevel: currentLevel + 1,
      cost,
    });
  } catch (error) {
    console.error('Stadium upgrade error:', error);
    return NextResponse.json({ error: 'Failed to upgrade' }, { status: 500 });
  }
}
