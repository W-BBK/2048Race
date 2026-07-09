import { useEffect, useState } from "react";
import { useGameStore } from "../../state/gameStore";
import Board from "./Board";

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => i);
  const colors = ["#7c5cff", "#ff5c7c", "#5cc8ff", "#fbbf24", "#34d399"];
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {pieces.map((i) => (
        <div
          key={i}
          className="absolute top-[-10px] h-2.5 w-2.5 rounded-sm"
          style={{
            left: `${(i * 97) % 100}%`,
            backgroundColor: colors[i % colors.length],
            animation: `confetti-fall ${2.2 + (i % 5) * 0.4}s linear ${(i % 10) * 0.15}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

function formatDuration(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function GameOverScreen() {
  const gameOver = useGameStore((s) => s.gameOver);
  const you = useGameStore((s) => s.you);
  const opponent = useGameStore((s) => s.opponent);
  const returnHome = useGameStore((s) => s.returnHome);
  const findMatch = useGameStore((s) => s.findMatch);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (!gameOver) return null;

  const won = gameOver.you.won;
  const draw = gameOver.winnerId === null;

  const headline = draw ? "DRAW" : won ? "VICTORY!" : "DEFEAT";
  const headlineClass = draw
    ? "text-slate-300"
    : won
      ? "bg-gradient-to-r from-amber-300 via-accent to-accent-hot bg-clip-text text-transparent"
      : "text-slate-500";

  const subline = draw
    ? "Both boards locked up on the same move count. Dead even."
    : gameOver.reason === "forfeit"
      ? won
        ? "Your opponent left the match."
        : "You forfeited the match."
      : gameOver.reason === "stuck"
        ? won
          ? `Both boards locked up — you outlasted them ${gameOver.you.moves} moves to ${gameOver.opponent.moves}.`
          : `Both boards locked up — they outlasted you ${gameOver.opponent.moves} moves to ${gameOver.you.moves}.`
        : won
          ? `You built the 2048 tile in ${formatDuration(gameOver.durationMs)}!`
          : `${gameOver.winnerUsername ?? "Your opponent"} reached 2048 first.`;

  return (
    <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-8 px-4 py-10">
      {won && <Confetti />}

      <div
        className={`text-center transition-all duration-700 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        <h1 className={`text-glow text-6xl font-black tracking-tight sm:text-7xl ${headlineClass}`}>{headline}</h1>
        <p className="mt-3 text-slate-400">{subline}</p>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
        <div className={`panel p-4 ${won ? "ring-2 ring-accent/60" : ""}`}>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm font-bold text-slate-100">{you?.username ?? "You"}</span>
            <span className="text-xs text-slate-500">
              {gameOver.you.score.toLocaleString()} pts · {gameOver.you.moves} moves
            </span>
          </div>
          <Board board={gameOver.you.board} compact dimmed={!won && !draw} />
        </div>
        <div className={`panel p-4 ${gameOver.opponent.won ? "ring-2 ring-accent-hot/60" : ""}`}>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm font-bold text-slate-100">{opponent?.username ?? "Opponent"}</span>
            <span className="text-xs text-slate-500">
              {gameOver.opponent.score.toLocaleString()} pts · {gameOver.opponent.moves} moves
            </span>
          </div>
          <Board board={gameOver.opponent.board} compact dimmed={!gameOver.opponent.won && !draw} />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => findMatch(you?.username ?? "")}
          className="rounded-xl bg-gradient-to-r from-accent to-accent-hot px-8 py-3 font-bold text-white shadow-lg shadow-accent/25 transition hover:brightness-110 active:scale-[0.98]"
        >
          Race Again
        </button>
        <button
          onClick={returnHome}
          className="rounded-xl border border-white/10 bg-bg-panel px-8 py-3 font-semibold text-slate-300 transition hover:text-white"
        >
          Home
        </button>
      </div>
    </div>
  );
}
