import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateTeamPlayers, leagueTeams, leagueNames, generatePlayerName, generatePlayerStats, generatePlayerValue, generateNationality } from '@/lib/game-data';

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

export async function POST() {
  try {
    const existingLeagues = await db.league.count();
    if (existingLeagues > 0) {
      return NextResponse.json({ message: 'already_initialized' });
    }

    for (let level = 1; level <= 4; level++) {
      const league = await db.league.create({
        data: {
          name: leagueNames[level],
          level,
          season: 1,
          maxTeams: 20,
        },
      });

      const teams = leagueTeams[level] || [];
      for (const teamData of teams) {
        const team = await db.team.create({
          data: {
            name: teamData.name,
            shortName: teamData.shortName,
            logo: teamData.logo,
            primaryColor: teamData.primaryColor,
            secondaryColor: '#ffffff',
            formation: '4-4-2',
            morale: 70 + Math.floor(Math.random() * 20),
            fanSupport: 40 + Math.floor(Math.random() * 40),
            managerId: `ai_${league.id}_${teamData.shortName}`,
          },
        });

        const playersData = generateTeamPlayers(level);
        for (const pd of playersData) {
          await db.player.create({
            data: {
              name: pd.name,
              position: pd.position,
              nationality: pd.nationality,
              age: pd.age,
              overall: pd.overall,
              pace: pd.pace,
              shooting: pd.shooting,
              passing: pd.passing,
              dribbling: pd.dribbling,
              defending: pd.defending,
              physical: pd.physical,
              stamina: pd.stamina,
              value: pd.value,
              salary: pd.salary,
              morale: 70 + Math.floor(Math.random() * 20),
              form: 65 + Math.floor(Math.random() * 25),
              teamId: team.id,
            },
          });
        }

        await db.stadium.create({
          data: {
            name: `ملعب ${teamData.name}`,
            capacity: 5000 + level * 5000,
            level: level,
            ticketPrice: 30 + level * 20,
            facilities: level,
            youthAcademy: level,
            trainingGround: level,
            medicalCenter: level,
            teamId: team.id,
          },
        });

        await db.leagueStanding.create({
          data: {
            leagueId: league.id,
            teamName: teamData.name,
            teamLogo: teamData.logo,
            teamId: team.id,
          },
        });
      }

      // Generate simplified fixtures
      const standings = await db.leagueStanding.findMany({
        where: { leagueId: league.id },
      });

      const teamList = standings.map(s => ({ name: s.teamName, logo: s.teamLogo, teamId: s.teamId }));
      let matchDay = 1;
      
      for (let i = 0; i < teamList.length; i++) {
        for (let j = i + 1; j < teamList.length; j++) {
          await db.match.create({
            data: {
              leagueId: league.id,
              homeTeam: teamList[i].name,
              homeTeamLogo: teamList[i].logo,
              awayTeam: teamList[j].name,
              awayTeamLogo: teamList[j].logo,
              matchDay,
              isPlayed: false,
            },
          });
          await db.match.create({
            data: {
              leagueId: league.id,
              homeTeam: teamList[j].name,
              homeTeamLogo: teamList[j].logo,
              awayTeam: teamList[i].name,
              awayTeamLogo: teamList[i].logo,
              matchDay: matchDay + 19,
              isPlayed: false,
            },
          });
          if ((j - i) % 2 === 0 && matchDay < 38) matchDay++;
        }
      }
    }

    // Generate transfer market
    for (let i = 0; i < 30; i++) {
      const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
      const position = positions[Math.floor(Math.random() * positions.length)];
      const overall = 55 + Math.floor(Math.random() * 30);
      const name = generatePlayerName();
      const stats = generatePlayerStats(position, overall);
      const value = generatePlayerValue(overall, 20 + Math.floor(Math.random() * 10));

      await db.transferListing.create({
        data: {
          playerId: `transfer_${i}_${Date.now()}`,
          playerName: name,
          position,
          overall,
          askingPrice: Math.round(value * (1 + Math.random() * 0.5)),
          sellerTeam: 'السوق الحر',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Seed achievements
    const existingAchievements = await db.achievement.count();
    if (existingAchievements === 0) {
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

    // Generate initial scout reports
    const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
    for (let i = 0; i < 4; i++) {
      const position = positions[Math.floor(Math.random() * positions.length)];
      const overall = 55 + Math.floor(Math.random() * 25);
      const potential = Math.min(99, overall + Math.floor(Math.random() * 12) + 3);
      const age = 18 + Math.floor(Math.random() * 14);

      await db.scoutReport.create({
        data: {
          playerName: generatePlayerName(),
          position,
          overall,
          potential,
          nationality: generateNationality(),
          age,
          askingPrice: Math.round(generatePlayerValue(overall, age) * (1.1 + Math.random() * 0.3)),
          scoutRating: Math.min(5, Math.max(1, Math.floor(Math.random() * 3) + 3)),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    }

    // Generate welcome news articles
    await db.newsArticle.createMany({
      data: [
        {
          title: 'مرحباً بك في مدير كرة القدم! 🎉',
          content: 'أنشئ فريقك وابدأ رحلتك نحو المجد! درّب لاعبيك، خطط لاستراتيجيتك، وقود فريقك نحو البطولات.',
          category: 'general',
          imageEmoji: '🎉',
          isRead: false,
        },
        {
          title: 'سوق الانتقالات مفتوح! 📝',
          content: 'تم فتح سوق الانتقالات! اكتشف لاعبين جدد وعزّز فريقك بالنجوم. استخدم الكشافة للعثور على المواهب المخفية.',
          category: 'transfer',
          imageEmoji: '📝',
          isRead: false,
        },
        {
          title: 'الموسم الجديد يبدأ! ⚽',
          content: 'انطلق الموسم الجديد من الدوري! استعد جيداً واختار التشكيلة المثالية لمواجهة الخصوم.',
          category: 'league',
          imageEmoji: '⚽',
          isRead: false,
        },
        {
          title: 'نصائح للمدربين الجدد 💡',
          content: 'ركز على تطوير الشباب، حافظ على توازن الرواتب، واستخدم الكشافة بذكاء. الفرق العظيمة تُبنى خطوة بخطوة!',
          category: 'general',
          imageEmoji: '💡',
          isRead: false,
        },
      ],
    });

    return NextResponse.json({ message: 'initialized' });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({ error: 'Failed to initialize' }, { status: 500 });
  }
}
