import { createServer } from "node:http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { CORS_ORIGIN, PORT } from "./config.js";
import { registerSocketHandlers } from "./sockets/registerSocketHandlers.js";
import "./db/database.js";

const app = createApp();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: CORS_ORIGIN },
});

registerSocketHandlers(io);

httpServer.listen(PORT, () => {
  console.log(`2048Race backend listening on http://localhost:${PORT}`);
});
