import { describe, expect, it } from "vitest";
import {
  addRandomTile,
  checkWinner,
  createBoard,
  createEmptyBoard,
  hasMovesAvailable,
  highestTile,
  move,
} from "./engine.js";
import type { Board } from "../types/index.js";

describe("createBoard", () => {
  it("creates a 4x4 board with exactly two tiles", () => {
    const board = createBoard();
    expect(board.length).toBe(4);
    expect(board.every((row) => row.length === 4)).toBe(true);
    const filled = board.flat().filter((v) => v !== 0);
    expect(filled.length).toBe(2);
    filled.forEach((v) => expect([2, 4]).toContain(v));
  });
});

describe("addRandomTile", () => {
  it("adds one tile to an empty board", () => {
    const board = createEmptyBoard();
    const next = addRandomTile(board);
    expect(next.flat().filter((v) => v !== 0).length).toBe(1);
  });

  it("does nothing when the board is full", () => {
    const full: Board = Array.from({ length: 4 }, () => [2, 2, 2, 2]);
    const next = addRandomTile(full);
    expect(next).toEqual(full);
  });
});

describe("move", () => {
  it("slides tiles left and merges equal adjacent pairs once", () => {
    const board: Board = [
      [2, 2, 4, 4],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = move(board, "left");
    expect(result.board[0]).toEqual([4, 8, 0, 0]);
    expect(result.moved).toBe(true);
    expect(result.gained).toBe(12);
  });

  it("does not double-merge a triple (2,2,2 -> 4,2 not 4,4)", () => {
    const board: Board = [
      [2, 2, 2, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = move(board, "left");
    expect(result.board[0]).toEqual([4, 2, 0, 0]);
  });

  it("slides right correctly", () => {
    const board: Board = [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = move(board, "right");
    expect(result.board[0]).toEqual([0, 0, 0, 4]);
  });

  it("slides up and down correctly through columns", () => {
    const board: Board = [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [4, 0, 0, 0],
    ];
    const up = move(board, "up");
    expect(up.board.map((r) => r[0])).toEqual([4, 4, 0, 0]);

    const down = move(board, "down");
    expect(down.board.map((r) => r[0])).toEqual([0, 0, 4, 4]);
  });

  it("reports moved:false when nothing changes", () => {
    const board: Board = [
      [2, 4, 8, 16],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const result = move(board, "left");
    expect(result.moved).toBe(false);
    expect(result.gained).toBe(0);
  });

  it("never mutates the input board", () => {
    const board: Board = [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const snapshot = JSON.stringify(board);
    move(board, "left");
    expect(JSON.stringify(board)).toBe(snapshot);
  });
});

describe("checkWinner", () => {
  it("detects a 2048 tile", () => {
    const board = createEmptyBoard();
    board[0][0] = 2048;
    expect(checkWinner(board)).toBe(true);
  });

  it("returns false without a winning tile", () => {
    expect(checkWinner(createBoard())).toBe(false);
  });
});

describe("highestTile", () => {
  it("finds the max value on the board", () => {
    const board = createEmptyBoard();
    board[1][2] = 64;
    board[3][3] = 32;
    expect(highestTile(board)).toBe(64);
  });
});

describe("hasMovesAvailable", () => {
  it("is true when empty cells exist", () => {
    expect(hasMovesAvailable(createEmptyBoard())).toBe(true);
  });

  it("is true when adjacent equal tiles exist even with no empty cells", () => {
    const board: Board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 4],
    ];
    expect(hasMovesAvailable(board)).toBe(true);
  });

  it("is false on a full board with no adjacent equal tiles", () => {
    const board: Board = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];
    expect(hasMovesAvailable(board)).toBe(false);
  });
});
