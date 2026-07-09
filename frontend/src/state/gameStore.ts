import { create } from "zustand";
import { ensureConnected, socket, SOCKET_EVENTS } from "../socket/socket";
import { getPlayerId, saveUsername } from "../lib/identity";
import type {
  Board,
  Direction,
  GameOverPayload,
  GameStartPayload,
  MatchFoundPayload,
  OpponentUpdatePayload,
  PlayerUpdatePayload,
  PublicPlayer,
  Screen,
} from "../types";

interface SideState {
  board: Board;
  score: number;
  moves: number;
  highestTile: number;
  stuck: boolean;
}

const emptyBoard = (): Board => Array.from({ length: 4 }, () => Array(4).fill(0));

const emptySide = (): SideState => ({
  board: emptyBoard(),
  score: 0,
  moves: 0,
  highestTile: 0,
  stuck: false,
});

interface GameStore {
  screen: Screen;
  connected: boolean;
  matchId: string | null;
  you: PublicPlayer | null;
  opponent: PublicPlayer | null;
  countdownMs: number;
  startedAt: number | null;
  yourState: SideState;
  opponentState: SideState;
  gameOver: GameOverPayload | null;
  invalidMoveAt: number;

  findMatch: (username: string) => void;
  cancelQueue: () => void;
  sendMove: (direction: Direction) => void;
  leaveMatch: () => void;
  returnHome: () => void;
}

let listenersBound = false;

export const useGameStore = create<GameStore>((set, get) => {
  const bindListeners = () => {
    if (listenersBound) return;
    listenersBound = true;

    socket.on("connect", () => set({ connected: true }));
    socket.on("disconnect", () => {
      const { screen } = get();
      // if we lose connection mid-flow, fall back home
      set({ connected: false });
      if (screen === "matchmaking" || screen === "countdown" || screen === "game") {
        set({ screen: "home", matchId: null });
      }
    });

    socket.on(SOCKET_EVENTS.MATCH_FOUND, (payload: MatchFoundPayload) => {
      set({
        screen: "countdown",
        matchId: payload.matchId,
        you: payload.you,
        opponent: payload.opponent,
        countdownMs: payload.countdownMs,
        yourState: emptySide(),
        opponentState: emptySide(),
        gameOver: null,
      });
    });

    socket.on(SOCKET_EVENTS.GAME_START, (payload: GameStartPayload) => {
      set({
        screen: "game",
        matchId: payload.matchId,
        startedAt: payload.startedAt,
        yourState: {
          board: payload.board,
          score: payload.score,
          moves: payload.moves,
          highestTile: payload.highestTile,
          stuck: false,
        },
        opponentState: {
          board: payload.opponentBoard,
          score: payload.opponentScore,
          moves: payload.opponentMoves,
          highestTile: payload.opponentHighestTile,
          stuck: false,
        },
      });
    });

    socket.on(SOCKET_EVENTS.PLAYER_UPDATE, (payload: PlayerUpdatePayload) => {
      if (payload.matchId !== get().matchId) return;
      if (!payload.moved) {
        set({ invalidMoveAt: Date.now() });
        return;
      }
      set({
        yourState: {
          board: payload.board,
          score: payload.score,
          moves: payload.moves,
          highestTile: payload.highestTile,
          stuck: payload.stuck,
        },
      });
    });

    socket.on(SOCKET_EVENTS.OPPONENT_UPDATE, (payload: OpponentUpdatePayload) => {
      if (payload.matchId !== get().matchId) return;
      set({
        opponentState: {
          board: payload.board,
          score: payload.score,
          moves: payload.moves,
          highestTile: payload.highestTile,
          stuck: payload.stuck,
        },
      });
    });

    socket.on(SOCKET_EVENTS.GAME_OVER, (payload: GameOverPayload) => {
      if (payload.matchId !== get().matchId) return;
      set({
        screen: "gameover",
        gameOver: payload,
        yourState: {
          board: payload.you.board,
          score: payload.you.score,
          moves: payload.you.moves,
          highestTile: payload.you.highestTile,
          stuck: false,
        },
        opponentState: {
          board: payload.opponent.board,
          score: payload.opponent.score,
          moves: payload.opponent.moves,
          highestTile: payload.opponent.highestTile,
          stuck: false,
        },
      });
    });
  };

  return {
    screen: "home",
    connected: false,
    matchId: null,
    you: null,
    opponent: null,
    countdownMs: 3000,
    startedAt: null,
    yourState: emptySide(),
    opponentState: emptySide(),
    gameOver: null,
    invalidMoveAt: 0,

    findMatch: (username: string) => {
      bindListeners();
      ensureConnected();
      saveUsername(username);
      socket.emit(SOCKET_EVENTS.JOIN_QUEUE, {
        playerId: getPlayerId(),
        username,
      });
      set({ screen: "matchmaking", gameOver: null });
    },

    cancelQueue: () => {
      socket.emit(SOCKET_EVENTS.CANCEL_QUEUE);
      set({ screen: "home" });
    },

    sendMove: (direction: Direction) => {
      const { matchId, screen, yourState } = get();
      if (!matchId || screen !== "game" || yourState.stuck) return;
      socket.emit(SOCKET_EVENTS.PLAYER_MOVE, { matchId, direction });
    },

    leaveMatch: () => {
      const { matchId } = get();
      if (matchId) socket.emit(SOCKET_EVENTS.LEAVE_MATCH, { matchId });
      set({ screen: "home", matchId: null });
    },

    returnHome: () => {
      set({
        screen: "home",
        matchId: null,
        gameOver: null,
        yourState: emptySide(),
        opponentState: emptySide(),
      });
    },
  };
});
