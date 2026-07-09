import { useEffect, useState } from "react";
import { useGameStore } from "../../state/gameStore";
import { getPlayerId, getSavedUsername } from "../../lib/identity";
import { isUsernameAllowed } from "../../lib/usernameFilter";
import type { PlayerStats } from "../../types";

function formatDuration(ms: number | null): string {
  if (ms === null) return "—";
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function HomeScreen() {
  const findMatch = useGameStore((s) => s.findMatch);
  const [username, setUsername] = useState(getSavedUsername());
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<PlayerStats[]>([]);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/stats/${getPlayerId()}`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
    fetch("/api/leaderboard?limit=5")
      .then((r) => r.json())
      .then((d) => setLeaderboard(d.leaderboard ?? []))
      .catch(() => {});
  }, []);

  const handlePlay = () => {
    if (!isUsernameAllowed(username)) {
      setNameError("That name isn't allowed — pick something else.");
      return;
    }
    setNameError(null);
    findMatch(username);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-8 px-4 py-10">
      <header className="text-center">
        <h1 className="text-glow text-5xl font-black tracking-tight sm:text-6xl">
          <span className="text-slate-100">2048</span>
          <span className="bg-gradient-to-r from-accent to-accent-hot bg-clip-text text-transparent">Race</span>
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          Race a live opponent. First to build the <span className="font-bold text-accent">2048</span> tile wins.
        </p>
      </header>

      <div className="panel w-full max-w-sm p-6">
        <label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Username <span className="normal-case text-slate-600">(blank = guest)</span>
        </label>
        <input
          id="username"
          value={username}
          maxLength={20}
          onChange={(e) => {
            setUsername(e.target.value);
            setNameError(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && handlePlay()}
          placeholder="Enter a name…"
          className={`mt-2 w-full rounded-xl border bg-bg-soft px-4 py-3 text-slate-100 outline-none transition focus:ring-2 ${
            nameError
              ? "border-rose-500/70 focus:border-rose-500 focus:ring-rose-500/30"
              : "border-white/10 focus:border-accent/60 focus:ring-accent/30"
          }`}
        />
        {nameError && <p className="mt-2 text-sm text-rose-400">{nameError}</p>}
        <button
          onClick={handlePlay}
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-accent to-accent-hot px-6 py-3.5 text-lg font-bold text-white shadow-lg shadow-accent/25 transition hover:brightness-110 active:scale-[0.98]"
        >
          Find Match
        </button>
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-2">
        <section className="panel p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-accent-cool">How to play</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>• Click <span className="text-slate-200">Find Match</span> to queue against a live opponent.</li>
            <li>• Slide tiles with <span className="text-slate-200">arrow keys</span>, <span className="text-slate-200">WASD</span> or <span className="text-slate-200">swipes</span>.</li>
            <li>• Equal tiles merge and grow your score.</li>
            <li>• First player to create a <span className="font-semibold text-accent">2048 tile</span> wins instantly.</li>
            <li>• If both boards lock up, whoever survived <span className="text-slate-200">more moves</span> wins.</li>
          </ul>
        </section>

        <section className="panel p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-accent-cool">Your stats</h2>
          {stats && stats.gamesPlayed > 0 ? (
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-white/[0.04] p-2">
                <div className="text-[10px] uppercase text-slate-500">Wins</div>
                <div className="font-bold text-emerald-400">{stats.wins}</div>
              </div>
              <div className="rounded-lg bg-white/[0.04] p-2">
                <div className="text-[10px] uppercase text-slate-500">Losses</div>
                <div className="font-bold text-rose-400">{stats.losses}</div>
              </div>
              <div className="rounded-lg bg-white/[0.04] p-2">
                <div className="text-[10px] uppercase text-slate-500">Win rate</div>
                <div className="font-bold">{Math.round(stats.winRate * 100)}%</div>
              </div>
              <div className="rounded-lg bg-white/[0.04] p-2">
                <div className="text-[10px] uppercase text-slate-500">Fastest win</div>
                <div className="font-bold">{formatDuration(stats.fastestWinMs)}</div>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No matches yet — play your first race!</p>
          )}
        </section>
      </div>

      {leaderboard.length > 0 && (
        <section className="panel w-full p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-accent-cool">Top racers</h2>
          <ol className="mt-3 space-y-1.5 text-sm">
            {leaderboard.map((p, i) => (
              <li key={p.playerId} className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-1.5">
                <span className="truncate">
                  <span className="mr-2 font-bold text-slate-500">#{i + 1}</span>
                  {p.username}
                </span>
                <span className="shrink-0 tabular-nums text-slate-400">
                  {p.wins}W · {p.losses}L
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
