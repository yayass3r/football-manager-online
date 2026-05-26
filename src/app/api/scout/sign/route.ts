import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generatePlayerStats, generatePlayerValue, generateSalary } from '@/lib/game-data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scoutReportId } = body;

    if (!scoutReportId) {
      return NextResponse.json({ error: 'missing_scout_report_id' }, { status: 400 });
    }

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

    // Get scout report
    const report = await db.scoutReport.findUnique({
      where: { id: scoutReportId },
    });

    if (!report) {
      return NextResponse.json({ error: 'report_not_found' }, { status: 404 });
    }

    if (new Date(report.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'report_expired' }, { status: 400 });
    }

    // Check if player can afford
    if (manager.coins < report.askingPrice) {
      return NextResponse.json({ error: 'not_enough_coins' }, { status: 400 });
    }

    // Deduct coins
    await db.manager.update({
      where: { id: manager.id },
      data: { coins: manager.coins - report.askingPrice },
    });

    // Use potential as a chance for higher overall
    const actualOverall = Math.random() < 0.6 ? report.overall : Math.min(report.potential, report.overall + Math.floor(Math.random() * 5));
    const stats = generatePlayerStats(report.position, actualOverall);

    // Create player on team
    const player = await db.player.create({
      data: {
        name: report.playerName,
        position: report.position,
        nationality: report.nationality,
        age: report.age,
        overall: actualOverall,
        pace: stats.pace,
        shooting: stats.shooting,
        passing: stats.passing,
        dribbling: stats.dribbling,
        defending: stats.defending,
        physical: stats.physical,
        stamina: stats.stamina,
        morale: 70,
        form: 70,
        value: generatePlayerValue(actualOverall, report.age),
        salary: generateSalary(actualOverall),
        teamId: team.id,
      },
    });

    // Delete the scout report
    await db.scoutReport.delete({
      where: { id: scoutReportId },
    });

    // Update smart investor achievement
    const investorAchievement = await db.achievement.findFirst({
      where: { key: 'smart_investor' },
    });
    if (investorAchievement) {
      const existing = await db.managerAchievement.findFirst({
        where: { managerId: manager.id, achievementId: investorAchievement.id },
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
            achievementId: investorAchievement.id,
            progress: 1,
          },
        });
      }
    }

    // Create notification
    await db.notification.create({
      data: {
        title: '📝 توقيع لاعب جديد!',
        message: `تم توقيع ${report.playerName} (${report.position}) بتقييم ${actualOverall} مقابل ${(report.askingPrice / 1000000).toFixed(1)}M`,
        type: 'success',
      },
    });

    // Generate news
    await db.newsArticle.create({
      data: {
        title: `${team.name} يتعاقد مع ${report.playerName}`,
        content: `أعلن نادي ${team.name} عن توقيعه مع اللاعب ${report.playerName} قادماً من الكشافة. يبلغ اللاعب من العمر ${report.age} عاماً ويلعب في مركز ${report.position} بتقييم ${actualOverall}.`,
        category: 'transfer',
        imageEmoji: '📝',
      },
    });

    return NextResponse.json({
      success: true,
      player: {
        id: player.id,
        name: player.name,
        position: player.position,
        overall: player.overall,
      },
    });
  } catch (error) {
    console.error('Scout sign error:', error);
    return NextResponse.json({ error: 'Failed to sign player' }, { status: 500 });
  }
}
