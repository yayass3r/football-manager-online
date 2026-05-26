// Match Simulation Engine for Football Manager Game

export interface MatchTeam {
  name: string;
  logo: string;
  formation: string;
  players: MatchPlayer[];
  morale: number;
  fanSupport: number;
}

export interface MatchPlayer {
  name: string;
  position: string;
  overall: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  stamina: number;
  form: number;
  morale: number;
  isInjured: boolean;
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'yellow_card' | 'red_card' | 'injury' | 'substitution' | 'half_time' | 'full_time' | 'shot_saved' | 'shot_missed' | 'corner' | 'free_kick';
  team: 'home' | 'away';
  playerName: string;
  description: string;
  assistBy?: string;
}

export interface MatchResult {
  homeGoals: number;
  awayGoals: number;
  events: MatchEvent[];
  homeStats: TeamMatchStats;
  awayStats: TeamMatchStats;
}

export interface TeamMatchStats {
  possession: number;
  shots: number;
  shotsOnTarget: number;
  corners: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  passes: number;
  passAccuracy: number;
}

function getTeamOverall(team: MatchTeam): number {
  const activePlayers = team.players.filter(p => !p.isInjured);
  if (activePlayers.length === 0) return 30;
  const totalOverall = activePlayers.reduce((sum, p) => sum + p.overall, 0);
  return Math.round(totalOverall / activePlayers.length);
}

function getAttackingStrength(team: MatchTeam): number {
  const attackers = team.players.filter(p => 
    ['ST', 'LW', 'RW', 'CAM', 'CF'].includes(p.position) && !p.isInjured
  );
  if (attackers.length === 0) return 40;
  const avg = attackers.reduce((sum, p) => {
    const weighted = (p.shooting * 0.35 + p.dribbling * 0.25 + p.pace * 0.2 + p.passing * 0.1 + (p.form / 100) * 10 + (p.morale / 100) * 10);
    return sum + weighted;
  }, 0) / attackers.length;
  return avg * (0.8 + (team.morale / 100) * 0.4);
}

function getDefensiveStrength(team: MatchTeam): number {
  const defenders = team.players.filter(p => 
    ['CB', 'LB', 'RB', 'CDM', 'GK'].includes(p.position) && !p.isInjured
  );
  if (defenders.length === 0) return 30;
  const avg = defenders.reduce((sum, p) => {
    const weighted = (p.defending * 0.35 + p.physical * 0.2 + p.pace * 0.15 + p.passing * 0.1 + (p.form / 100) * 10 + (p.morale / 100) * 10);
    return sum + weighted;
  }, 0) / defenders.length;
  return avg * (0.8 + (team.morale / 100) * 0.3);
}

function getMidfieldStrength(team: MatchTeam): number {
  const midfielders = team.players.filter(p => 
    ['CM', 'CDM', 'CAM', 'LM', 'RM'].includes(p.position) && !p.isInjured
  );
  if (midfielders.length === 0) return 40;
  const avg = midfielders.reduce((sum, p) => {
    const weighted = (p.passing * 0.3 + p.dribbling * 0.25 + p.physical * 0.15 + p.defending * 0.1 + (p.form / 100) * 10 + (p.morale / 100) * 10);
    return sum + weighted;
  }, 0) / midfielders.length;
  return avg * (0.85 + (team.morale / 100) * 0.3);
}

function getGKStrength(team: MatchTeam): number {
  const gk = team.players.find(p => p.position === 'GK' && !p.isInjured);
  if (!gk) return 30;
  return (gk.overall * 0.5 + gk.physical * 0.2 + gk.defending * 0.2 + (gk.form / 100) * 10) * (0.85 + (gk.morale / 100) * 0.3);
}

function getRandomPlayer(team: MatchTeam, positionFilter?: string[]): string {
  const eligible = team.players.filter(p => !p.isInjured && (!positionFilter || positionFilter.includes(p.position)));
  if (eligible.length === 0) {
    const available = team.players.filter(p => !p.isInjured);
    return available.length > 0 ? available[Math.floor(Math.random() * available.length)].name : 'لاعب';
  }
  return eligible[Math.floor(Math.random() * eligible.length)].name;
}

const goalCommentaries = [
  'هدف رائع! تسديدة قوية في الزاوية!',
  'هـــدف! ما أجمل هذا الهدف!',
  'هدف! تسديدة صاروخية لا يمكن صدها!',
  'هدف رائع! كرة رأسية قوية!',
  'هـــدف! تمريرة ذكية وتسديدة دقيقة!',
  'هدف! اللاعب يسجل ببراعة!',
  'هدف من ركلة حرة مباشرة! إبداع!',
  'هدف! تسديدة من خارج منطقة الجزاء!',
  'هـــدف! اللاعب يخترق الدفاع ويسجل!',
  'هدف! تمريرة عرضية وتسديدة أولى!',
];

const yellowCardCommentaries = [
  'بطاقة صفراء! تدخل قوي من اللاعب',
  'بطاقة صفراء للاعب بسبب عرقلة',
  'بطاقة صفراء! احتجاج على الحكم',
  'بطاقة صفراء! تدخل متأخر',
  'بطاقة صفراء لسلوك غير رياضي',
];

const injuryCommentaries = [
  'اللاعب يتعرض لإصابة! الفريق الطبي يتدخل',
  'إصابة! اللاعب يسقط على الأرض',
  'إصابة مؤسفة! سيتم التبديل',
];

const shotSavedCommentaries = [
  'تسديدة قوية لكن الحارس يتصدى لها!',
  'الحارس يصنع تدخلاً رائعاً!',
  'تسديدة خطيرة لكن الحارس كان بالمرصاد!',
  'إنقاذ رائع من الحارس!',
];

const shotMissedCommentaries = [
  'تسديدة تمر فوق العارضة!',
  'كرة تذهب بعيداً عن المرمى!',
  'تسديدة خارج المرمى!',
  'اللاعب يرسل الكرة خارج الملعب!',
];

const cornerCommentaries = [
  'ركنية للفريق!',
  'كرة ركنية! فرصة للتسجيل!',
];

const freeKickCommentaries = [
  'ركلة حرة! موقع خطير',
  'ركلة حرة من مسافة قريبة!',
];

function generateCommentary(type: string, commentaries: string[]): string {
  return commentaries[Math.floor(Math.random() * commentaries.length)];
}

export function simulateMatch(homeTeam: MatchTeam, awayTeam: MatchTeam): MatchResult {
  const events: MatchEvent[] = [];
  const homeStats: TeamMatchStats = {
    possession: 0, shots: 0, shotsOnTarget: 0, corners: 0,
    fouls: 0, yellowCards: 0, redCards: 0, passes: 0, passAccuracy: 0,
  };
  const awayStats: TeamMatchStats = {
    possession: 0, shots: 0, shotsOnTarget: 0, corners: 0,
    fouls: 0, yellowCards: 0, redCards: 0, passes: 0, passAccuracy: 0,
  };

  const homeAttack = getAttackingStrength(homeTeam);
  const homeDefense = getDefensiveStrength(homeTeam);
  const homeMidfield = getMidfieldStrength(homeTeam);
  const homeGK = getGKStrength(awayTeam);

  const awayAttack = getAttackingStrength(awayTeam);
  const awayDefense = getDefensiveStrength(awayTeam);
  const awayMidfield = getMidfieldStrength(awayTeam);
  const awayGK = getGKStrength(homeTeam);

  const homeAdvantage = 1.08;
  const homeGoalProb = Math.max(0.02, ((homeAttack * homeAdvantage - awayDefense * 0.7) / 100) * 0.045);
  const awayGoalProb = Math.max(0.02, ((awayAttack - homeDefense * 0.7 * homeAdvantage) / 100) * 0.045);

  const midfieldBalance = (homeMidfield * homeAdvantage) / (homeMidfield * homeAdvantage + awayMidfield + 0.01);
  homeStats.possession = Math.round(midfieldBalance * 100);
  awayStats.possession = 100 - homeStats.possession;

  let homeGoals = 0;
  let awayGoals = 0;

  for (let minute = 1; minute <= 90; minute++) {
    if (minute === 46) {
      events.push({
        minute: 45,
        type: 'half_time',
        team: 'home',
        playerName: '',
        description: "نهاية الشوط الأول | " + homeTeam.name + " " + homeGoals + " - " + awayGoals + " " + awayTeam.name,
      });
    }

    const rand = Math.random();

    // Goal chance
    const homeChance = homeGoalProb * (1 + (1 - (homeTeam.players[0]?.stamina ?? 80) / 200));
    const awayChance = awayGoalProb * (1 + (1 - (awayTeam.players[0]?.stamina ?? 80) / 200));

    if (rand < homeChance) {
      homeStats.shots++;
      const onTarget = Math.random() < (0.55 + homeAttack / 400);
      if (onTarget) {
        homeStats.shotsOnTarget++;
        const gkSave = Math.random() < (awayGK / 120);
        if (!gkSave) {
          homeGoals++;
          const scorer = getRandomPlayer(homeTeam, ['ST', 'LW', 'RW', 'CAM', 'CM', 'CF']);
          const assister = getRandomPlayer(homeTeam, ['CAM', 'CM', 'LW', 'RW', 'ST']);
          events.push({
            minute,
            type: 'goal',
            team: 'home',
            playerName: scorer,
            description: "⚽ " + minute + "m هدف! " + scorer + " يسجل ل" + homeTeam.name + "! " + generateCommentary('goal', goalCommentaries),
            assistBy: assister !== scorer ? assister : undefined,
          });
        } else {
          events.push({
            minute,
            type: 'shot_saved',
            team: 'home',
            playerName: getRandomPlayer(homeTeam, ['ST', 'LW', 'RW', 'CAM']),
            description: `${minute}m ${generateCommentary('save', shotSavedCommentaries)}`,
          });
        }
      } else {
        homeStats.shots++;
        events.push({
          minute,
          type: 'shot_missed',
          team: 'home',
          playerName: getRandomPlayer(homeTeam, ['ST', 'LW', 'RW', 'CAM']),
          description: `${minute}m ${generateCommentary('miss', shotMissedCommentaries)}`,
        });
      }
    } else if (rand < homeChance + awayChance) {
      awayStats.shots++;
      const onTarget = Math.random() < (0.55 + awayAttack / 400);
      if (onTarget) {
        awayStats.shotsOnTarget++;
        const gkSave = Math.random() < (homeGK / 120);
        if (!gkSave) {
          awayGoals++;
          const scorer = getRandomPlayer(awayTeam, ['ST', 'LW', 'RW', 'CAM', 'CM', 'CF']);
          const assister = getRandomPlayer(awayTeam, ['CAM', 'CM', 'LW', 'RW', 'ST']);
          events.push({
            minute,
            type: 'goal',
            team: 'away',
            playerName: scorer,
            description: "⚽ " + minute + "m هدف! " + scorer + " يسجل ل" + awayTeam.name + "! " + generateCommentary('goal', goalCommentaries),
            assistBy: assister !== scorer ? assister : undefined,
          });
        } else {
          events.push({
            minute,
            type: 'shot_saved',
            team: 'away',
            playerName: getRandomPlayer(awayTeam, ['ST', 'LW', 'RW', 'CAM']),
            description: `${minute}m ${generateCommentary('save', shotSavedCommentaries)}`,
          });
        }
      } else {
        events.push({
          minute,
          type: 'shot_missed',
          team: 'away',
          playerName: getRandomPlayer(awayTeam, ['ST', 'LW', 'RW', 'CAM']),
          description: `${minute}m ${generateCommentary('miss', shotMissedCommentaries)}`,
        });
      }
    }

    // Corner
    if (Math.random() < 0.03) {
      const isHome = Math.random() < midfieldBalance;
      if (isHome) {
        homeStats.corners++;
        events.push({
          minute,
          type: 'corner',
          team: 'home',
          playerName: '',
          description: minute + "m ركنية ل" + homeTeam.name,
        });
      } else {
        awayStats.corners++;
        events.push({
          minute,
          type: 'corner',
          team: 'away',
          playerName: '',
          description: minute + "m ركنية ل" + awayTeam.name,
        });
      }
    }

    // Free kick
    if (Math.random() < 0.02) {
      const isHome = Math.random() < midfieldBalance;
      events.push({
        minute,
        type: 'free_kick',
        team: isHome ? 'home' : 'away',
        playerName: '',
        description: minute + "m ركلة حرة ل" + (isHome ? homeTeam.name : awayTeam.name),
      });
    }

    // Foul / Yellow card
    if (Math.random() < 0.012) {
      const isHome = Math.random() < 0.5;
      const team = isHome ? 'home' : 'away';
      const stats = isHome ? homeStats : awayStats;
      stats.fouls++;

      if (Math.random() < 0.35) {
        stats.yellowCards++;
        events.push({
          minute,
          type: 'yellow_card',
          team,
          playerName: getRandomPlayer(isHome ? homeTeam : awayTeam, ['CB', 'CDM', 'CM', 'LB', 'RB']),
          description: "🟨 " + minute + "m بطاقة صفراء! " + generateCommentary('yellow', yellowCardCommentaries),
        });

        // Red card (rare)
        if (Math.random() < 0.05) {
          const redTeam = isHome ? homeTeam : awayTeam;
          (isHome ? homeStats : awayStats).redCards++;
          events.push({
            minute,
            type: 'red_card',
            team,
            playerName: getRandomPlayer(redTeam, ['CB', 'CDM', 'CM']),
            description: `🟥 ${minute}m بطاقة حمراء! طرد!`,
          });
        }
      }
    }

    // Injury
    if (Math.random() < 0.004) {
      const isHomeTeam = Math.random() < 0.5;
      const injuryTeam = isHomeTeam ? homeTeam : awayTeam;
      const injuredPlayer = getRandomPlayer(injuryTeam);
      const injuryDesc = generateCommentary("injury", injuryCommentaries) + " - " + injuredPlayer;
      events.push({
        minute,
        type: "injury",
        team: isHomeTeam ? "home" : "away",
        playerName: injuredPlayer,
        description: minute + "m " + injuryDesc,
      });
    }

    // Passes
    homeStats.passes += Math.floor(Math.random() * 3) + 1;
    awayStats.passes += Math.floor(Math.random() * 3) + 1;
  }

  homeStats.passAccuracy = Math.round(70 + homeMidfield / 5 + Math.random() * 10);
  awayStats.passAccuracy = Math.round(70 + awayMidfield / 5 + Math.random() * 10);

  events.push({
    minute: 90,
    type: 'full_time',
    team: 'home',
    playerName: '',
    description: `نهاية المباراة | ${homeTeam.name} ${homeGoals} - ${awayGoals} ${awayTeam.name}`,
  });

  return {
    homeGoals,
    awayGoals,
    events,
    homeStats,
    awayStats,
  };
}

export function getFormationPositions(formation: string): { position: string; x: number; y: number }[] {
  const positions: Record<string, { position: string; x: number; y: number }[]> = {
    '4-4-2': [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LB', x: 15, y: 72 }, { position: 'CB', x: 37, y: 75 }, { position: 'CB', x: 63, y: 75 }, { position: 'RB', x: 85, y: 72 },
      { position: 'LM', x: 15, y: 50 }, { position: 'CM', x: 37, y: 53 }, { position: 'CM', x: 63, y: 53 }, { position: 'RM', x: 85, y: 50 },
      { position: 'ST', x: 37, y: 25 }, { position: 'ST', x: 63, y: 25 },
    ],
    '4-3-3': [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LB', x: 15, y: 72 }, { position: 'CB', x: 37, y: 75 }, { position: 'CB', x: 63, y: 75 }, { position: 'RB', x: 85, y: 72 },
      { position: 'CM', x: 30, y: 53 }, { position: 'CDM', x: 50, y: 58 }, { position: 'CM', x: 70, y: 53 },
      { position: 'LW', x: 20, y: 28 }, { position: 'ST', x: 50, y: 22 }, { position: 'RW', x: 80, y: 28 },
    ],
    '3-5-2': [
      { position: 'GK', x: 50, y: 90 },
      { position: 'CB', x: 25, y: 75 }, { position: 'CB', x: 50, y: 78 }, { position: 'CB', x: 75, y: 75 },
      { position: 'LM', x: 10, y: 50 }, { position: 'CM', x: 30, y: 55 }, { position: 'CDM', x: 50, y: 58 }, { position: 'CM', x: 70, y: 55 }, { position: 'RM', x: 90, y: 50 },
      { position: 'ST', x: 35, y: 25 }, { position: 'ST', x: 65, y: 25 },
    ],
    '4-2-3-1': [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LB', x: 15, y: 72 }, { position: 'CB', x: 37, y: 75 }, { position: 'CB', x: 63, y: 75 }, { position: 'RB', x: 85, y: 72 },
      { position: 'CDM', x: 37, y: 60 }, { position: 'CDM', x: 63, y: 60 },
      { position: 'LW', x: 20, y: 40 }, { position: 'CAM', x: 50, y: 38 }, { position: 'RW', x: 80, y: 40 },
      { position: 'ST', x: 50, y: 20 },
    ],
    '4-5-1': [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LB', x: 15, y: 72 }, { position: 'CB', x: 37, y: 75 }, { position: 'CB', x: 63, y: 75 }, { position: 'RB', x: 85, y: 72 },
      { position: 'LM', x: 12, y: 48 }, { position: 'CM', x: 32, y: 53 }, { position: 'CDM', x: 50, y: 57 }, { position: 'CM', x: 68, y: 53 }, { position: 'RM', x: 88, y: 48 },
      { position: 'ST', x: 50, y: 22 },
    ],
    '5-3-2': [
      { position: 'GK', x: 50, y: 90 },
      { position: 'LWB', x: 10, y: 55 }, { position: 'CB', x: 28, y: 75 }, { position: 'CB', x: 50, y: 78 }, { position: 'CB', x: 72, y: 75 }, { position: 'RWB', x: 90, y: 55 },
      { position: 'CM', x: 30, y: 48 }, { position: 'CM', x: 50, y: 50 }, { position: 'CM', x: 70, y: 48 },
      { position: 'ST', x: 35, y: 25 }, { position: 'ST', x: 65, y: 25 },
    ],
  };
  return positions[formation] || positions['4-4-2'];
}
