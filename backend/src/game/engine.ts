import type { Board, Direction } from "../types/index.js";

export const BOARD_SIZE = 4;
// WIN_TILE env override lets tests and demos end matches at a lower tile.
export const WIN_TILE = Number(process.env.WIN_TILE) || 2048;

export function createEmptyBoard(size: number = BOARD_SIZE): Board {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function getEmptyCells(board: Board): Array<[number, number]> {
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      if (board[r][c] === 0) cells.push([r, c]);
    }
  }
  return cells;
}

/** Adds a single random tile (90% -> 2, 10% -> 4) to a random empty cell. */
export function addRandomTile(board: Board): Board {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const next = cloneBoard(board);
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

/** Creates a fresh board with the standard two starting tiles. */
export function createBoard(size: number = BOARD_SIZE): Board {
  let board = createEmptyBoard(size);
  board = addRandomTile(board);
  board = addRandomTile(board);
  return board;
}

function transpose(board: Board): Board {
  const size = board.length;
  const next = createEmptyBoard(size);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      next[c][r] = board[r][c];
    }
  }
  return next;
}

function reverseRows(board: Board): Board {
  return board.map((row) => [...row].reverse());
}

interface SlideResult {
  row: number[];
  gained: number;
  moved: boolean;
}

/** Slides and merges a single row to the left. Each tile merges at most once per move. */
function slideRowLeft(row: number[]): SlideResult {
  const size = row.length;
  const values = row.filter((v) => v !== 0);
  const result: number[] = [];
  let gained = 0;

  for (let i = 0; i < values.length; i++) {
    if (i < values.length - 1 && values[i] === values[i + 1]) {
      const merged = values[i] * 2;
      result.push(merged);
      gained += merged;
      i++;
    } else {
      result.push(values[i]);
    }
  }

  while (result.length < size) result.push(0);

  const moved = row.some((v, idx) => v !== result[idx]);
  return { row: result, gained, moved };
}

export interface MoveResult {
  board: Board;
  moved: boolean;
  gained: number;
}

/** Applies a directional move to the board. Does not spawn a new tile. */
export function move(board: Board, direction: Direction): MoveResult {
  let working = cloneBoard(board);
  const transposed = direction === "up" || direction === "down";
  const reversed = direction === "right" || direction === "down";

  if (transposed) working = transpose(working);
  if (reversed) working = reverseRows(working);

  let moved = false;
  let gained = 0;
  const slid = working.map((row) => {
    const res = slideRowLeft(row);
    if (res.moved) moved = true;
    gained += res.gained;
    return res.row;
  });

  let result: Board = slid;
  if (reversed) result = reverseRows(result);
  if (transposed) result = transpose(result);

  return { board: result, moved, gained };
}

export function highestTile(board: Board): number {
  let max = 0;
  for (const row of board) {
    for (const v of row) {
      if (v > max) max = v;
    }
  }
  return max;
}

export function checkWinner(board: Board, target: number = WIN_TILE): boolean {
  return highestTile(board) >= target;
}

/** True if at least one legal move remains (empty cell or adjacent equal tiles). */
export function hasMovesAvailable(board: Board): boolean {
  const size = board.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const v = board[r][c];
      if (v === 0) return true;
      if (c + 1 < size && board[r][c + 1] === v) return true;
      if (r + 1 < size && board[r + 1][c] === v) return true;
    }
  }
  return false;
}

/** Sum of all tile values currently on the board — a secondary board-value metric. */
export function calculateScore(board: Board): number {
  return board.reduce((sum, row) => sum + row.reduce((s, v) => s + v, 0), 0);
}
