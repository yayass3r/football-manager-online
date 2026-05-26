import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
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

    const standings = await db.leagueStanding.findMany({
      where: { leagueId: league.id },
      orderBy: [{ points: 'desc' }, { goalsFor: 'desc' }],
    });

    const matches = await db.match.findMany({
      where: { leagueId: league.id },
      orderBy: [{ matchDay: 'asc' }],
    });

    return NextResponse.json({
      league: {
        id: league.id,
        name: league.name,
        level: league.level,
        season: league.season,
      },
      standings,
      matches,
    });
  } catch (error) {
    console.error('League error:', error);
    return NextResponse.json({ error: 'Failed to get league' }, { status: 500 });
  }
}
