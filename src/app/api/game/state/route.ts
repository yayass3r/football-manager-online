import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get first manager (single player for now)
    const manager = await db.manager.findFirst();

    if (!manager) {
      return NextResponse.json({ manager: null });
    }

    const team = await db.team.findUnique({
      where: { managerId: manager.id },
    });

    let players: Awaited<ReturnType<typeof db.player.findMany>> = [];
    let stadium = null;

    if (team) {
      players = await db.player.findMany({
        where: { teamId: team.id },
        orderBy: [{ position: 'asc' }, { overall: 'desc' }],
      });

      stadium = await db.stadium.findUnique({
        where: { teamId: team.id },
      });
    }

    // Find the league the team belongs to
    let leagueStandings: Awaited<ReturnType<typeof db.leagueStanding.findMany>> = [];
    let matches: Awaited<ReturnType<typeof db.match.findMany>> = [];
    let leagueLevel = 4;
    let currentMatchDay = 1;

    if (team) {
      // Find league by checking standings
      const standing = await db.leagueStanding.findFirst({
        where: { teamId: team.id },
      });

      if (standing) {
        const league = await db.league.findUnique({
          where: { id: standing.leagueId },
        });

        if (league) {
          leagueLevel = league.level;
          leagueStandings = await db.leagueStanding.findMany({
            where: { leagueId: league.id },
            orderBy: [{ points: 'desc' }, { goalsFor: 'desc' }],
          });

          // Find current match day
          const lastPlayed = await db.match.findFirst({
            where: { leagueId: league.id, isPlayed: true },
            orderBy: { matchDay: 'desc' },
          });
          currentMatchDay = lastPlayed ? lastPlayed.matchDay + 1 : 1;

          // Get upcoming and recent matches
          matches = await db.match.findMany({
            where: { leagueId: league.id },
            orderBy: [{ matchDay: 'asc' }],
            take: 80,
          });
        }
      }
    }

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
      team: team ? {
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        logo: team.logo,
        primaryColor: team.primaryColor,
        secondaryColor: team.secondaryColor,
        formation: team.formation,
        morale: team.morale,
        fanSupport: team.fanSupport,
      } : null,
      players: players.map(p => ({
        id: p.id,
        name: p.name,
        position: p.position,
        nationality: p.nationality,
        age: p.age,
        overall: p.overall,
        pace: p.pace,
        shooting: p.shooting,
        passing: p.passing,
        dribbling: p.dribbling,
        defending: p.defending,
        physical: p.physical,
        stamina: p.stamina,
        morale: p.morale,
        form: p.form,
        value: p.value,
        salary: p.salary,
        isInjured: p.isInjured,
        injuryWeeks: p.injuryWeeks,
        isOnTransfer: p.isOnTransfer,
        transferPrice: p.transferPrice,
        teamId: p.teamId,
      })),
      stadium: stadium ? {
        id: stadium.id,
        name: stadium.name,
        capacity: stadium.capacity,
        level: stadium.level,
        ticketPrice: stadium.ticketPrice,
        facilities: stadium.facilities,
        youthAcademy: stadium.youthAcademy,
        trainingGround: stadium.trainingGround,
        medicalCenter: stadium.medicalCenter,
      } : null,
      leagueStandings: leagueStandings.map(s => ({
        id: s.id,
        teamName: s.teamName,
        teamLogo: s.teamLogo,
        teamId: s.teamId,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        points: s.points,
      })),
      matches: matches.map(m => ({
        id: m.id,
        homeTeam: m.homeTeam,
        homeTeamLogo: m.homeTeamLogo,
        awayTeam: m.awayTeam,
        awayTeamLogo: m.awayTeamLogo,
        homeGoals: m.homeGoals,
        awayGoals: m.awayGoals,
        matchDay: m.matchDay,
        isPlayed: m.isPlayed,
        events: m.events,
      })),
      leagueLevel,
      currentMatchDay,
    });
  } catch (error) {
    console.error('State error:', error);
    return NextResponse.json({ error: 'Failed to load state' }, { status: 500 });
  }
}
