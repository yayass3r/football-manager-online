# 🏆 مدير كرة القدم أونلاين | Football Manager Online

<div dir="rtl">

لعبة مدير كرة قدم إلكترونية متعددة اللاعبين مبنية بأحدث التقنيات. أنشئ فريقك، درّب لاعبيك، خض المباريات، وتسلق ترتيب الدوري نحو القمة!

</div>

## 🎮 Game Features

### ⚽ Core Gameplay
- **Team Creation** - 3-step wizard to create your team with custom name, logo, colors, and formation
- **Squad Management** - Visual pitch view with FIFA-style player cards
- **Match Simulation** - Live animated matches with real-time Arabic commentary
- **6 Formations** - 4-4-2, 4-3-3, 3-5-2, 4-2-3-1, 4-5-1, 5-3-2
- **Tactical Controls** - Attacking style, pressing intensity, tempo sliders

### 🏆 League System
- **4 Leagues** with 20 teams each (80 AI teams total)
- **Promotion/Relegation** - Top 3 promote, bottom 3 relegate
- **38 Match Days** per season with full fixture schedule
- **Season History** - Track your progress across multiple seasons

### 💰 Economy & Transfers
- **Transfer Market** - Buy and sell players with filters and sorting
- **Scout Center** - Discover promising players with potential ratings
- **Daily Rewards** - 7-day calendar with escalating rewards (100K-500K coins)
- **Achievement System** - 10 achievements across 5 categories with coin rewards

### 🏋️ Development
- **Training Center** - 6 training types (stamina, shooting, passing, dribbling, defending, physical)
- **Youth Academy** - Graduate young players based on academy level
- **Stadium Management** - Upgrade 5 facilities (capacity, facilities, academy, training ground, medical center)
- **Team Chemistry** - Calculated from position fit, morale, and formation

### 📰 Media & Content
- **News Feed** - Auto-generated articles about match results, transfers, and league events
- **Season Summary** - Detailed end-of-season recap with stats and awards

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | Full-stack framework with App Router |
| **TypeScript 5** | Type-safe development |
| **Prisma ORM** | Database management (SQLite) |
| **Tailwind CSS 4** | Responsive styling |
| **shadcn/ui** | UI component library |
| **Zustand** | State management |
| **Framer Motion** | Animations |
| **Socket.io** | Real-time multiplayer |

## 📁 Project Structure

```
src/
├── app/
│   ├── api/              # Backend API routes
│   │   ├── game/         # Game init, state, create-team, reset
│   │   ├── match/        # Match simulation
│   │   ├── league/       # League standings
│   │   ├── transfers/    # Buy/sell players
│   │   ├── players/      # Training
│   │   ├── stadium/      # Upgrades
│   │   ├── achievements/ # Achievement system
│   │   ├── daily-reward/ # Daily rewards
│   │   ├── scout/        # Scout center
│   │   ├── news/         # News feed
│   │   └── season/       # Season management
│   ├── page.tsx          # Main entry point
│   ├── layout.tsx        # RTL Arabic layout
│   └── globals.css       # Custom animations & styles
├── components/
│   ├── game/             # Game components
│   │   ├── GameShell.tsx       # Main navigation shell
│   │   ├── CreateTeam.tsx      # Team creation wizard
│   │   ├── HomeDashboard.tsx   # Dashboard with stats
│   │   ├── SquadManager.tsx    # Pitch view & player list
│   │   ├── TacticsBoard.tsx    # Formation & tactics
│   │   ├── MatchCenter.tsx     # Live match simulation
│   │   ├── LeagueTable.tsx     # Standings & fixtures
│   │   ├── TransferMarket.tsx  # Buy/sell players
│   │   ├── TrainingCenter.tsx  # Player training
│   │   ├── StadiumView.tsx     # Stadium management
│   │   ├── DailyRewards.tsx    # Weekly reward calendar
│   │   ├── Achievements.tsx    # Achievement gallery
│   │   ├── ScoutCenter.tsx     # Player scouting
│   │   ├── NewsFeed.tsx        # Football news
│   │   ├── SeasonSummary.tsx   # Season recap
│   │   └── PlayerCard.tsx      # Reusable player card
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── game-engine.ts    # Match simulation & chemistry
│   ├── game-store.ts     # Zustand state management
│   ├── game-data.ts      # Seed data & generators
│   ├── db.ts             # Prisma client
│   └── utils.ts          # Utilities
└── prisma/
    └── schema.prisma     # Database schema (15 models)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Bun (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yayass3r/football-manager-online.git
cd football-manager-online

# Install dependencies
bun install

# Set up database
bun run db:push

# Start development server
bun run dev
```

### Environment Variables

Create a `.env` file:
```env
DATABASE_URL="file:./db/custom.db"
```

## 🎯 Game Flow

1. **Create Your Team** - Choose name, logo, colors, and formation
2. **Start in Division 4** - Begin your journey at the bottom
3. **Train Your Players** - Improve stats through 6 training types
4. **Buy & Sell** - Use the transfer market and scout center
5. **Play Matches** - Simulate full match days with live commentary
6. **Earn Rewards** - Daily login rewards and achievement bonuses
7. **Get Promoted** - Finish top 3 to move up a division
8. **Reach the Top** - Win Division 1 and become a legend!

## 🌍 Localization

The entire game interface is in **Arabic (RTL)** with:
- Arabic player names and team names
- Arabic match commentary
- Arabic news articles
- RTL-optimized layouts

## 📊 Database Models

- **Manager** - Player profile with coins, gems, level, XP
- **Team** - Team info with formation, morale, fan support
- **Player** - 11 stats per player (pace, shooting, passing, etc.)
- **Stadium** - 5 upgradeable facilities
- **League** - 4 divisions with promotion/relegation
- **Match** - Fixture management with events
- **Achievement** - 10 career milestones
- **DailyReward** - Weekly reward calendar
- **ScoutReport** - Player discovery system
- **SeasonHistory** - Cross-season tracking
- **NewsArticle** - Dynamic content generation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div dir="rtl">

⚽ **مدير كرة القدم أونلاين** - أنشئ فريقك وقودهم نحو المجد!

</div>
