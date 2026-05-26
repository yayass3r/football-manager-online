// Game Data - Seed data, player name generation, team generation

const arabicFirstNames = [
  'أحمد', 'محمد', 'علي', 'حسن', 'عمر', 'خالد', 'يوسف', 'إبراهيم', 'سعيد', 'فهد',
  'ناصر', 'عبدالله', 'محمود', 'طارق', 'وليد', 'راشد', 'سلطان', 'فيصل', 'بدر', 'ماجد',
  'سامي', 'ياسر', 'مشعل', 'عبدالرحمن', 'زياد', 'هشام', 'رائد', 'أنس', 'حمزة', 'بلال',
  'كريم', 'ريان', 'آدم', 'عبدالعزيز', 'تركي', 'سعود', 'منصور', 'جاسم', 'نواف', 'حمد',
  'شريف', 'مروان', 'أيمن', 'رامي', 'لواء', 'حاتم', 'صالح', 'إياد', 'زهير', 'نادر',
];

const arabicLastNames = [
  'الحربي', 'الشمري', 'العتيبي', 'الدوسري', 'القحطاني', 'الغامدي', 'الزهراني',
  'المالكي', 'السبيعي', 'الرشيدي', 'المطيري', 'العنزي', 'البلوي', 'الجهني',
  'العمري', 'الشهري', 'الأحمدي', 'السلمي', 'الثبيتي', 'الكناني',
  'الفيفي', 'الرجال', 'العبسي', 'الزبيلي', 'المرواني', 'الهاشمي',
  'الداود', 'الصالح', 'العبدلي', 'المهنا', 'الرميلي', 'الشيباني',
];

const internationalFirstNames = [
  'Lucas', 'Mateo', 'Santiago', 'André', 'Felipe', 'Carlos', 'Diego', 'Rafael',
  'Marco', 'Luca', 'Leon', 'Maxim', 'Emre', 'Yusuf', 'Karim', 'Omar',
  'Sadio', 'Mohamed', 'Riyad', 'Hakim', 'Achraf', 'Ismaël', 'Franck',
  'Vinícius', 'Rodrygo', 'Eder', 'Thiago', 'Casemiro', 'Fabinho',
];

const internationalLastNames = [
  'Silva', 'Santos', 'Oliveira', 'Costa', 'Pereira', 'Fernandes', 'Souza',
  'Lima', 'Alves', 'Ribeiro', 'Martins', 'Gomes', 'Rodrigues', 'Carvalho',
  'Moreira', 'Nunes', 'Mendes', 'Lopes', 'Vieira', 'Monteiro',
  'Touré', 'Diarra', 'Cissé', 'Keita', 'Kone', 'Sane', 'Mané',
];

const nationalities = [
  'سعودي', 'إماراتي', 'قطري', 'كويتي', 'بحريني', 'عماني', 'عراقي', 'أردني',
  'مصري', 'تونسي', 'جزائري', 'مغربي', 'سوداني', 'ليبي', 'لبناني', 'سوري',
  'برازيلي', 'أرجنتيني', 'فرنسي', 'إسباني', 'ألماني', 'إنجليزي', 'إيطالي',
  'برتغالي', 'كرواتي', 'صربي', 'مغربي', 'سنغالي', 'نيجيري', 'كاميروني',
];

export function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generatePlayerName(): string {
  if (Math.random() < 0.6) {
    return `${randomFrom(arabicFirstNames)} ${randomFrom(arabicLastNames)}`;
  }
  return `${randomFrom(internationalFirstNames)} ${randomFrom(internationalLastNames)}`;
}

export function generateNationality(): string {
  return randomFrom(nationalities);
}

export function generatePlayerStats(position: string, baseOverall: number): {
  pace: number; shooting: number; passing: number; dribbling: number;
  defending: number; physical: number; stamina: number;
} {
  const vary = (base: number, range: number) => Math.min(99, Math.max(1, base + Math.floor(Math.random() * range * 2) - range));

  const positionWeights: Record<string, { pace: number; shooting: number; passing: number; dribbling: number; defending: number; physical: number; stamina: number }> = {
    'GK': { pace: 0.3, shooting: 0.1, passing: 0.4, dribbling: 0.1, defending: 0.8, physical: 0.8, stamina: 0.6 },
    'CB': { pace: 0.5, shooting: 0.2, passing: 0.4, dribbling: 0.3, defending: 0.9, physical: 0.8, stamina: 0.7 },
    'LB': { pace: 0.8, shooting: 0.2, passing: 0.5, dribbling: 0.5, defending: 0.7, physical: 0.6, stamina: 0.8 },
    'RB': { pace: 0.8, shooting: 0.2, passing: 0.5, dribbling: 0.5, defending: 0.7, physical: 0.6, stamina: 0.8 },
    'CDM': { pace: 0.5, shooting: 0.3, passing: 0.6, dribbling: 0.4, defending: 0.8, physical: 0.8, stamina: 0.9 },
    'CM': { pace: 0.6, shooting: 0.4, passing: 0.8, dribbling: 0.6, defending: 0.5, physical: 0.6, stamina: 0.8 },
    'CAM': { pace: 0.7, shooting: 0.6, passing: 0.9, dribbling: 0.8, defending: 0.2, physical: 0.4, stamina: 0.7 },
    'LM': { pace: 0.8, shooting: 0.5, passing: 0.7, dribbling: 0.7, defending: 0.3, physical: 0.5, stamina: 0.8 },
    'RM': { pace: 0.8, shooting: 0.5, passing: 0.7, dribbling: 0.7, defending: 0.3, physical: 0.5, stamina: 0.8 },
    'LW': { pace: 0.9, shooting: 0.7, passing: 0.6, dribbling: 0.9, defending: 0.2, physical: 0.4, stamina: 0.7 },
    'RW': { pace: 0.9, shooting: 0.7, passing: 0.6, dribbling: 0.9, defending: 0.2, physical: 0.4, stamina: 0.7 },
    'ST': { pace: 0.7, shooting: 0.9, passing: 0.4, dribbling: 0.6, defending: 0.1, physical: 0.7, stamina: 0.7 },
    'CF': { pace: 0.6, shooting: 0.8, passing: 0.6, dribbling: 0.7, defending: 0.2, physical: 0.5, stamina: 0.7 },
  };

  const weights = positionWeights[position] || positionWeights['CM'];

  return {
    pace: vary(Math.round(baseOverall * weights.pace + 20 * (1 - weights.pace)), 8),
    shooting: vary(Math.round(baseOverall * weights.shooting + 15 * (1 - weights.shooting)), 8),
    passing: vary(Math.round(baseOverall * weights.passing + 15 * (1 - weights.passing)), 8),
    dribbling: vary(Math.round(baseOverall * weights.dribbling + 15 * (1 - weights.dribbling)), 8),
    defending: vary(Math.round(baseOverall * weights.defending + 15 * (1 - weights.defending)), 8),
    physical: vary(Math.round(baseOverall * weights.physical + 15 * (1 - weights.physical)), 8),
    stamina: vary(Math.round(baseOverall * weights.stamina + 20 * (1 - weights.stamina)), 6),
  };
}

export function generatePlayerValue(overall: number, age: number): number {
  let base = overall * overall * 150;
  if (age < 22) base *= 1.5;
  else if (age < 26) base *= 1.3;
  else if (age > 30) base *= 0.6;
  else if (age > 33) base *= 0.3;
  return Math.round(base);
}

export function generateSalary(overall: number): number {
  return Math.round(overall * overall * 8 + 10000);
}

export const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
export const formations = ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '4-5-1', '5-3-2'];

export const formationLabels: Record<string, string> = {
  '4-4-2': '4-4-2 كلاسيكي',
  '4-3-3': '4-3-3 هجومي',
  '3-5-2': '3-5-2 متوازن',
  '4-2-3-1': '4-2-3-1 حديث',
  '4-5-1': '4-5-1 دفاعي',
  '5-3-2': '5-3-2 محصن',
};

export const positionLabels: Record<string, string> = {
  'GK': 'حارس',
  'CB': 'قلب دفاع',
  'LB': 'ظهير أيسر',
  'RB': 'ظهير أيمن',
  'CDM': 'محور دفاعي',
  'CM': 'وسط',
  'CAM': 'وسط مهاجم',
  'LM': 'جناح أيسر',
  'RM': 'جناح أيمن',
  'LW': 'مهاجم أيسر',
  'RW': 'مهاجم أيمن',
  'ST': 'مهاجم',
  'CF': 'مهاجم ثاني',
};

export const positionColors: Record<string, string> = {
  'GK': '#f59e0b',
  'CB': '#3b82f6',
  'LB': '#3b82f6',
  'RB': '#3b82f6',
  'CDM': '#22c55e',
  'CM': '#22c55e',
  'CAM': '#22c55e',
  'LM': '#22c55e',
  'RM': '#22c55e',
  'LW': '#ef4444',
  'RW': '#ef4444',
  'ST': '#ef4444',
  'CF': '#ef4444',
};

export const positionCategories: Record<string, string> = {
  'GK': 'حراسة',
  'CB': 'دفاع',
  'LB': 'دفاع',
  'RB': 'دفاع',
  'CDM': 'وسط',
  'CM': 'وسط',
  'CAM': 'وسط',
  'LM': 'وسط',
  'RM': 'وسط',
  'LW': 'هجوم',
  'RW': 'هجوم',
  'ST': 'هجوم',
  'CF': 'هجوم',
};

export const teamLogos = ['⚽', '🏀', '🔶', '🔷', '⭐', '🌟', '👑', '🦁', '🐯', '🦅', '🐉', '🐎', '⚔️', '🛡️', '🔱', '💎', '🏆', '🎯', '⚡', '🔥'];

export const teamColors = [
  '#1a7a2e', '#c41e3a', '#1e3a5f', '#ff6b00', '#6b21a8',
  '#be123c', '#166534', '#1d4ed8', '#9333ea', '#dc2626',
  '#059669', '#d97706', '#4338ca', '#7c3aed', '#db2777',
  '#0d9488', '#ca8a04', '#4f46e5', '#a855f7', '#e11d48',
];

export interface AITeamData {
  name: string;
  shortName: string;
  logo: string;
  primaryColor: string;
}

export const leagueTeams: Record<number, AITeamData[]> = {
  1: [
    { name: 'النصر', shortName: 'نصر', logo: '🟡', primaryColor: '#f5c518' },
    { name: 'الهلال', shortName: 'هلال', logo: '🔵', primaryColor: '#1e3a5f' },
    { name: 'الأهلي', shortName: 'أهلي', logo: '🟢', primaryColor: '#1a7a2e' },
    { name: 'الاتحاد', shortName: 'اتحاد', logo: '🔶', primaryColor: '#c41e3a' },
    { name: 'الشباب', shortName: 'شباب', logo: '⬜', primaryColor: '#ffffff' },
    { name: 'الرائد', shortName: 'رائد', logo: '🔴', primaryColor: '#c41e3a' },
    { name: 'الفيحاء', shortName: 'فيحاء', logo: '🟠', primaryColor: '#ff6b00' },
    { name: 'التعاون', shortName: 'تعاون', logo: '🔷', primaryColor: '#1e3a5f' },
    { name: 'الفتح', shortName: 'فتح', logo: '🟤', primaryColor: '#8b4513' },
    { name: 'الوحدة', shortName: 'وحدة', logo: '⚫', primaryColor: '#1a1a1a' },
    { name: 'القادسية', shortName: 'قدسية', logo: '🟡', primaryColor: '#f5c518' },
    { name: 'الخليج', shortName: 'خليج', logo: '🔵', primaryColor: '#1e3a5f' },
    { name: 'الداماك', shortName: 'داماك', logo: '🔴', primaryColor: '#c41e3a' },
    { name: 'أبها', shortName: 'أبها', logo: '🟢', primaryColor: '#1a7a2e' },
    { name: 'الطائي', shortName: 'طائي', logo: '🟠', primaryColor: '#ff6b00' },
    { name: 'الحزم', shortName: 'حزم', logo: '🔴', primaryColor: '#c41e3a' },
    { name: 'الأنصار', shortName: 'أنصار', logo: '🟢', primaryColor: '#1a7a2e' },
    { name: 'العين', shortName: 'عين', logo: '🔵', primaryColor: '#1e3a5f' },
    { name: 'الجبلين', shortName: 'جبلين', logo: '🔶', primaryColor: '#ff6b00' },
    { name: 'الأخدود', shortName: 'أخدود', logo: '🟤', primaryColor: '#8b4513' },
  ],
  2: [
    { name: 'العروبة', shortName: 'عروبة', logo: '🔵', primaryColor: '#1e3a5f' },
    { name: 'الزلفي', shortName: 'زلفي', logo: '🟢', primaryColor: '#1a7a2e' },
    { name: 'الساحل', shortName: 'ساحل', logo: '🟡', primaryColor: '#f5c518' },
    { name: 'الجبيل', shortName: 'جبيل', logo: '🔴', primaryColor: '#c41e3a' },
    { name: 'نجران', shortName: 'نجران', logo: '🟠', primaryColor: '#ff6b00' },
    { name: 'الحجاز', shortName: 'حجاز', logo: '⬛', primaryColor: '#1a1a1a' },
    { name: 'الصفا', shortName: 'صفا', logo: '⬜', primaryColor: '#9ca3af' },
    { name: 'الكنانة', shortName: 'كنانة', logo: '🟢', primaryColor: '#1a7a2e' },
    { name: 'الخوارزمي', shortName: 'خوارزمي', logo: '🔵', primaryColor: '#1e3a5f' },
    { name: 'المجد', shortName: 'مجد', logo: '🟡', primaryColor: '#f5c518' },
    { name: 'الأمل', shortName: 'أمل', logo: '🔴', primaryColor: '#c41e3a' },
    { name: 'البراعة', shortName: 'براعة', logo: '🟠', primaryColor: '#ff6b00' },
    { name: 'الريان', shortName: 'ريان', logo: '🔶', primaryColor: '#9333ea' },
    { name: 'الصدارة', shortName: 'صدارة', logo: '⭐', primaryColor: '#1a7a2e' },
    { name: 'النخيل', shortName: 'نخيل', logo: '🌴', primaryColor: '#1a7a2e' },
    { name: 'الوثبة', shortName: 'وثبة', logo: '🦅', primaryColor: '#1e3a5f' },
    { name: 'الصقر', shortName: 'صقر', logo: '🦅', primaryColor: '#c41e3a' },
    { name: 'العلا', shortName: 'علا', logo: '🏔️', primaryColor: '#8b4513' },
    { name: 'البحر', shortName: 'بحر', logo: '🌊', primaryColor: '#1e3a5f' },
    { name: 'الشروق', shortName: 'شروق', logo: '🌅', primaryColor: '#ff6b00' },
  ],
  3: [
    { name: 'السلام', shortName: 'سلام', logo: '🕊️', primaryColor: '#1a7a2e' },
    { name: 'الوفاق', shortName: 'وفاق', logo: '🤝', primaryColor: '#1e3a5f' },
    { name: 'الإخاء', shortName: 'إخاء', logo: '💪', primaryColor: '#c41e3a' },
    { name: 'الترجي', shortName: 'ترجي', logo: '⭐', primaryColor: '#f5c518' },
    { name: 'النجم', shortName: 'نجم', logo: '⭐', primaryColor: '#9333ea' },
    { name: 'الشهاب', shortName: 'شهاب', logo: '☄️', primaryColor: '#ff6b00' },
    { name: 'البرق', shortName: 'برق', logo: '⚡', primaryColor: '#f5c518' },
    { name: 'الزعفران', shortName: 'زعفران', logo: '🌸', primaryColor: '#9333ea' },
    { name: 'الياسمين', shortName: 'ياسمين', logo: '🌼', primaryColor: '#f5c518' },
    { name: 'الرمال', shortName: 'رمال', logo: '🏜️', primaryColor: '#8b4513' },
    { name: 'الواحة', shortName: 'واحة', logo: '🏝️', primaryColor: '#1a7a2e' },
    { name: 'النبض', shortName: 'نبض', logo: '💓', primaryColor: '#c41e3a' },
    { name: 'الروعة', shortName: 'روعة', logo: '✨', primaryColor: '#9333ea' },
    { name: 'الدهناء', shortName: 'دهناء', logo: '🌿', primaryColor: '#1a7a2e' },
    { name: 'السراب', shortName: 'سراب', logo: '🌅', primaryColor: '#ff6b00' },
    { name: 'السحاب', shortName: 'سحاب', logo: '☁️', primaryColor: '#1e3a5f' },
    { name: 'الغيم', shortName: 'غيم', logo: '🌧️', primaryColor: '#6b7280' },
    { name: 'الصباح', shortName: 'صباح', logo: '🌅', primaryColor: '#f5c518' },
    { name: 'المساء', shortName: 'مساء', logo: '🌙', primaryColor: '#1e3a5f' },
    { name: 'العود', shortName: 'عود', logo: '🎵', primaryColor: '#8b4513' },
  ],
  4: [
    { name: 'البداية', shortName: 'بداية', logo: '🆕', primaryColor: '#1a7a2e' },
    { name: 'الأفق', shortName: 'أفق', logo: '🌅', primaryColor: '#ff6b00' },
    { name: 'الضياء', shortName: 'ضياء', logo: '💡', primaryColor: '#f5c518' },
    { name: 'النسيم', shortName: 'نسيم', logo: '💨', primaryColor: '#1e3a5f' },
    { name: 'الخير', shortName: 'خير', logo: '🌟', primaryColor: '#1a7a2e' },
    { name: 'الفجر', shortName: 'فجر', logo: '🌅', primaryColor: '#f5c518' },
    { name: 'الندى', shortName: 'ندى', logo: '💧', primaryColor: '#1e3a5f' },
    { name: 'الوسم', shortName: 'وسم', logo: '🏷️', primaryColor: '#9333ea' },
    { name: 'القمر', shortName: 'قمر', logo: '🌙', primaryColor: '#1e3a5f' },
    { name: 'الشمس', shortName: 'شمس', logo: '☀️', primaryColor: '#f5c518' },
    { name: 'النور', shortName: 'نور', logo: '💡', primaryColor: '#f5c518' },
    { name: 'الظل', shortName: 'ظل', logo: '🌑', primaryColor: '#6b7280' },
    { name: 'العطاء', shortName: 'عطاء', logo: '🎁', primaryColor: '#c41e3a' },
    { name: 'البناء', shortName: 'بناء', logo: '🏗️', primaryColor: '#8b4513' },
    { name: 'الرفعة', shortName: 'رفعة', logo: '⬆️', primaryColor: '#1a7a2e' },
    { name: 'المجد', shortName: 'مجد', logo: '👑', primaryColor: '#f5c518' },
    { name: 'العز', shortName: 'عز', logo: '💪', primaryColor: '#c41e3a' },
    { name: 'المجددة', shortName: 'مجددة', logo: '♻️', primaryColor: '#1a7a2e' },
    { name: 'الأمل الجديد', shortName: 'أمل ج', logo: '🌱', primaryColor: '#1a7a2e' },
    { name: 'الصعود', shortName: 'صعود', logo: '📈', primaryColor: '#ff6b00' },
  ],
};

export function generateTeamPlayers(teamLevel: number): Array<{
  name: string;
  position: string;
  nationality: string;
  age: number;
  overall: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  stamina: number;
  value: number;
  salary: number;
}> {
  const players: Array<{
    name: string;
    position: string;
    nationality: string;
    age: number;
    overall: number;
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
    stamina: number;
    value: number;
    salary: number;
  }> = [];
  const positionCounts: Record<string, number> = {
    'GK': 2, 'CB': 4, 'LB': 2, 'RB': 2, 'CDM': 2,
    'CM': 3, 'CAM': 2, 'LW': 2, 'RW': 2, 'ST': 3,
  };

  const baseOverallByLevel: Record<number, [number, number]> = {
    1: [72, 88],
    2: [62, 78],
    3: [52, 70],
    4: [45, 65],
  };

  const range = baseOverallByLevel[teamLevel] || [50, 70];

  for (const [pos, count] of Object.entries(positionCounts)) {
    for (let i = 0; i < count; i++) {
      const overall = Math.floor(Math.random() * (range[1] - range[0])) + range[0];
      const age = Math.floor(Math.random() * 18) + 17; // 17-34
      const stats = generatePlayerStats(pos, overall);
      players.push({
        name: generatePlayerName(),
        position: pos,
        nationality: generateNationality(),
        age,
        overall,
        ...stats,
        value: generatePlayerValue(overall, age),
        salary: generateSalary(overall),
      });
    }
  }

  return players;
}

export const leagueNames: Record<number, string> = {
  1: 'الدوري السعودي للدرجة الأولى',
  2: 'الدوري السعودي للدرجة الثانية',
  3: 'الدوري السعودي للدرجة الثالثة',
  4: 'الدوري السعودي للدرجة الرابعة',
};

export const trainingTypes: Array<{
  type: string;
  label: string;
  stat: string;
  cost: number;
  icon: string;
  description: string;
}> = [
  { type: 'stamina', label: 'لياقة بدنية', stat: 'stamina', cost: 50000, icon: '🏃', description: 'تحسين اللياقة البدنية والتحمل' },
  { type: 'shooting', label: 'تسديد', stat: 'shooting', cost: 80000, icon: '🎯', description: 'تحسين دقة التسديد والتهديف' },
  { type: 'passing', label: 'تمرير', stat: 'passing', cost: 60000, icon: '⚽', description: 'تحسين دقة التمرير واللعب الجماعي' },
  { type: 'dribbling', label: 'مراوغة', stat: 'dribbling', cost: 70000, icon: '💫', description: 'تحسين مهارات المراوغة والفردية' },
  { type: 'defending', label: 'دفاع', stat: 'defending', cost: 60000, icon: '🛡️', description: 'تحسين المهارات الدفاعية' },
  { type: 'physical', label: 'قوة بدنية', stat: 'physical', cost: 50000, icon: '💪', description: 'تحسين القوة البدنية والصلابة' },
];

export const stadiumUpgradeCosts: Record<string, { base: number; multiplier: number; label: string; icon: string }> = {
  capacity: { base: 500000, multiplier: 1.5, label: 'سعة الملعب', icon: '🏟️' },
  facilities: { base: 200000, multiplier: 1.8, label: 'المرافق', icon: '🏢' },
  youthAcademy: { base: 300000, multiplier: 2.0, label: 'أكاديمية الشباب', icon: '🎓' },
  trainingGround: { base: 250000, multiplier: 1.8, label: 'أرضية التدريب', icon: '⚽' },
  medicalCenter: { base: 200000, multiplier: 1.7, label: 'المركز الطبي', icon: '🏥' },
};
