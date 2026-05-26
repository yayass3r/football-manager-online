import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { simulateMatch, type MatchTeam, type MatchPlayer } from '@/lib/game-engine';

export async function POST() {
  try {
    const manager = await db.manager.findFirst();
    if (!manager) {
      return NextResponse.json({ error: 'no_manager' }, { status: 404 });
    }

    const team = await db.team.findUnique({
      where: { managerId: manager.id },
      include: { players: true },
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
    });

    if (!league) {
      return NextResponse.json({ error: 'league_not_found' }, { status: 404 });
    }

    // Find current match day
    const lastPlayed = await db.match.findFirst({
      where: { leagueId: league.id, isPlayed: true },
      orderBy: { matchDay: 'desc' },
    });
    const currentMatchDay = lastPlayed ? lastPlayed.matchDay + 1 : 1;

    if (currentMatchDay > 38) {
      return NextResponse.json({ error: 'season_over' }, { status: 400 });
    }

    // Get all matches for this match day
    const matchDayMatches = await db.match.findMany({
      where: { leagueId: league.id, matchDay: currentMatchDay, isPlayed: false },
    });

    if (matchDayMatches.length === 0) {
      return NextResponse.json({ error: 'no_matches' }, { status: 400 });
    }

    const results = [];

    for (const match of matchDayMatches) {
      // Find teams for this match
      const homeStanding = await db.leagueStanding.findFirst({
        where: { leagueId: league.id, teamName: match.homeTeam },
      });
      const awayStanding = await db.leagueStanding.findFirst({
        where: { leagueId: league.id, teamName: match.awayTeam },
      });

      // Get players for both teams
      const homeTeamData = await db.team.findFirst({
        where: { id: homeStanding?.teamId },
        include: { players: true },
      });
      const awayTeamData = await db.team.findFirst({
        where: { id: awayStanding?.teamId },
        include: { players: true },
      });

      if (!homeTeamData || !awayTeamData) continue;

      const homeMatchTeam: MatchTeam = {
        name: match.homeTeam,
        logo: match.homeTeamLogo,
        formation: homeTeamData.formation,
        morale: homeTeamData.morale,
        fanSupport: homeTeamData.fanSupport,
        players: homeTeamData.players.map((p): MatchPlayer => ({
          name: p.name,
          position: p.position,
          overall: p.overall,
          pace: p.pace,
          shooting: p.shooting,
          passing: p.passing,
          dribbling: p.dribbling,
          defending: p.defending,
          physical: p.physical,
          stamina: p.stamina,
          form: p.form,
          morale: p.morale,
          isInjured: p.isInjured,
        })),
      };

      const awayMatchTeam: MatchTeam = {
        name: match.awayTeam,
        logo: match.awayTeamLogo,
        formation: awayTeamData.formation,
        morale: awayTeamData.morale,
        fanSupport: awayTeamData.fanSupport,
        players: awayTeamData.players.map((p): MatchPlayer => ({
          name: p.name,
          position: p.position,
          overall: p.overall,
          pace: p.pace,
          shooting: p.shooting,
          passing: p.passing,
          dribbling: p.dribbling,
          defending: p.defending,
          physical: p.physical,
          stamina: p.stamina,
          form: p.form,
          morale: p.morale,
          isInjured: p.isInjured,
        })),
      };

      const matchResult = simulateMatch(homeMatchTeam, awayMatchTeam);

      // Update match record
      await db.match.update({
        where: { id: match.id },
        data: {
          homeGoals: matchResult.homeGoals,
          awayGoals: matchResult.awayGoals,
          isPlayed: true,
          events: JSON.stringify(matchResult.events),
        },
      });

      // Update standings for home team
      if (homeStanding) {
        const isWin = matchResult.homeGoals > matchResult.awayGoals;
        const isDraw = matchResult.homeGoals === matchResult.awayGoals;
        await db.leagueStanding.update({
          where: { id: homeStanding.id },
          data: {
            played: homeStanding.played + 1,
            won: homeStanding.won + (isWin ? 1 : 0),
            drawn: homeStanding.drawn + (isDraw ? 1 : 0),
            lost: homeStanding.lost + (!isWin && !isDraw ? 1 : 0),
            goalsFor: homeStanding.goalsFor + matchResult.homeGoals,
            goalsAgainst: homeStanding.goalsAgainst + matchResult.awayGoals,
            points: homeStanding.points + (isWin ? 3 : isDraw ? 1 : 0),
          },
        });
      }

      // Update standings for away team
      if (awayStanding) {
        const isWin = matchResult.awayGoals > matchResult.homeGoals;
        const isDraw = matchResult.homeGoals === matchResult.awayGoals;
        await db.leagueStanding.update({
          where: { id: awayStanding.id },
          data: {
            played: awayStanding.played + 1,
            won: awayStanding.won + (isWin ? 1 : 0),
            drawn: awayStanding.drawn + (isDraw ? 1 : 0),
            lost: awayStanding.lost + (!isWin && !isDraw ? 1 : 0),
            goalsFor: awayStanding.goalsFor + matchResult.awayGoals,
            goalsAgainst: awayStanding.goalsAgainst + matchResult.homeGoals,
            points: awayStanding.points + (isWin ? 3 : isDraw ? 1 : 0),
          },
        });
      }

      // Update team morale based on result
      if (homeStanding && homeTeamData) {
        const isWin = matchResult.homeGoals > matchResult.awayGoals;
        await db.team.update({
          where: { id: homeTeamData.id },
          data: { morale: Math.max(20, Math.min(99, homeTeamData.morale + (isWin ? 3 : matchResult.homeGoals === matchResult.awayGoals ? 0 : -3))) },
        });
      }

      if (awayStanding && awayTeamData) {
        const isWin = matchResult.awayGoals > matchResult.homeGoals;
        await db.team.update({
          where: { id: awayTeamData.id },
          data: { morale: Math.max(20, Math.min(99, awayTeamData.morale + (isWin ? 3 : matchResult.homeGoals === matchResult.awayGoals ? 0 : -3))) },
        });
      }

      // Process injuries from match events
      const injuryEvents = matchResult.events.filter(e => e.type === 'injury');
      for (const injury of injuryEvents) {
        const injuredTeam = injury.team === 'home' ? homeTeamData : awayTeamData;
        const injuredPlayer = injuredTeam.players.find(p => p.name === injury.playerName);
        if (injuredPlayer) {
          await db.player.update({
            where: { id: injuredPlayer.id },
            data: { isInjured: true, injuryWeeks: Math.floor(Math.random() * 3) + 1 },
          });
        }
      }

      results.push({
        matchId: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeGoals: matchResult.homeGoals,
        awayGoals: matchResult.awayGoals,
        events: matchResult.events,
      });
    }

    // Give manager match rewards
    const ourMatch = results.find(r => r.homeTeam === team.name || r.awayTeam === team.name);
    if (ourMatch && manager) {
      const isWin = (ourMatch.homeTeam === team.name && ourMatch.homeGoals > ourMatch.awayGoals) ||
                    (ourMatch.awayTeam === team.name && ourMatch.awayGoals > ourMatch.homeGoals);
      const isDraw = ourMatch.homeGoals === ourMatch.awayGoals;

      const reward = isWin ? 200000 : isDraw ? 80000 : 30000;
      await db.manager.update({
        where: { id: manager.id },
        data: {
          coins: manager.coins + reward,
          xp: manager.xp + (isWin ? 50 : isDraw ? 25 : 10),
        },
      });

      // Ticket revenue
      const stadium = await db.stadium.findUnique({ where: { teamId: team.id } });
      if (stadium) {
        const ticketRevenue = Math.round(stadium.capacity * stadium.ticketPrice * 0.6 * (isWin ? 1 : 0.7));
        const updatedManager = await db.manager.findUnique({ where: { id: manager.id } });
        if (updatedManager) {
          await db.manager.update({
            where: { id: manager.id },
            data: { coins: updatedManager.coins + ticketRevenue },
          });
        }
      }

      // Create notification
      await db.notification.create({
        data: {
          title: isWin ? 'فوز! 🎉' : isDraw ? 'تعادل 🤝' : 'خسارة 😞',
          message: `${team.name} ${ourMatch.homeTeam === team.name ? ourMatch.homeGoals : ourMatch.awayGoals} - ${ourMatch.homeTeam === team.name ? ourMatch.awayGoals : ourMatch.homeGoals} ${ourMatch.homeTeam === team.name ? ourMatch.awayTeam : ourMatch.homeTeam}`,
          type: isWin ? 'success' : isDraw ? 'info' : 'warning',
        },
      });
    }

    // Heal injured players (reduce injury weeks)
    const injuredPlayers = await db.player.findMany({
      where: { isInjured: true, injuryWeeks: { gt: 0 }, teamId: team.id },
    });
    for (const ip of injuredPlayers) {
      if (ip.injuryWeeks <= 1) {
        await db.player.update({
          where: { id: ip.id },
          data: { isInjured: false, injuryWeeks: 0 },
        });
      } else {
        await db.player.update({
          where: { id: ip.id },
          data: { injuryWeeks: ip.injuryWeeks - 1 },
        });
      }
    }

    return NextResponse.json({
      matchDay: currentMatchDay,
      results,
    });
  } catch (error) {
    console.error('Match simulation error:', error);
    return NextResponse.json({ error: 'Failed to simulate' }, { status: 500 });
  }
}
