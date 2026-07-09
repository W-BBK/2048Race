import { io } from "socket.io-client";
const URL = process.env.SERVER_URL ?? "http://localhost:4100";
const a = io(URL, { transports: ["websocket"] });
const b = io(URL, { transports: ["websocket"] });
a.on("connect", () => a.emit("join_queue", { username: "Stayer" }));
b.on("connect", () => b.emit("join_queue", { username: "Quitter" }));
b.on("game_start", () => setTimeout(() => b.disconnect(), 300));
a.on("game_over", (p) => {
  console.log(`Stayer game_over: reason=${p.reason} won=${p.you.won} winner=${p.winnerUsername}`);
  const ok = p.reason === "forfeit" && p.you.won === true;
  console.log(ok ? "FORFEIT PASS" : "FORFEIT FAIL");
  a.disconnect();
  process.exit(ok ? 0 : 1);
});
setTimeout(() => { console.log("FORFEIT TIMEOUT"); process.exit(1); }, 15000);
