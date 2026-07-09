import { db } from "./database.js";
import type { Match } from "../match/Match.js";

export interface PlayerStats {
  playerId: string;
  username: string;
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
  winRate: number;
  fastestWinMs: number | null;
}

const upsertPlayerStmt = db.prepare(`
  INSERT INTO players (id, username, wins, losses, draws, games_played, fastest_win_ms, updated_at)
  VALUES (@id, @username, @wins, @losses, @draws, @gamesPlayed, @fastestWinMs, @updatedAt)
  ON CONFLICT(id) DO UPDATE SET
    username = excluded.username,
    wins = players.wins + excluded.wins,
    losses = players.losses + excluded.losses,
    draws = players.draws + excluded.draws,
    games_played = players.games_played + excluded.games_played,
    fastest_win_ms = MIN(COALESCE(players.fastest_win_ms, excluded.fastest_win_ms), COALESCE(excluded.fastest_win_ms, players.fastest_win_ms)),
    updated_at = excluded.updated_at
`);

const insertMatchStmt = db.prepare(`
  INSERT OR REPLACE INTO matches (
    id, player1_id, player1_username, player2_id, player2_username,
    winner_id, reason, duration_ms,
    player1_score, player2_score, player1_highest_tile, player2_highest_tile,
    created_at
  ) VALUES (
    @id, @player1Id, @player1Username, @player2Id, @player2Username,
    @winnerId, @reason, @durationMs,
    @player1Score, @player2Score, @player1HighestTile, @player2HighestTile,
    @createdAt
  )
`);

/** Persists a finished match and updates both players' running stats. */
export function recordMatchResult(match: Match): void {
  const [p1, p2] = match.players;
  const now = Date.now();

  insertMatchStmt.run({
    id: match.id,
    player1Id: p1.id,
    player1Username: p1.username,
    player2Id: p2.id,
    player2Username: p2.username,
    winnerId: match.winner?.id ?? null,
    reason: match.reason ?? "draw",
    durationMs: match.durationMs,
    player1Score: p1.state.score,
    player2Score: p2.state.score,
    player1HighestTile: p1.state.highestTile,
    player2HighestTile: p2.state.highestTile,
    createdAt: now,
  });

  for (const p of match.players) {
    const won = match.winner?.socketId === p.socketId;
    const lost = match.winner !== null && !won;
    const draw = match.winner === null;
    upsertPlayerStmt.run({
      id: p.id,
      username: p.username,
      wins: won ? 1 : 0,
      losses: lost ? 1 : 0,
      draws: draw ? 1 : 0,
      gamesPlayed: 1,
      fastestWinMs: won ? match.durationMs : null,
      updatedAt: now,
    });
  }
}

const getPlayerStmt = db.prepare(`SELECT * FROM players WHERE id = ?`);

export function getPlayerStats(playerId: string): PlayerStats | null {
  const row = getPlayerStmt.get(playerId) as
    | {
        id: string;
        username: string;
        wins: number;
        losses: number;
        draws: number;
        games_played: number;
        fastest_win_ms: number | null;
      }
    | undefined;
  if (!row) return null;
  return {
    playerId: row.id,
    username: row.username,
    wins: row.wins,
    losses: row.losses,
    draws: row.draws,
    gamesPlayed: row.games_played,
    winRate: row.games_played > 0 ? row.wins / row.games_played : 0,
    fastestWinMs: row.fastest_win_ms,
  };
}

const leaderboardStmt = db.prepare(`
  SELECT id, username, wins, losses, draws, games_played, fastest_win_ms
  FROM players
  WHERE games_played > 0
  ORDER BY wins DESC, fastest_win_ms ASC
  LIMIT ?
`);

export function getLeaderboard(limit = 10): PlayerStats[] {
  const rows = leaderboardStmt.all(limit) as Array<{
    id: string;
    username: string;
    wins: number;
    losses: number;
    draws: number;
    games_played: number;
    fastest_win_ms: number | null;
  }>;
  return rows.map((row) => ({
    playerId: row.id,
    username: row.username,
    wins: row.wins,
    losses: row.losses,
    draws: row.draws,
    gamesPlayed: row.games_played,
    winRate: row.games_played > 0 ? row.wins / row.games_played : 0,
    fastestWinMs: row.fastest_win_ms,
  }));
}
