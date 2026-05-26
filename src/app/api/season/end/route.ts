import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateTeamPlayers, leagueTeams, leagueNames, generatePlayerName, generateNationality, generatePlayerStats, generatePlayerValue, generateSalary } from '@/lib/game-data';

export async function POST() {
  try {
    const manager = await db.manager.findFirst();
    if (!manager) {
      return NextResponse.json({ error: 'no_manager' }, { status: 404 });
    }

    const team = await db.team.findUnique({
      where: { managerId: manager.id },
      include: { players: true, stadium: true },
    });

    if (!team) {
      return NextResponse.json({ error: 'no_team' }, { status: 404 });
    }

    // Find our league
    const standing = await db.leagueStanding.findFirst({
      where: { teamId: team.id },
    });

    if (!standing) {
      return NextResponse.json({ error: 'not_in_league' }, { status: 404 });
    }

    const league = await db.league.findUnique({
      where: { id: standing.leagueId },
      include: { standings: { orderBy: [{ points: 'desc' }, { goalsFor: 'desc' }] } },
    });

    if (!league) {
      return NextResponse.json({ error: 'league_not_found' }, { status: 404 });
    }

    // Find our position
    const sortedStandings = league.standings.sort((a, b) => b.points - a.points || b.goalsFor - a.goalsFor);
    const ourPosition = sortedStandings.findIndex(s => s.teamId === team.id) + 1;
    const ourStanding = sortedStandings.find(s => s.teamId === team.id);

    if (!ourStanding) {
      return NextResponse.json({ error: 'standing_not_found' }, { status: 404 });
    }

    const isPromoted = ourPosition <= 3;
    const isRelegated = ourPosition >= 18;
    const currentLevel = league.level;
    const newLevel = isPromoted ? Math.max(1, currentLevel - 1) : isRelegated ? Math.min(4, currentLevel + 1) : currentLevel;

    // Create season history
    await db.seasonHistory.create({
      data: {
        managerId: manager.id,
        season: league.season,
        leagueLevel: currentLevel,
        leagueName: league.name,
        finalPosition: ourPosition,
        played: ourStanding.played,
        won: ourStanding.won,
        drawn: ourStanding.drawn,
        lost: ourStanding.lost,
        points: ourStanding.points,
        promoted: isPromoted,
        relegated: isRelegated,
      },
    });

    // Update riser achievement if promoted
    if (isPromoted) {
      const riserAchievement = await db.achievement.findFirst({ where: { key: 'riser' } });
      if (riserAchievement) {
        const existing = await db.managerAchievement.findFirst({
          where: { managerId: manager.id, achievementId: riserAchievement.id },
        });
        if (existing) {
          await db.managerAchievement.update({
            where: { id: existing.id },
            data: { progress: 1, isCompleted: true, completedAt: new Date() },
          });
        } else {
          await db.managerAchievement.create({
            data: {
              managerId: manager.id,
              achievementId: riserAchievement.id,
              progress: 1,
              isCompleted: true,
              completedAt: new Date(),
            },
          });
        }
      }
    }

    // Age all players by 1 year
    for (const player of team.players) {
      const newAge = player.age + 1;
      const isRetiring = newAge > 38;

      if (isRetiring) {
        // Delete retiring player
        await db.player.delete({ where: { id: player.id } });
      } else {
        // Slight decline for older players
        let overallChange = 0;
        if (newAge > 30) {
          overallChange = -Math.floor(Math.random() * 3) - 1;
        } else if (newAge < 24) {
          overallChange = Math.floor(Math.random() * 3) + 1;
        } else {
          overallChange = Math.random() < 0.3 ? 1 : 0;
        }

        const newOverall = Math.max(30, Math.min(99, player.overall + overallChange));
        await db.player.update({
          where: { id: player.id },
          data: {
            age: newAge,
            overall: newOverall,
            value: generatePlayerValue(newOverall, newAge),
            isInjured: false,
            injuryWeeks: 0,
            morale: 75,
            form: 75,
          },
        });
      }
    }

    // Generate youth academy players based on academy level
    const academyLevel = team.stadium?.youthAcademy || 1;
    const youthCount = academyLevel;
    const retiredCount = team.players.filter(p => p.age + 1 > 38).length;
    const youthPositions = ['ST', 'CM', 'CB', 'GK', 'LW', 'CDM', 'RB', 'CAM'];

    for (let i = 0; i < youthCount; i++) {
      const pos = youthPositions[i % youthPositions.length];
      const overall = 40 + Math.floor(Math.random() * 15) + academyLevel * 3;
      const age = 16 + Math.floor(Math.random() * 3);
      const stats = generatePlayerStats(pos, overall);

      await db.player.create({
        data: {
          name: generatePlayerName(),
          position: pos,
          nationality: generateNationality(),
          age,
          overall,
          ...stats,
          morale: 80,
          form: 70,
          value: generatePlayerValue(overall, age),
          salary: generateSalary(overall),
          teamId: team.id,
        },
      });
    }

    // Clear old league data and create new season
    // Delete old matches and standings for the current league
    await db.match.deleteMany({ where: { leagueId: league.id } });
    await db.leagueStanding.deleteMany({ where: { leagueId: league.id } });

    // Delete old daily rewards
    await db.dailyReward.deleteMany({ where: { managerId: manager.id } });

    // Update league season
    await db.league.update({
      where: { id: league.id },
      data: { season: league.season + 1 },
    });

    // Find or create the new league if promoted/relegated
    let targetLeagueId = league.id;
    if (isPromoted || isRelegated) {
      const targetLeague = await db.league.findFirst({
        where: { level: newLevel },
      });
      if (targetLeague) {
        targetLeagueId = targetLeague.id;
        // Also clear that league for new season
        await db.match.deleteMany({ where: { leagueId: targetLeague.id } });
        await db.leagueStanding.deleteMany({ where: { leagueId: targetLeague.id } });
        await db.league.update({
          where: { id: targetLeague.id },
          data: { season: { increment: 1 } },
        });
      }
    }

    // Re-populate standings and fixtures for the target league
    const targetLeague = await db.league.findUnique({ where: { id: targetLeagueId } });
    if (targetLeague) {
      const teamsData = leagueTeams[targetLeague.level] || [];
      for (const td of teamsData) {
        await db.leagueStanding.create({
          data: {
            leagueId: targetLeague.id,
            teamName: td.name,
            teamLogo: td.logo,
            teamId: `ai_${targetLeague.id}_${td.shortName}`,
          },
        });
      }

      // Add our team
      await db.leagueStanding.create({
        data: {
          leagueId: targetLeague.id,
          teamName: team.name,
          teamLogo: team.logo,
          teamId: team.id,
        },
      });

      // Generate fixtures
      const allStandings = await db.leagueStanding.findMany({
        where: { leagueId: targetLeague.id },
      });

      const teamList = allStandings.map(s => ({ name: s.teamName, logo: s.teamLogo }));
      let matchDay = 1;

      for (let i = 0; i < teamList.length; i++) {
        for (let j = i + 1; j < teamList.length; j++) {
          await db.match.create({
            data: {
              leagueId: targetLeague.id,
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
              leagueId: targetLeague.id,
              homeTeam: teamList[j].name,
              homeTeamLogo: teamList[j].logo,
              awayTeam: teamList[i].name,
              awayTeamLogo: teamList[i].logo,
              matchDay: matchDay + 19 > 38 ? matchDay + 19 - 38 + 1 : matchDay + 19,
              isPlayed: false,
            },
          });
          if ((j - i) % 2 === 0 && matchDay < 38) matchDay++;
        }
      }
    }

    // Generate news about season end
    const seasonEndMessages = [
      isPromoted ? `🎉 صعود! ${team.name} يصعد إلى ${leagueNames[newLevel]}` :
      isRelegated ? `📉 هبوط! ${team.name} يهبط إلى ${leagueNames[newLevel]}` :
      `${team.name} ينهي الموسم في المركز ${ourPosition}`,
    ];

    await db.newsArticle.create({
      data: {
        title: isPromoted ? 'صعود رائع! 🎉' : isRelegated ? 'هبوط مؤسف 😞' : 'نهاية الموسم',
        content: `${seasonEndMessages[0]}. أنهى الفريق الموسم بـ ${ourStanding.won} فوز و ${ourStanding.drawn} تعادل و ${ourStanding.lost} خسارة بمجموع ${ourStanding.points} نقطة. ${retiredCount > 0 ? `اعتزل ${retiredCount} لاعب.` : ''} ${youthCount > 0 ? `تم تصعيد ${youthCount} لاعب من الأكاديمية.` : ''}`,
        category: 'league',
        imageEmoji: isPromoted ? '🎉' : isRelegated ? '📉' : '📊',
      },
    });

    // Season end rewards
    const seasonReward = isPromoted ? 2000000 : isRelegated ? 200000 : 500000;
    await db.manager.update({
      where: { id: manager.id },
      data: {
        coins: manager.coins + seasonReward,
        xp: manager.xp + (isPromoted ? 200 : 50),
      },
    });

    return NextResponse.json({
      success: true,
      seasonSummary: {
        season: league.season,
        leagueLevel: currentLevel,
        leagueName: league.name,
        finalPosition: ourPosition,
        played: ourStanding.played,
        won: ourStanding.won,
        drawn: ourStanding.drawn,
        lost: ourStanding.lost,
        points: ourStanding.points,
        goalsFor: ourStanding.goalsFor,
        goalsAgainst: ourStanding.goalsAgainst,
        promoted: isPromoted,
        relegated: isRelegated,
        newLevel,
        retiredCount,
        youthCount,
        seasonReward,
      },
    });
  } catch (error) {
    console.error('Season end error:', error);
    return NextResponse.json({ error: 'Failed to end season' }, { status: 500 });
  }
}
