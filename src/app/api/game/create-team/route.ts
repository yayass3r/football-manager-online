import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateTeamPlayers, leagueTeams } from '@/lib/game-data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, teamName, shortName, logo, primaryColor, secondaryColor, formation } = body;

    if (!username || !teamName) {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }

    // Check if manager already exists
    const existing = await db.manager.findFirst();
    if (existing) {
      return NextResponse.json({ error: 'manager_exists' }, { status: 400 });
    }

    // Create manager
    const manager = await db.manager.create({
      data: {
        username,
        coins: 5000000,
        gems: 100,
        level: 1,
        xp: 0,
      },
    });

    // Create team
    const team = await db.team.create({
      data: {
        name: teamName,
        shortName: shortName || teamName.substring(0, 3),
        logo: logo || '⚽',
        primaryColor: primaryColor || '#1a7a2e',
        secondaryColor: secondaryColor || '#ffffff',
        formation: formation || '4-4-2',
        morale: 75,
        fanSupport: 50,
        managerId: manager.id,
      },
    });

    // Generate initial players (league level 4 - lowest)
    const playersData = generateTeamPlayers(4);
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
          morale: 75,
          form: 75,
          teamId: team.id,
        },
      });
    }

    // Create stadium
    await db.stadium.create({
      data: {
        name: `ملعب ${teamName}`,
        capacity: 10000,
        level: 1,
        ticketPrice: 50,
        facilities: 1,
        youthAcademy: 1,
        trainingGround: 1,
        medicalCenter: 1,
        teamId: team.id,
      },
    });

    // Add team to the lowest league (level 4)
    const league = await db.league.findFirst({
      where: { level: 4 },
    });

    if (league) {
      // Check if there's room
      const teamCount = await db.leagueStanding.count({
        where: { leagueId: league.id },
      });

      if (teamCount < 20) {
        await db.leagueStanding.create({
          data: {
            leagueId: league.id,
            teamName: teamName,
            teamLogo: logo || '⚽',
            teamId: team.id,
          },
        });

        // Generate fixtures for this team vs others in the league
        const otherStandings = await db.leagueStanding.findMany({
          where: { leagueId: league.id, teamId: { not: team.id } },
        });

        for (const other of otherStandings) {
          // Find a match day that's available
          const maxMatchDay = 38;
          for (let md = 1; md <= maxMatchDay; md++) {
            const existingMatches = await db.match.count({
              where: { leagueId: league.id, matchDay: md },
            });
            if (existingMatches < 10) {
              await db.match.create({
                data: {
                  leagueId: league.id,
                  homeTeam: teamName,
                  homeTeamLogo: logo || '⚽',
                  awayTeam: other.teamName,
                  awayTeamLogo: other.teamLogo,
                  matchDay: md,
                  isPlayed: false,
                },
              });
              await db.match.create({
                data: {
                  leagueId: league.id,
                  homeTeam: other.teamName,
                  homeTeamLogo: other.teamLogo,
                  awayTeam: teamName,
                  awayTeamLogo: logo || '⚽',
                  matchDay: md + 19 > 38 ? md + 19 - 38 + 1 : md + 19,
                  isPlayed: false,
                },
              });
              break;
            }
          }
        }
      }
    }

    // Create welcome notification
    await db.notification.create({
      data: {
        title: 'مرحباً بك!',
        message: `مرحباً بك يا ${username}! تم إنشاء فريق ${teamName} بنجاح. حظاً موفقاً في رحلتك كمدرب!`,
        type: 'success',
      },
    });

    return NextResponse.json({
      manager: {
        id: manager.id,
        username: manager.username,
        avatar: manager.avatar || '',
        coins: manager.coins,
        gems: manager.gems,
        level: manager.level,
        xp: manager.xp,
      },
      team: {
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        logo: team.logo,
        primaryColor: team.primaryColor,
        secondaryColor: team.secondaryColor,
        formation: team.formation,
        morale: team.morale,
        fanSupport: team.fanSupport,
      },
    });
  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}
