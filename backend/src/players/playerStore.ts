export interface ConnectedPlayer {
  socketId: string;
  playerId: string;
  username: string;
  isGuest: boolean;
}

/** Tracks the connected-player identity behind each live socket. */
class PlayerStore {
  private bySocketId = new Map<string, ConnectedPlayer>();

  register(player: ConnectedPlayer): void {
    this.bySocketId.set(player.socketId, player);
  }

  get(socketId: string): ConnectedPlayer | undefined {
    return this.bySocketId.get(socketId);
  }

  remove(socketId: string): void {
    this.bySocketId.delete(socketId);
  }
}

export const playerStore = new PlayerStore();
