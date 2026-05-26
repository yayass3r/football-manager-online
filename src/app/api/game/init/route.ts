import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateTeamPlayers, leagueTeams, leagueNames } from '@/lib/game-data';

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
      const { generatePlayerName: gpn, generatePlayerStats: gps, generatePlayerValue: gpv } = await import('@/lib/game-data');
      const name = gpn();
      const stats = gps(position, overall);
      const value = gpv(overall, 20 + Math.floor(Math.random() * 10));

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

    return NextResponse.json({ message: 'initialized' });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({ error: 'Failed to initialize' }, { status: 500 });
  }
}
