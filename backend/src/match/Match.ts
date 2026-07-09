import {
  addRandomTile,
  checkWinner,
  createBoard,
  hasMovesAvailable,
  highestTile,
  move as applyMove,
} from "../game/engine.js";
import type {
  Direction,
  GameOverReason,
  MatchStatus,
  PlayerGameState,
  PublicPlayer,
} from "../types/index.js";

export interface MatchPlayer extends PublicPlayer {
  socketId: string;
  state: PlayerGameState;
}

export interface ApplyMoveResult {
  changed: boolean;
  won: boolean;
  player: MatchPlayer;
}

let matchCounter = 0;
function generateMatchId(): string {
  matchCounter += 1;
  return `match_${Date.now().toString(36)}_${matchCounter}`;
}

// Players are identified by socketId throughout a match: playerId is a
// persistent stats identity and can be duplicated (e.g. two windows of the
// same browser share localStorage), while a socket is unique per connection.
export class Match {
  readonly id: string;
  status: MatchStatus = "countdown";
  readonly players: [MatchPlayer, MatchPlayer];
  readonly createdAt: number = Date.now();
  startedAt: number | null = null;
  endedAt: number | null = null;
  winnerSocketId: string | null = null;
  reason: GameOverReason | null = null;

  constructor(p1: PublicPlayer & { socketId: string }, p2: PublicPlayer & { socketId: string }) {
    this.id = generateMatchId();
    this.players = [this.buildPlayer(p1), this.buildPlayer(p2)];
  }

  private buildPlayer(p: PublicPlayer & { socketId: string }): MatchPlayer {
    const board = createBoard();
    return {
      ...p,
      state: {
        board,
        score: 0,
        moves: 0,
        highestTile: highestTile(board),
        stuck: false,
      },
    };
  }

  activate(): void {
    this.status = "active";
    this.startedAt = Date.now();
  }

  getPlayerBySocket(socketId: string): MatchPlayer | undefined {
    return this.players.find((p) => p.socketId === socketId);
  }

  getOpponentBySocket(socketId: string): MatchPlayer | undefined {
    return this.players.find((p) => p.socketId !== socketId);
  }

  hasSocket(socketId: string): boolean {
    return this.players.some((p) => p.socketId === socketId);
  }

  get winner(): MatchPlayer | null {
    if (this.winnerSocketId === null) return null;
    return this.getPlayerBySocket(this.winnerSocketId) ?? null;
  }

  /** Applies a validated directional move for the given connection. Returns null if illegal to act now. */
  applyMove(socketId: string, direction: Direction): ApplyMoveResult | null {
    if (this.status !== "active") return null;
    const player = this.getPlayerBySocket(socketId);
    if (!player) return null;
    if (player.state.stuck) return { changed: false, won: false, player };

    const result = applyMove(player.state.board, direction);
    if (!result.moved) {
      return { changed: false, won: false, player };
    }

    const board = addRandomTile(result.board);
    player.state.board = board;
    player.state.score += result.gained;
    player.state.moves += 1;
    player.state.highestTile = highestTile(board);
    player.state.stuck = !hasMovesAvailable(board);

    const won = checkWinner(board);
    return { changed: true, won, player };
  }

  bothStuck(): boolean {
    return this.players.every((p) => p.state.stuck);
  }

  /**
   * Outcome when both boards are locked: the player who survived more moves
   * wins; a draw only happens when both got stuck on the same move count.
   */
  stuckWinner(): MatchPlayer | null {
    const [p1, p2] = this.players;
    if (p1.state.moves === p2.state.moves) return null;
    return p1.state.moves > p2.state.moves ? p1 : p2;
  }

  finish(reason: GameOverReason, winnerSocketId: string | null): void {
    this.status = "finished";
    this.endedAt = Date.now();
    this.reason = reason;
    this.winnerSocketId = winnerSocketId;
  }

  get durationMs(): number {
    const start = this.startedAt ?? this.createdAt;
    const end = this.endedAt ?? Date.now();
    return end - start;
  }
}
