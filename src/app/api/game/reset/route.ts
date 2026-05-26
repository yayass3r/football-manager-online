import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Delete all data
    await db.notification.deleteMany();
    await db.transferListing.deleteMany();
    await db.match.deleteMany();
    await db.leagueStanding.deleteMany();
    await db.stadium.deleteMany();
    await db.player.deleteMany();
    await db.team.deleteMany();
    await db.manager.deleteMany();
    await db.league.deleteMany();
    await db.trainingSession.deleteMany();

    return NextResponse.json({ message: 'reset' });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ error: 'Failed to reset' }, { status: 500 });
  }
}
