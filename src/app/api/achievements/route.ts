import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const achievementSeeds = [
  { key: 'first_win', title: 'أول فوز', description: 'افز مباراة واحدة', icon: '🏆', category: 'match', target: 1, reward: 50000 },
  { key: 'title_maker', title: 'صانع الألقاب', description: 'افز 10 مباريات', icon: '🥇', category: 'match', target: 10, reward: 200000 },
  { key: 'smart_investor', title: 'المستثمر الذكي', description: 'اشترِ 5 لاعبين من السوق', icon: '💰', category: 'transfer', target: 5, reward: 100000 },
  { key: 'discoverer', title: 'المكتشف', description: 'اكتشف 3 لاعبين عبر الكشافة', icon: '🔍', category: 'transfer', target: 3, reward: 75000 },
  { key: 'expert_trainer', title: 'المدرب الخبير', description: 'درّب اللاعبين 20 مرة', icon: '🏋️', category: 'training', target: 20, reward: 150000 },
  { key: 'empire_builder', title: 'باني الإمبراطورية', description: 'طوّر الملعب إلى المستوى 5', icon: '🏟️', category: 'career', target: 5, reward: 200000 },
  { key: 'league_top_scorer', title: 'هداف الدوري', description: 'سجّل 50 هدفاً في الدوري', icon: '⚽', category: 'league', target: 50, reward: 300000 },
  { key: 'riser', title: 'الصاعد', description: 'تأهل إلى دوري أعلى', icon: '📈', category: 'league', target: 1, reward: 500000 },
  { key: 'football_legend', title: 'أسطورة كرة القدم', description: 'صل إلى المستوى 10', icon: '👑', category: 'career', target: 10, reward: 1000000 },
  { key: 'financial_manager', title: 'المدير المالي', description: 'اكسب 10 ملايين عملة', icon: '💼', category: 'career', target: 10000000, reward: 250000 },
];

export async function GET() {
  try {
    const manager = await db.manager.findFirst();
    if (!manager) {
      return NextResponse.json({ error: 'no_manager' }, { status: 404 });
    }

    // Ensure achievements exist
    const existingCount = await db.achievement.count();
    if (existingCount === 0) {
      await db.achievement.createMany({
        data: achievementSeeds.map(a => ({
          key: a.key,
          title: a.title,
          description: a.description,
          icon: a.icon,
          category: a.category,
          target: a.target,
          reward: a.reward,
        })),
      });
    }

    // Get all achievements with user progress
    const achievements = await db.achievement.findMany({
      include: {
        managerAchievements: {
          where: { managerId: manager.id },
        },
      },
      orderBy: { category: 'asc' },
    });

    const result = achievements.map(a => {
      const ma = a.managerAchievements[0];
      return {
        id: a.id,
        key: a.key,
        title: a.title,
        description: a.description,
        icon: a.icon,
        category: a.category,
        target: a.target,
        reward: a.reward,
        progress: ma?.progress || 0,
        isCompleted: ma?.isCompleted || false,
        completedAt: ma?.completedAt || null,
        managerAchievementId: ma?.id || null,
        isClaimed: ma?.isCompleted && ma?.completedAt !== null,
      };
    });

    return NextResponse.json({ achievements: result });
  } catch (error) {
    console.error('Achievements GET error:', error);
    return NextResponse.json({ error: 'Failed to get achievements' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const manager = await db.manager.findFirst();
    if (!manager) {
      return NextResponse.json({ error: 'no_manager' }, { status: 404 });
    }

    // Get team stats for progress calculation
    const team = await db.team.findUnique({
      where: { managerId: manager.id },
    });

    if (!team) {
      return NextResponse.json({ error: 'no_team' }, { status: 404 });
    }

    const standing = await db.leagueStanding.findFirst({
      where: { teamId: team.id },
    });

    const stadium = await db.stadium.findUnique({
      where: { teamId: team.id },
    });

    // Calculate progress for each achievement
    const progressMap: Record<string, number> = {
      first_win: standing?.won || 0,
      title_maker: standing?.won || 0,
      smart_investor: 0, // tracked separately
      discoverer: 0, // tracked separately
      expert_trainer: 0, // tracked separately
      empire_builder: stadium?.level || 1,
      league_top_scorer: standing?.goalsFor || 0,
      riser: 0, // tracked separately
      football_legend: manager.level,
      financial_manager: 5000000, // approximate - would need total tracking
    };

    const achievements = await db.achievement.findMany();

    let newCompletions = 0;

    for (const achievement of achievements) {
      const progress = progressMap[achievement.key] || 0;
      const isCompleted = progress >= achievement.target;

      const existing = await db.managerAchievement.findFirst({
        where: { managerId: manager.id, achievementId: achievement.id },
      });

      if (existing) {
        if (!existing.isCompleted && isCompleted) {
          await db.managerAchievement.update({
            where: { id: existing.id },
            data: { progress, isCompleted: true, completedAt: new Date() },
          });
          newCompletions++;
        } else if (existing.progress !== progress) {
          await db.managerAchievement.update({
            where: { id: existing.id },
            data: { progress },
          });
        }
      } else {
        await db.managerAchievement.create({
          data: {
            managerId: manager.id,
            achievementId: achievement.id,
            progress,
            isCompleted,
            completedAt: isCompleted ? new Date() : null,
          },
        });
        if (isCompleted) newCompletions++;
      }
    }

    return NextResponse.json({ success: true, newCompletions });
  } catch (error) {
    console.error('Achievements POST error:', error);
    return NextResponse.json({ error: 'Failed to update achievements' }, { status: 500 });
  }
}
