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

export const COUNTDOWN_MS = 3000;
