// Same shared playerId, raced to a win (server must run with a low WIN_TILE).
import { io } from "socket.io-client";
const URL = process.env.SERVER_URL ?? "http://localhost:4100";
const SHARED_ID = "11111111-1111-1111-1111-111111111111";
const dirs = ["up", "down", "left", "right"];

function client(name) {
  const s = io(URL, { transports: ["websocket"] });
  const st = { name, over: null, socket: s, matchId: null };
  s.on("connect", () => s.emit("join_queue", { playerId: SHARED_ID, username: name }));
  s.on("match_found", (p) => (st.matchId = p.matchId));
  s.on("game_start", () => {
    const t = setInterval(() => {
      if (st.over) return clearInterval(t);
      s.emit("player_move", { matchId: st.matchId, direction: dirs[Math.floor(Math.random() * 4)] });
    }, 15);
  });
  s.on("game_over", (p) => (st.over = p));
  return st;
}

const a = client("TabA");
const b = client("TabB");
const deadline = Date.now() + 30000;
const t = setInterval(() => {
  if (a.over && b.over) {
    clearInterval(t);
    console.log(`TabA: won=${a.over.you.won} reason=${a.over.reason}`);
    console.log(`TabB: won=${b.over.you.won} reason=${b.over.reason}`);
    const ok = a.over.reason === "won" && a.over.you.won !== b.over.you.won;
    console.log(ok ? "SAME-ID WIN PASS (exactly one winner)" : "SAME-ID WIN FAIL");
    a.socket.close(); b.socket.close();
    process.exit(ok ? 0 : 1);
  }
  if (Date.now() > deadline) { console.log("TIMEOUT"); process.exit(1); }
}, 200);
