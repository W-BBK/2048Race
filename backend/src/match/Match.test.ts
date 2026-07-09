import { describe, expect, it } from "vitest";
import { Match } from "./Match.js";

function makeMatch(): Match {
  return new Match(
    { id: "player-a", username: "A", isGuest: true, socketId: "sock-a" },
    { id: "player-b", username: "B", isGuest: true, socketId: "sock-b" },
  );
}

describe("stuckWinner", () => {
  it("awards the win to the player with more moves", () => {
    const match = makeMatch();
    match.players[0].state.moves = 42;
    match.players[1].state.moves = 37;
    expect(match.stuckWinner()?.socketId).toBe("sock-a");

    match.players[1].state.moves = 50;
    expect(match.stuckWinner()?.socketId).toBe("sock-b");
  });

  it("is a draw only when both got stuck on the same move count", () => {
    const match = makeMatch();
    match.players[0].state.moves = 42;
    match.players[1].state.moves = 42;
    expect(match.stuckWinner()).toBeNull();
  });
});

describe("socket-keyed identity", () => {
  it("distinguishes players sharing one playerId by socket", () => {
    const match = new Match(
      { id: "shared", username: "TabA", isGuest: true, socketId: "sock-1" },
      { id: "shared", username: "TabB", isGuest: true, socketId: "sock-2" },
    );
    expect(match.getPlayerBySocket("sock-1")?.username).toBe("TabA");
    expect(match.getOpponentBySocket("sock-1")?.username).toBe("TabB");
  });
});
