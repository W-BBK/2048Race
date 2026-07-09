// E2E: two socket clients queue, race, and one wins (WIN_TILE=8 on the server).
import { io } from "socket.io-client";

const URL = process.env.SERVER_URL ?? "http://localhost:4100";
const DIRECTIONS = ["up", "down", "left", "right"];

function makeClient(name) {
  const socket = io(URL, { transports: ["websocket"] });
  const state = { name, socket, matchId: null, started: false, updates: 0, oppUpdates: 0, over: null };

  socket.on("match_found", (p) => {
    state.matchId = p.matchId;
    console.log(`[${name}] match_found vs ${p.opponent.username} (countdown ${p.countdownMs}ms)`);
  });

  socket.on("game_start", (p) => {
    state.started = true;
    console.log(`[${name}] game_start — board has ${p.board.flat().filter(Boolean).length} tiles`);
    const timer = setInterval(() => {
      if (state.over) return clearInterval(timer);
      socket.emit("player_move", {
        matchId: state.matchId,
        direction: DIRECTIONS[Math.floor(Math.random() * 4)],
      });
    }, 15);
  });

  socket.on("player_update", () => state.updates++);
  socket.on("opponent_update", () => state.oppUpdates++);

  socket.on("game_over", (p) => {
    state.over = p;
    console.log(
      `[${name}] game_over: reason=${p.reason} winner=${p.winnerUsername} youWon=${p.you.won} ` +
        `score=${p.you.score} moves=${p.you.moves} best=${p.you.highestTile} duration=${p.durationMs}ms`,
    );
  });

  socket.on("connect", () => {
    socket.emit("join_queue", { username: name });
    console.log(`[${name}] connected + queued`);
  });

  return state;
}

const alice = makeClient("Alice");
const bob = makeClient("Bob");

const deadline = Date.now() + 30000;
const wait = setInterval(async () => {
  if (alice.over && bob.over) {
    clearInterval(wait);
    console.log(`\n[stats] Alice updates=${alice.updates} oppUpdates=${alice.oppUpdates}`);
    console.log(`[stats] Bob   updates=${bob.updates} oppUpdates=${bob.oppUpdates}`);
    const winnersAgree = alice.over.winnerId === bob.over.winnerId;
    const oneWon = alice.over.you.won !== bob.over.you.won || alice.over.reason === "draw";
    const res = await fetch(`${URL}/api/leaderboard`).then((r) => r.json());
    console.log(`[stats] leaderboard entries: ${res.leaderboard.length}`);
    for (const row of res.leaderboard) console.log(`  - ${row.username}: ${row.wins}W ${row.losses}L`);
    const ok = winnersAgree && oneWon && alice.updates > 0 && alice.oppUpdates > 0 && res.leaderboard.length >= 2;
    console.log(ok ? "\nE2E PASS" : "\nE2E FAIL");
    alice.socket.close();
    bob.socket.close();
    process.exit(ok ? 0 : 1);
  }
  if (Date.now() > deadline) {
    console.log("E2E TIMEOUT");
    process.exit(1);
  }
}, 200);
