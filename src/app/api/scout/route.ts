import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generatePlayerName, generateNationality, generatePlayerStats, generatePlayerValue } from '@/lib/game-data';

export async function GET() {
  try {
    const manager = await db.manager.findFirst();
    if (!manager) {
      return NextResponse.json({ error: 'no_manager' }, { status: 404 });
    }

    // Get current scout reports that haven't expired
    const now = new Date();
    let reports = await db.scoutReport.findMany({
      where: { expiresAt: { gt: now } },
      orderBy: { createdAt: 'desc' },
    });

    // If no reports exist, generate initial ones
    if (reports.length === 0) {
      reports = await generateScoutReports();
    }

    return NextResponse.json({
      reports: reports.map(r => ({
        id: r.id,
        playerName: r.playerName,
        position: r.position,
        overall: r.overall,
        potential: r.potential,
        nationality: r.nationality,
        age: r.age,
        askingPrice: r.askingPrice,
        scoutRating: r.scoutRating,
        createdAt: r.createdAt,
        expiresAt: r.expiresAt,
      })),
    });
  } catch (error) {
    console.error('Scout GET error:', error);
    return NextResponse.json({ error: 'Failed to get scout reports' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const manager = await db.manager.findFirst();
    if (!manager) {
      return NextResponse.json({ error: 'no_manager' }, { status: 404 });
    }

    // Scouting costs gems
    const cost = 15;
    if (manager.gems < cost) {
      return NextResponse.json({ error: 'not_enough_gems' }, { status: 400 });
    }

    // Deduct gems
    await db.manager.update({
      where: { id: manager.id },
      data: { gems: manager.gems - cost },
    });

    // Delete old reports
    await db.scoutReport.deleteMany({});

    // Generate new reports
    const reports = await generateScoutReports();

    // Update discoverer achievement progress
    const discovererAchievement = await db.achievement.findFirst({
      where: { key: 'discoverer' },
    });
    if (discovererAchievement) {
      const existing = await db.managerAchievement.findFirst({
        where: { managerId: manager.id, achievementId: discovererAchievement.id },
      });
      if (existing) {
        await db.managerAchievement.update({
          where: { id: existing.id },
          data: { progress: existing.progress + 1 },
        });
      } else {
        await db.managerAchievement.create({
          data: {
            managerId: manager.id,
            achievementId: discovererAchievement.id,
            progress: 1,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      reports: reports.map(r => ({
        id: r.id,
        playerName: r.playerName,
        position: r.position,
        overall: r.overall,
        potential: r.potential,
        nationality: r.nationality,
        age: r.age,
        askingPrice: r.askingPrice,
        scoutRating: r.scoutRating,
        createdAt: r.createdAt,
        expiresAt: r.expiresAt,
      })),
    });
  } catch (error) {
    console.error('Scout POST error:', error);
    return NextResponse.json({ error: 'Failed to refresh scout reports' }, { status: 500 });
  }
}

async function generateScoutReports() {
  const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
  const count = 3 + Math.floor(Math.random() * 3); // 3-5 reports
  const reports: Awaited<ReturnType<typeof db.scoutReport.create>>[] = [];

  for (let i = 0; i < count; i++) {
    const position = positions[Math.floor(Math.random() * positions.length)];
    const overall = 55 + Math.floor(Math.random() * 30);
    const potential = Math.min(99, overall + Math.floor(Math.random() * 15) + 3);
    const age = 17 + Math.floor(Math.random() * 15);
    const stats = generatePlayerStats(position, overall);
    const value = generatePlayerValue(overall, age);

    const report = await db.scoutReport.create({
      data: {
        playerName: generatePlayerName(),
        position,
        overall,
        potential,
        nationality: generateNationality(),
        age,
        askingPrice: Math.round(value * (1.1 + Math.random() * 0.3)),
        scoutRating: Math.min(5, Math.max(1, Math.floor(Math.random() * 3) + 3)),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    reports.push(report);
  }

  return reports;
}
