import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { formation } = await request.json();
    
    const formations = ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '4-5-1', '5-3-2'];
    if (!formations.includes(formation)) {
      return NextResponse.json({ error: 'invalid_formation' }, { status: 400 });
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

    await db.team.update({
      where: { id: team.id },
      data: { formation },
    });

    return NextResponse.json({ formation });
  } catch (error) {
    console.error('Formation error:', error);
    return NextResponse.json({ error: 'Failed to update formation' }, { status: 500 });
  }
}
