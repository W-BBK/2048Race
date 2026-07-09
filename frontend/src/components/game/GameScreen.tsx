import { useEffect, useState } from "react";
import { useGameStore } from "../../state/gameStore";
import { useGameControls } from "../../hooks/useGameControls";
import Board from "./Board";
import PlayerPanel from "./PlayerPanel";

function formatTimer(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function GameScreen() {
  const you = useGameStore((s) => s.you);
  const opponent = useGameStore((s) => s.opponent);
  const yourState = useGameStore((s) => s.yourState);
  const opponentState = useGameStore((s) => s.opponentState);
  const startedAt = useGameStore((s) => s.startedAt);
  const invalidMoveAt = useGameStore((s) => s.invalidMoveAt);
  const sendMove = useGameStore((s) => s.sendMove);
  const leaveMatch = useGameStore((s) => s.leaveMatch);

  useGameControls(true, sendMove);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const [shake, setShake] = useState(false);
  useEffect(() => {
    if (!invalidMoveAt) return;
    setShake(true);
    const t = setTimeout(() => setShake(false), 320);
    return () => clearTimeout(t);
  }, [invalidMoveAt]);

  const youLead =
    yourState.highestTile > opponentState.highestTile ||
    (yourState.highestTile === opponentState.highestTile && yourState.score > opponentState.score);
  const opponentLead =
    opponentState.highestTile > yourState.highestTile ||
    (opponentState.highestTile === yourState.highestTile && opponentState.score > yourState.score);

  const status = yourState.stuck
    ? "No moves left — if your opponent locks up too, most moves wins!"
    : youLead
      ? "You're in the lead!"
      : opponentLead
        ? `${opponent?.username ?? "Opponent"} is ahead — push harder!`
        : "Neck and neck!";

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-black tracking-tight">
          <span className="text-slate-100">2048</span>
          <span className="bg-gradient-to-r from-accent to-accent-hot bg-clip-text text-transparent">Race</span>
        </h1>
        <div className="rounded-xl border border-white/10 bg-bg-panel px-4 py-1.5 font-mono text-lg font-bold tabular-nums text-slate-100">
          {formatTimer(startedAt ? now - startedAt : 0)}
        </div>
        <button
          onClick={leaveMatch}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:border-accent-hot/50 hover:text-white"
        >
          Forfeit
        </button>
      </header>

      <div className="text-center text-sm font-semibold text-slate-400">{status}</div>

      <div className="grid flex-1 grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex flex-col gap-3">
          <PlayerPanel
            label="You"
            username={you?.username ?? "You"}
            score={yourState.score}
            highestTile={yourState.highestTile}
            moves={yourState.moves}
            accentClass="text-accent-cool"
            leading={youLead}
          />
          <div className="mx-auto w-full max-w-md touch-none">
            <Board board={yourState.board} shake={shake} dimmed={yourState.stuck} />
          </div>
        </div>

        <div className="hidden select-none flex-col items-center justify-center self-center px-2 lg:flex">
          <div className="text-4xl font-black text-accent-hot">VS</div>
        </div>

        <div className="flex flex-col gap-3">
          <PlayerPanel
            label="Opponent"
            username={opponent?.username ?? "Opponent"}
            score={opponentState.score}
            highestTile={opponentState.highestTile}
            moves={opponentState.moves}
            accentClass="text-accent-hot"
            leading={opponentLead}
          />
          <div className="mx-auto w-full max-w-md lg:max-w-sm">
            <Board board={opponentState.board} compact dimmed={opponentState.stuck} />
          </div>
        </div>
      </div>

      <footer className="pb-2 text-center text-xs text-slate-600">
        Arrow keys · WASD · Swipe
      </footer>
    </div>
  );
}
