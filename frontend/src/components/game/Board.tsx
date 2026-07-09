import Tile from "./Tile";
import type { Board as BoardType } from "../../types";

interface BoardProps {
  board: BoardType;
  compact?: boolean;
  shake?: boolean;
  dimmed?: boolean;
}

export default function Board({ board, compact = false, shake = false, dimmed = false }: BoardProps) {
  return (
    <div
      className={`grid grid-cols-4 rounded-xl border border-white/5 bg-bg-soft ${
        compact ? "gap-1.5 p-1.5" : "gap-2 p-2"
      } ${shake ? "animate-shake" : ""} ${dimmed ? "opacity-60 saturate-50" : ""}`}
    >
      {board.map((row, r) => row.map((value, c) => <Tile key={`${r}-${c}`} value={value} compact={compact} />))}
    </div>
  );
}
