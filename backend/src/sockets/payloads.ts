import type { Match, MatchPlayer } from "../match/Match.js";
import type { GameOverPayload, GameOverReason, GameStartPayload } from "../types/index.js";

export function buildGameStartPayload(match: Match, self: MatchPlayer, opponent: MatchPlayer): GameStartPayload {
  return {
    matchId: match.id,
    board: self.state.board,
    score: self.state.score,
    highestTile: self.state.highestTile,
    moves: self.state.moves,
    opponentBoard: opponent.state.board,
    opponentScore: opponent.state.score,
    opponentHighestTile: opponent.state.highestTile,
    opponentMoves: opponent.state.moves,
    startedAt: match.startedAt ?? Date.now(),
  };
}

export function buildGameOverPayload(
  match: Match,
  reason: GameOverReason,
  winner: MatchPlayer | null,
  perspective: MatchPlayer,
  opponent: MatchPlayer,
): GameOverPayload {
  return {
    matchId: match.id,
    reason,
    winnerId: winner?.id ?? null,
    winnerUsername: winner?.username ?? null,
    you: {
      board: perspective.state.board,
      score: perspective.state.score,
      moves: perspective.state.moves,
      highestTile: perspective.state.highestTile,
      won: winner?.socketId === perspective.socketId,
    },
    opponent: {
      board: opponent.state.board,
      score: opponent.state.score,
      moves: opponent.state.moves,
      highestTile: opponent.state.highestTile,
      won: winner?.socketId === opponent.socketId,
    },
    durationMs: match.durationMs,
  };
}
