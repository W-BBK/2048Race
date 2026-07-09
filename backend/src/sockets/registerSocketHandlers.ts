import type { Server, Socket } from "socket.io";
import { randomUUID } from "node:crypto";
import { matchmakingQueue } from "../matchmaking/queue.js";
import { matchManager } from "../match/matchManager.js";
import { playerStore } from "../players/playerStore.js";
import { generateGuestName } from "../players/guestNames.js";
import { isUsernameAllowed } from "../players/usernameFilter.js";
import { recordMatchResult } from "../db/statsRepo.js";
import { COUNTDOWN_MS, SOCKET_EVENTS } from "./events.js";
import { buildGameOverPayload, buildGameStartPayload } from "./payloads.js";
import type { GameOverReason, JoinQueuePayload, PlayerMovePayload } from "../types/index.js";
import type { Match, MatchPlayer } from "../match/Match.js";

const MAX_USERNAME_LENGTH = 20;

function sanitizeUsername(raw: string | undefined): string {
  const trimmed = (raw ?? "").trim().slice(0, MAX_USERNAME_LENGTH);
  if (trimmed.length === 0 || !isUsernameAllowed(trimmed)) return generateGuestName();
  return trimmed;
}

function finishMatchAndPersist(match: Match, reason: GameOverReason, winner: MatchPlayer | null): void {
  match.finish(reason, winner?.socketId ?? null);
  recordMatchResult(match);
  matchManager.remove(match.id);
}

function emitGameOver(io: Server, match: Match, reason: GameOverReason, winner: MatchPlayer | null): void {
  const [p1, p2] = match.players;
  io.to(p1.socketId).emit(SOCKET_EVENTS.GAME_OVER, buildGameOverPayload(match, reason, winner, p1, p2));
  io.to(p2.socketId).emit(SOCKET_EVENTS.GAME_OVER, buildGameOverPayload(match, reason, winner, p2, p1));
}

export function registerSocketHandlers(io: Server): void {
  io.on("connection", (socket: Socket) => {
    socket.on(SOCKET_EVENTS.JOIN_QUEUE, (payload: Partial<JoinQueuePayload>) => {
      const existingMatch = matchManager.findBySocketId(socket.id);
      if (existingMatch) return;

      const playerId = payload?.playerId && payload.playerId.length > 0 ? payload.playerId : randomUUID();
      const username = sanitizeUsername(payload?.username);
      const isGuest = !payload?.playerId;

      playerStore.register({ socketId: socket.id, playerId, username, isGuest });
      matchmakingQueue.join({ socketId: socket.id, playerId, username, isGuest });
      socket.emit(SOCKET_EVENTS.QUEUE_JOINED, { position: matchmakingQueue.size() });

      const pair = matchmakingQueue.tryMatch();
      if (!pair) return;

      const [a, b] = pair;
      const socketA = io.sockets.sockets.get(a.socketId);
      const socketB = io.sockets.sockets.get(b.socketId);
      if (!socketA || !socketB) {
        // one side vanished between queueing and pairing; requeue the survivor
        if (socketA) matchmakingQueue.join(a);
        if (socketB) matchmakingQueue.join(b);
        return;
      }

      const match = matchManager.create(
        { id: a.playerId, username: a.username, isGuest: a.isGuest, socketId: a.socketId },
        { id: b.playerId, username: b.username, isGuest: b.isGuest, socketId: b.socketId },
      );

      socketA.join(match.id);
      socketB.join(match.id);

      const [p1, p2] = match.players;
      io.to(p1.socketId).emit(SOCKET_EVENTS.MATCH_FOUND, {
        matchId: match.id,
        you: { id: p1.id, username: p1.username, isGuest: p1.isGuest },
        opponent: { id: p2.id, username: p2.username, isGuest: p2.isGuest },
        countdownMs: COUNTDOWN_MS,
      });
      io.to(p2.socketId).emit(SOCKET_EVENTS.MATCH_FOUND, {
        matchId: match.id,
        you: { id: p2.id, username: p2.username, isGuest: p2.isGuest },
        opponent: { id: p1.id, username: p1.username, isGuest: p1.isGuest },
        countdownMs: COUNTDOWN_MS,
      });

      setTimeout(() => {
        const liveMatch = matchManager.get(match.id);
        if (!liveMatch || liveMatch.status !== "countdown") return;
        const stillA = io.sockets.sockets.get(p1.socketId);
        const stillB = io.sockets.sockets.get(p2.socketId);
        if (!stillA || !stillB) {
          matchManager.remove(match.id);
          return;
        }
        liveMatch.activate();
        io.to(p1.socketId).emit(SOCKET_EVENTS.GAME_START, buildGameStartPayload(liveMatch, p1, p2));
        io.to(p2.socketId).emit(SOCKET_EVENTS.GAME_START, buildGameStartPayload(liveMatch, p2, p1));
      }, COUNTDOWN_MS);
    });

    socket.on(SOCKET_EVENTS.CANCEL_QUEUE, () => {
      matchmakingQueue.leave(socket.id);
    });

    socket.on(SOCKET_EVENTS.PLAYER_MOVE, (payload: Partial<PlayerMovePayload>) => {
      if (!payload?.matchId || !payload.direction) return;

      const match = matchManager.get(payload.matchId);
      if (!match || match.status !== "active" || !match.hasSocket(socket.id)) return;

      const result = match.applyMove(socket.id, payload.direction);
      if (!result) return;

      const opponent = match.getOpponentBySocket(socket.id);
      if (!opponent) return;

      if (result.won) {
        finishMatchAndPersist(match, "won", result.player);
        emitGameOver(io, match, "won", result.player);
        return;
      }

      if (match.bothStuck()) {
        const stuckWinner = match.stuckWinner();
        const reason = stuckWinner ? "stuck" : "draw";
        finishMatchAndPersist(match, reason, stuckWinner);
        emitGameOver(io, match, reason, stuckWinner);
        return;
      }

      io.to(result.player.socketId).emit(SOCKET_EVENTS.PLAYER_UPDATE, {
        matchId: match.id,
        board: result.player.state.board,
        score: result.player.state.score,
        moves: result.player.state.moves,
        highestTile: result.player.state.highestTile,
        moved: result.changed,
        stuck: result.player.state.stuck,
      });

      if (result.changed) {
        io.to(opponent.socketId).emit(SOCKET_EVENTS.OPPONENT_UPDATE, {
          matchId: match.id,
          board: result.player.state.board,
          score: result.player.state.score,
          moves: result.player.state.moves,
          highestTile: result.player.state.highestTile,
          stuck: result.player.state.stuck,
        });
      }
    });

    socket.on(SOCKET_EVENTS.LEAVE_MATCH, (payload: { matchId?: string }) => {
      if (!payload?.matchId) return;
      const match = matchManager.get(payload.matchId);
      if (!match || match.status === "finished" || !match.hasSocket(socket.id)) return;

      const opponent = match.getOpponentBySocket(socket.id);
      if (!opponent) return;

      finishMatchAndPersist(match, "forfeit", opponent);
      io.to(opponent.socketId).emit(
        SOCKET_EVENTS.GAME_OVER,
        buildGameOverPayload(match, "forfeit", opponent, opponent, match.getPlayerBySocket(socket.id)!),
      );
    });

    socket.on("disconnect", () => {
      matchmakingQueue.leave(socket.id);
      const match = matchManager.findBySocketId(socket.id);
      if (match && match.status !== "finished") {
        const opponent = match.getOpponentBySocket(socket.id);
        const leaver = match.getPlayerBySocket(socket.id);
        if (opponent && leaver) {
          finishMatchAndPersist(match, "forfeit", opponent);
          io.to(opponent.socketId).emit(
            SOCKET_EVENTS.GAME_OVER,
            buildGameOverPayload(match, "forfeit", opponent, opponent, leaver),
          );
        } else {
          matchManager.remove(match.id);
        }
      }
      playerStore.remove(socket.id);
    });
  });
}
