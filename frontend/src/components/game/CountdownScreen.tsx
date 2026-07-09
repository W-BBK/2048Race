import { useEffect, useState } from "react";
import { useGameStore } from "../../state/gameStore";

export default function CountdownScreen() {
  const you = useGameStore((s) => s.you);
  const opponent = useGameStore((s) => s.opponent);
  const countdownMs = useGameStore((s) => s.countdownMs);
  const [count, setCount] = useState(Math.ceil(countdownMs / 1000));

  useEffect(() => {
    if (count <= 0) return;
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-4">
      <div className="flex items-center gap-6 text-center sm:gap-12">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-accent-cool">You</div>
          <div className="max-w-[10rem] truncate text-xl font-bold text-slate-100">{you?.username}</div>
        </div>
        <div className="text-3xl font-black text-accent-hot">VS</div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-accent-hot">Opponent</div>
          <div className="max-w-[10rem] truncate text-xl font-bold text-slate-100">{opponent?.username}</div>
        </div>
      </div>

      <div
        key={count}
        className="text-glow animate-count-pulse text-8xl font-black text-slate-100"
      >
        {count > 0 ? count : "GO!"}
      </div>

      <p className="text-sm text-slate-500">First to build a 2048 tile wins the race.</p>
    </div>
  );
}
