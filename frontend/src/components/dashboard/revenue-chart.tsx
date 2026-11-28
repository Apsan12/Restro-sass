"use client";

import { Area, AreaChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";

const data = [
  { day: "Mon", revenue: 4200 },
  { day: "Tue", revenue: 5800 },
  { day: "Wed", revenue: 4900 },
  { day: "Thu", revenue: 7200 },
  { day: "Fri", revenue: 8600 },
  { day: "Sat", revenue: 9400 },
  { day: "Sun", revenue: 7800 },
];

const money = (n: number) => `Rs. ${Math.round(n).toLocaleString()}`;

// Numbers shown above the chart are calculated from the data, so they always match it.
const total = data.reduce((sum, d) => sum + d.revenue, 0);
const best = data.reduce((a, b) => (b.revenue > a.revenue ? b : a));
const stats = [
  { label: "Total", value: money(total) },
  { label: "Daily average", value: money(total / data.length) },
  { label: "Best day", value: `${best.day} · ${money(best.revenue)}` },
];

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-white px-3.5 py-2.5 shadow-xl shadow-black/30">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="text-sm font-semibold text-stone-900">{money(payload[0].value)}</p>
    </div>
  );
}

export default function RevenueChart() {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-[#2b1409] via-[#1c120c] to-[#3a1708] p-5 text-white shadow-xl shadow-orange-900/10 sm:p-6">
      <style>{`
        @keyframes rs-glow { 50% { transform: translate(-24px, 20px); opacity: .85 } }
        .rs-glow { animation: rs-glow 14s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) { .rs-glow { animation: none } }
      `}</style>

      {/* Background: same ember family as Quick Actions, lights on the opposite corners */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="rs-glow absolute -right-[10%] -top-[40%] aspect-square w-[45%] rounded-full bg-orange-500/30 blur-3xl" />
        <div className="rs-glow absolute -bottom-[50%] -left-[5%] aspect-square w-[40%] rounded-full bg-amber-500/20 blur-3xl [animation-delay:-7s]" />
        <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,180,100,0.13)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Revenue Overview</h2>
          <p className="mt-1 text-sm text-white/55">Revenue performance over the last 7 days</p>
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-orange-200 sm:flex">
          <TrendingUp className="size-3.5" /> Last 7 days
        </span>
      </div>

      {/* Summary numbers */}
      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 backdrop-blur-sm sm:px-4 sm:py-3">
            <p className="text-[11px] text-white/50 sm:text-xs">{label}</p>
            <p className="mt-0.5 truncate text-xs font-semibold sm:text-sm">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fb923c" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#fb923c" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }} dy={8} />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={52}
              tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }}
              tickFormatter={(v) => `Rs. ${v / 1000}k`}
            />

            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#fb923c", strokeOpacity: 0.5, strokeDasharray: "4 4" }} />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#fb923c"
              strokeWidth={3}
              fill="url(#revenueFill)"
              activeDot={{ r: 6, fill: "#fb923c", stroke: "#1c120c", strokeWidth: 3 }}
              animationDuration={1200}
            />

            {/* Marks the best day */}
            <ReferenceDot x={best.day} y={best.revenue} r={6} fill="#fb923c" stroke="#1c120c" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}