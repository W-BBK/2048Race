export interface QueueEntry {
  socketId: string;
  playerId: string;
  username: string;
  isGuest: boolean;
  joinedAt: number;
}

/** FIFO matchmaking queue — pairs the two longest-waiting players. */
class MatchmakingQueue {
  private entries: QueueEntry[] = [];

  /** Adds (or re-adds) a player to the back of the queue. */
  join(entry: Omit<QueueEntry, "joinedAt">): void {
    this.leave(entry.socketId);
    this.entries.push({ ...entry, joinedAt: Date.now() });
  }

  /** Removes a player from the queue, returning the removed entry if present. */
  leave(socketId: string): QueueEntry | undefined {
    const index = this.entries.findIndex((e) => e.socketId === socketId);
    if (index === -1) return undefined;
    return this.entries.splice(index, 1)[0];
  }

  isQueued(socketId: string): boolean {
    return this.entries.some((e) => e.socketId === socketId);
  }

  /** Pops the two longest-waiting players if enough are queued, else null. */
  tryMatch(): [QueueEntry, QueueEntry] | null {
    if (this.entries.length < 2) return null;
    const [a, b] = this.entries.splice(0, 2);
    return [a, b];
  }

  size(): number {
    return this.entries.length;
  }
}

export const matchmakingQueue = new MatchmakingQueue();
