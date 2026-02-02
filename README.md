# 🎰 Poker Game - Multiplayer Texas Hold'em

A real-time multiplayer poker game built with modern web technologies. Features a premium dark/gold UI, WebSocket-based real-time gameplay, and comprehensive game logic.

![Poker Game](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- 🎮 **Real-time Multiplayer** - WebSocket-based gameplay for instant updates
- ⏱️ **Turn Timer** - 30-second countdown with auto-fold mechanism
- 🎨 **Premium UI** - Dark/gold aesthetic with smooth animations
- 🏆 **Complete Game Logic** - Pre-flop, Flop, Turn, River, and Showdown
- 👥 **Multi-table Support** - Join different tables with varying stakes
- 📊 **Admin Dashboard** - Manage tables and monitor games
- 🔐 **Authentication** - Secure user sessions with JWT
- 💰 **Betting System** - Call, Raise, Fold with dynamic bet slider

## 🏗️ Architecture

This is a monorepo built with Turborepo containing:

```
poker-game/
├── apps/
│   ├── user-fe/          # Player frontend (Vite + React)
│   ├── admin-fe/         # Admin dashboard (Vite + React)
│   ├── http-backend/     # REST API (Bun + Express)
│   └── ws-backend/       # WebSocket server (Bun + ws)
├── packages/
│   ├── common/           # Shared types and utilities
│   └── db/              # Database schema and client
└── turbo.json           # Turborepo configuration
```

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- PostgreSQL database
- Node.js v18+ (optional, Bun is preferred)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd poker-game
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   
   Create `.env` files in each app directory:

   **`apps/http-backend/.env`**
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/poker"
   JWT_SECRET="your-secret-key"
   PORT=3001
   ```

   **`apps/ws-backend/.env`**
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/poker"
   JWT_SECRET="your-secret-key"
   PORT=8080
   ```

   **`apps/user-fe/.env`**
   ```env
   VITE_API_URL=http://localhost:3001
   VITE_WS_URL=ws://localhost:8080
   ```

   **`apps/admin-fe/.env`**
   ```env
   VITE_API_URL=http://localhost:3001
   ```

4. **Set up the database**
   ```bash
   cd packages/db
   bunx prisma migrate dev
   bunx prisma generate
   ```

5. **Start all services**
   ```bash
   # From root directory
   bun run dev
   ```

   This starts:
   - User Frontend: http://localhost:5173
   - Admin Frontend: http://localhost:5174
   - HTTP Backend: http://localhost:3001
   - WebSocket Backend: ws://localhost:8080

## 🎮 How to Play

1. **Register/Login** - Create an account or sign in
2. **Join a Table** - Select a table from the lobby
3. **Wait for Players** - Game starts when 2+ players join
4. **Play Poker** - Use the betting controls to Call, Raise, or Fold
5. **Win the Pot** - Best hand wins, or last player standing!

### Game Rules

- **Blinds**: Small blind (Player 1) and Big blind (Player 2) are posted automatically
- **Betting Rounds**: Pre-flop → Flop → Turn → River → Showdown
- **Turn Timer**: 30 seconds per turn, auto-fold on timeout
- **Win Conditions**:
  - All other players fold
  - Best hand at showdown (using 5-card poker hand rankings)

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **WebSocket** - Real-time communication

### Backend
- **Bun** - JavaScript runtime
- **Express** - HTTP server
- **ws** - WebSocket library
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication

## 📦 Project Structure

### Key Files

**Backend Logic:**
- `apps/ws-backend/src/classes/Table.ts` - Core game logic
- `apps/ws-backend/src/classes/Deck.ts` - Card deck management
- `apps/ws-backend/src/classes/HandEvaluator.ts` - Poker hand rankings
- `apps/http-backend/src/index.ts` - REST API routes

**Frontend Components:**
- `apps/user-fe/src/components/GameTable.tsx` - Main game interface
- `apps/user-fe/src/components/Lobby.tsx` - Table selection
- `apps/admin-fe/src/components/Dashboard.tsx` - Admin panel


### Environment Variables for Production

Update WebSocket URLs in frontends to use your deployed backend URLs:
```env
VITE_WS_URL=wss://your-ws-backend.railway.app
VITE_API_URL=https://your-http-backend.render.com
```

## 🧪 Development

### Run Individual Apps

```bash
# HTTP Backend only
cd apps/http-backend
bun run dev

# WebSocket Backend only
cd apps/ws-backend
bun run dev

# User Frontend only
cd apps/user-fe
bun run dev

# Admin Frontend only
cd apps/admin-fe
bun run dev
```

### Build for Production

```bash
# Build all apps
bun run build

# Build specific app
cd apps/user-fe
bun run build
```

## 🎯 Roadmap

- [ ] Tournament mode
- [ ] Player statistics and leaderboards
- [ ] Chat system
- [ ] Mobile responsive design
- [ ] Sound effects and animations
- [ ] Spectator mode
- [ ] Multi-currency support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by classic Texas Hold'em poker

---

**Made with Bun 🥟**
