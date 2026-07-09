import { Match } from "./Match.js";
import type { PublicPlayer } from "../types/index.js";

class MatchManager {
  private matches = new Map<string, Match>();

  create(p1: PublicPlayer & { socketId: string }, p2: PublicPlayer & { socketId: string }): Match {
    const match = new Match(p1, p2);
    this.matches.set(match.id, match);
    return match;
  }

  get(matchId: string): Match | undefined {
    return this.matches.get(matchId);
  }

  remove(matchId: string): void {
    this.matches.delete(matchId);
  }

  /** Finds the active/countdown match a given socket is currently participating in. */
  findBySocketId(socketId: string): Match | undefined {
    for (const match of this.matches.values()) {
      if (match.status === "finished") continue;
      if (match.players.some((p) => p.socketId === socketId)) return match;
    }
    return undefined;
  }
}

export const matchManager = new MatchManager();
