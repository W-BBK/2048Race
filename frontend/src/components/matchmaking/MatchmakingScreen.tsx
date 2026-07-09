import { useGameStore } from "../../state/gameStore";

export default function MatchmakingScreen() {
  const cancelQueue = useGameStore((s) => s.cancelQueue);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-white/10 border-t-accent" />
        <div
          className="absolute inset-3 animate-spin rounded-full border-4 border-white/10 border-b-accent-hot"
          style={{ animationDirection: "reverse", animationDuration: "1.4s" }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-accent">VS</div>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-100">Searching for opponent…</h2>
        <p className="mt-2 text-sm text-slate-500">You'll be racing the moment another player queues up.</p>
      </div>

      <button
        onClick={cancelQueue}
        className="rounded-xl border border-white/10 bg-bg-panel px-8 py-3 font-semibold text-slate-300 transition hover:border-accent-hot/50 hover:text-white"
      >
        Cancel
      </button>
    </div>
  );
}
