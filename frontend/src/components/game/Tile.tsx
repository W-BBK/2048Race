import { useEffect, useRef, useState } from "react";

const TILE_STYLES: Record<number, string> = {
  2: "bg-slate-700 text-slate-100",
  4: "bg-slate-600 text-slate-100",
  8: "bg-orange-500/90 text-white",
  16: "bg-orange-600/90 text-white",
  32: "bg-rose-500/90 text-white",
  64: "bg-rose-600 text-white",
  128: "bg-amber-400 text-slate-900 shadow-[0_0_18px_rgba(251,191,36,0.35)]",
  256: "bg-amber-400 text-slate-900 shadow-[0_0_22px_rgba(251,191,36,0.45)]",
  512: "bg-yellow-400 text-slate-900 shadow-[0_0_26px_rgba(250,204,21,0.55)]",
  1024: "bg-accent text-white shadow-[0_0_30px_rgba(124,92,255,0.65)]",
  2048: "bg-gradient-to-br from-accent to-accent-hot text-white shadow-[0_0_36px_rgba(255,92,124,0.8)]",
};

function fontSize(value: number, compact: boolean): string {
  const digits = String(value).length;
  if (compact) return digits >= 4 ? "text-xs" : digits === 3 ? "text-sm" : "text-base";
  return digits >= 4 ? "text-lg" : digits === 3 ? "text-xl" : "text-2xl";
}

interface TileProps {
  value: number;
  compact?: boolean;
}

export default function Tile({ value, compact = false }: TileProps) {
  const prev = useRef(value);
  const [anim, setAnim] = useState("");

  useEffect(() => {
    if (value !== prev.current) {
      if (value !== 0) {
        setAnim(prev.current === 0 ? "animate-pop-in" : "animate-merge-pop");
        const t = setTimeout(() => setAnim(""), 180);
        prev.current = value;
        return () => clearTimeout(t);
      }
      prev.current = value;
    }
  }, [value]);

  if (value === 0) {
    return <div className="aspect-square rounded-lg bg-white/[0.04]" />;
  }

  return (
    <div
      className={`flex aspect-square items-center justify-center rounded-lg font-extrabold ${fontSize(value, compact)} ${
        TILE_STYLES[value] ?? "bg-fuchsia-500 text-white"
      } ${anim}`}
    >
      {value}
    </div>
  );
}
