import { io, Socket } from "socket.io-client";

// Dev goes through the Vite proxy (same origin); production can point elsewhere
// via VITE_SERVER_URL.
const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "";

export const socket: Socket = io(SERVER_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
});

export function ensureConnected(): void {
  if (!socket.connected) socket.connect();
}

export const SOCKET_EVENTS = {
  // client -> server
  JOIN_QUEUE: "join_queue",
  CANCEL_QUEUE: "cancel_queue",
  PLAYER_MOVE: "player_move",
  LEAVE_MATCH: "leave_match",
  // server -> client
  QUEUE_JOINED: "queue_joined",
  MATCH_FOUND: "match_found",
  GAME_START: "game_start",
  PLAYER_UPDATE: "player_update",
  OPPONENT_UPDATE: "opponent_update",
  GAME_OVER: "game_over",
  ERROR_MESSAGE: "error_message",
} as const;
