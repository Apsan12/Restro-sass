"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: string; // e.g. "+12%" (green) or "-5%" (red)
  tone?: "dark" | "light"; // dark = ember background (default), light = warm white
}

// Tailwind needs full class names, so each tone is written out here once.
const TONES = {
  dark: {
    card: "border-white/10 bg-gradient-to-br from-[#2b1409] via-[#1c120c] to-[#3a1708] text-white shadow-orange-900/10",
    title: "text-white/60",
    description: "text-white/45",
    glow: "bg-orange-500/30",
    dots: "[background-image:radial-gradient(rgba(255,180,100,0.13)_1px,transparent_1px)]",
    up: "bg-emerald-400/15 text-emerald-300",
    down: "bg-red-400/15 text-red-300",
  },
  light: {
    card: "border-stone-200 bg-white text-stone-900 shadow-stone-900/5",
    title: "text-stone-500",
    description: "text-stone-400",
    glow: "bg-orange-300/40",
    dots: "[background-image:radial-gradient(rgba(120,70,20,0.12)_1px,transparent_1px)]",
    up: "bg-emerald-50 text-emerald-700",
    down: "bg-red-50 text-red-600",
  },
};

/** Counts the number inside a value up from 0, e.g. "Rs. 24,850" or "08". Text without a number is shown as is. */
function AnimatedValue({ value }: { value: string }) {
  const match = value.match(/^(\D*)([\d,]+)(.*)$/); // [prefix, digits, suffix]
  const target = match ? Number(match[2].replace(/,/g, "")) : 0;
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!match || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setN(target);
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1400, 1);
      setN(Math.round(target * (1 - (1 - p) ** 3))); // ease out
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!match) return <>{value}</>;
  const digits = match[2];
  const text = digits.includes(",") ? n.toLocaleString() : String(n).padStart(digits.length, "0"); // keeps "08" as "08"
  return <>{match[1]}{text}{match[3]}</>;
}

export default function StatCard({ title, value, description, icon: Icon, trend, tone = "dark" }: StatCardProps) {
  const t = TONES[tone];
  const isDown = trend?.trim().startsWith("-");

  return (
    <div className={`group relative isolate overflow-hidden rounded-2xl border p-5 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl ${t.card}`}>
      {/* Background: a warm glow in the corner and a faint dot texture */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className={`absolute -right-10 -top-10 size-36 rounded-full opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-100 ${t.glow}`} />
        <div className={`absolute inset-0 [background-size:18px_18px] [mask-image:linear-gradient(to_bottom_left,black,transparent_65%)] ${t.dots}`} />
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-sm font-medium ${t.title}`}>{title}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight tabular-nums sm:text-3xl"><AnimatedValue value={value} /></p>
        </div>

        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
          <Icon className="size-5" />
        </div>
      </div>

      {(description || trend) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {trend && <span className={`rounded-full px-2 py-0.5 font-semibold ${isDown ? t.down : t.up}`}>{trend}</span>}
          {description && <span className={t.description}>{description}</span>}
        </div>
      )}
    </div>
  );
}
