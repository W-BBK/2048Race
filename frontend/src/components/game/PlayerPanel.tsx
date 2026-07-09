interface PlayerPanelProps {
  label: string;
  username: string;
  score: number;
  highestTile: number;
  moves: number;
  accentClass: string;
  leading: boolean;
}

export default function PlayerPanel({ label, username, score, highestTile, moves, accentClass, leading }: PlayerPanelProps) {
  return (
    <div className="panel px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className={`text-[10px] font-bold uppercase tracking-widest ${accentClass}`}>{label}</div>
          <div className="truncate text-sm font-semibold text-slate-100">{username}</div>
        </div>
        {leading && (
          <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
            Leading
          </span>
        )}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-white/[0.04] px-1 py-1.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Score</div>
          <div className="text-sm font-bold tabular-nums">{score.toLocaleString()}</div>
        </div>
        <div className="rounded-lg bg-white/[0.04] px-1 py-1.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Best tile</div>
          <div className="text-sm font-bold tabular-nums">{highestTile || "—"}</div>
        </div>
        <div className="rounded-lg bg-white/[0.04] px-1 py-1.5">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">Moves</div>
          <div className="text-sm font-bold tabular-nums">{moves}</div>
        </div>
      </div>
    </div>
  );
}
