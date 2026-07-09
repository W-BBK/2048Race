# 2048Race

Real-time multiplayer 2048. Two players queue up, get matched, and race on identical rules — **the first player to build a 2048 tile wins instantly**. Both boards are visible live, with score, best tile, and move counts side by side.

## Quick start

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in two browser windows (or two devices on your LAN), click **Find Match** in both, and race.

- Frontend (Vite + React): http://localhost:5173
- Backend (Express + Socket.IO): http://localhost:4000 (proxied through Vite in dev)

## Controls

- **Arrow keys** or **WASD** on desktop
- **Swipe** on mobile

## How a match works

1. Click **Find Match** — you enter a FIFO matchmaking queue.
2. When a second player queues, a match room is created and both clients get a **3‑2‑1‑GO** countdown.
3. Both boards start simultaneously with two random tiles.
4. Every move is sent to the server, which owns the authoritative board state: it validates the move, applies merges, spawns the new tile, and broadcasts updates to both players. The client never decides the winner.
5. The instant one player's board contains a 2048 tile, the server ends the match and both players see the victory/defeat screen. Leaving or disconnecting mid-match forfeits. If both boards lock up, the player who survived more moves wins — it's only a draw when both got stuck on the same move count.

Results are persisted to SQLite (via Node's built-in `node:sqlite`) and power the home-screen stats and Top Racers leaderboard.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs backend (port 4000, auto-reload) and frontend (port 5173) together |
| `npm test` | Backend engine unit tests (Vitest) |
| `npm run build` | Compiles backend to `backend/dist` and frontend to `frontend/dist` |
| `npm start` | Production server — serves API, websockets, **and** the built frontend on port 4000 |

Smoke tests (require a running server):

```bash
# full two-bot match against a low win tile
(cd backend && PORT=4100 WIN_TILE=8 npx tsx src/server.ts) &
node scripts/e2e-match.mjs        # queue → countdown → race → win → leaderboard
node scripts/e2e-forfeit.mjs      # mid-match disconnect forfeits correctly
node scripts/e2e-proxy.mjs        # match flow through the Vite dev proxy (needs npm run dev)
```

## Configuration

| Env var | Default | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | Backend HTTP/websocket port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed cross-origin frontend origin (irrelevant when the backend serves the frontend itself) |
| `DB_PATH` | `backend/data/2048race.sqlite` | SQLite database location |
| `WIN_TILE` | `2048` | Winning tile — lower it (e.g. `64`) for quick demo matches |
| `VITE_SERVER_URL` | *(same origin)* | Frontend: point sockets at a remote backend |

## Deployment

Single container, one port:

```bash
docker build -t 2048race .
docker run -p 4000:4000 -v 2048race-data:/app/backend/data 2048race
```

Or without Docker: `npm install && npm run build && npm start`.

## Architecture

```
backend/src/
  game/engine.ts        pure 2048 rules: createBoard, move, addRandomTile, checkWinner…
  matchmaking/queue.ts  FIFO queue that pairs the two longest-waiting players
  match/Match.ts        one match: two boards, statuses, server-side move application
  match/matchManager.ts live match registry
  sockets/              socket event handlers + payload builders (the multiplayer API)
  db/                   node:sqlite persistence for players, stats, match history
  routes/               REST: /api/stats/:playerId, /api/leaderboard, /health

frontend/src/
  socket/socket.ts      socket.io-client singleton + event names
  state/gameStore.ts    zustand store; socket events drive screen + board state
  hooks/useGameControls keyboard (arrows/WASD) + touch swipe input
  components/           home, matchmaking, countdown, game, game-over screens
```

Socket protocol — client → server: `join_queue`, `cancel_queue`, `player_move`, `leave_match`; server → client: `queue_joined`, `match_found`, `game_start`, `player_update`, `opponent_update`, `game_over`.

**Fairness:** the client only ever sends a direction. Board state, merges, tile spawns, scores, and the winner are all computed server-side; a modified client cannot claim a win.
