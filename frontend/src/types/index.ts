export type Board = number[][];

export type Direction = "up" | "down" | "left" | "right";

export type Screen = "home" | "matchmaking" | "countdown" | "game" | "gameover";

export interface PublicPlayer {
  id: string;
  username: string;
  isGuest: boolean;
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

export interface SideResult {
  board: Board;
  score: number;
  moves: number;
  highestTile: number;
  won: boolean;
}

export interface GameOverPayload {
  matchId: string;
  reason: GameOverReason;
  winnerId: string | null;
  winnerUsername: string | null;
  you: SideResult;
  opponent: SideResult;
  durationMs: number;
}

export interface PlayerStats {
  playerId: string;
  username: string | null;
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
  winRate: number;
  fastestWinMs: number | null;
}
