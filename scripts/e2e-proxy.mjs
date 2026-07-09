import { io } from "socket.io-client";
// connect through the Vite proxy on 5173, exactly as the browser would
const a = io("http://localhost:5173", { transports: ["websocket", "polling"] });
const b = io("http://localhost:5173", { transports: ["websocket", "polling"] });
a.on("connect", () => a.emit("join_queue", { username: "ProxyA" }));
b.on("connect", () => b.emit("join_queue", { username: "ProxyB" }));
a.on("game_start", (p) => {
  console.log("game_start received through Vite proxy — PROXY PASS");
  a.disconnect(); b.disconnect(); process.exit(0);
});
setTimeout(() => { console.log("PROXY TIMEOUT"); process.exit(1); }, 15000);
