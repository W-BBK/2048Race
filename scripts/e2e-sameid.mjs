// Reproduces two browser windows on one machine: both clients share one playerId.
import { io } from "socket.io-client";
const URL = process.env.SERVER_URL ?? "http://localhost:5173";
const SHARED_ID = "11111111-1111-1111-1111-111111111111";

function client(name) {
  const s = io(URL, { transports: ["websocket"] });
  const st = { name, updates: 0, oppUpdates: 0, matchId: null };
  s.on("connect", () => s.emit("join_queue", { playerId: SHARED_ID, username: name }));
  s.on("match_found", (p) => (st.matchId = p.matchId));
  s.on("game_start", () => {
    // press a few "keys"
    let i = 0;
    const dirs = ["left", "up", "right", "down"];
    const t = setInterval(() => {
      s.emit("player_move", { matchId: st.matchId, direction: dirs[i++ % 4] });
      if (i > 8) clearInterval(t);
    }, 50);
  });
  s.on("player_update", () => st.updates++);
  s.on("opponent_update", () => st.oppUpdates++);
  st.socket = s;
  return st;
}

const a = client("WindowA");
const b = client("WindowB");
setTimeout(() => {
  console.log(`WindowA: updates=${a.updates} oppUpdates=${a.oppUpdates}`);
  console.log(`WindowB: updates=${b.updates} oppUpdates=${b.oppUpdates}`);
  const ok = a.updates > 0 && b.updates > 0 && a.oppUpdates > 0 && b.oppUpdates > 0;
  console.log(ok ? "SAME-ID PASS (boards respond)" : "SAME-ID FAIL (moves do nothing)");
  a.socket.close(); b.socket.close();
  process.exit(ok ? 0 : 1);
}, 6000);
