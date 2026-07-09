export type Board = number[][];

export type Direction = "up" | "down" | "left" | "right";

export type MatchStatus = "countdown" | "active" | "finished";

export interface PublicPlayer {
  id: string;
  username: string;
  isGuest: boolean;
}

export interface PlayerGameState {
  board: Board;
  score: number;
  moves: number;
  highestTile: number;
  stuck: boolean;
}

export interface JoinQueuePayload {
  playerId: string;
  username: string;
}

export interface PlayerMovePayload {
  matchId: string;
  direction: Direction;
}

export interface MatchFoundPayload {
  matchId: string;
  opponent: PublicPlayer;
  you: PublicPlayer;
  countdownMs: number;
}

export interface GameStartPayload {
  matchId: string;
  board: Board;
  score: number;
  highestTile: number;
  moves: number;
  opponentBoard: Board;
  opponentScore: number;
  opponentHighestTile: number;
  opponentMoves: number;
  startedAt: number;
}

export interface PlayerUpdatePayload {
  matchId: string;
  board: Board;
  score: number;
  moves: number;
  highestTile: number;
  moved: boolean;
  stuck: boolean;
}

export interface OpponentUpdatePayload {
  matchId: string;
  board: Board;
  score: number;
  moves: number;
  highestTile: number;
  stuck: boolean;
}

export type GameOverReason = "won" | "forfeit" | "stuck" | "draw";

export interface GameOverPayload {
  matchId: string;
  reason: GameOverReason;
  winnerId: string | null;
  winnerUsername: string | null;
  you: {
    board: Board;
    score: number;
    moves: number;
    highestTile: number;
    won: boolean;
  };
  opponent: {
    board: Board;
    score: number;
    moves: number;
    highestTile: number;
    won: boolean;
  };
  durationMs: number;
}

export interface ErrorPayload {
  message: string;
}
