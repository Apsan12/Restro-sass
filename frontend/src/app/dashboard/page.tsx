"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, ChefHat, ClipboardList, Coffee, Pizza, Soup, Users, Utensils, Wine } from "lucide-react";

import DashboardShell from "@/components/dashboard/dashboard-shell";
import ProtectedRoute from "@/components/protected-route";
import RecentOrders from "@/components/dashboard/recent-order";
import RevenueChart from "@/components/dashboard/revenue-chart";
import StatCard from "@/components/dashboard/stat-card";
import QuickActions from "@/components/dashboard/quick-actions";

import { useAuthStore } from "@/stores/auth.store";

/* ───────────── Content ───────────── */

const STATS = [
  { title: "Total Orders", value: "128", description: "vs. last week", trend: "+12.5%", icon: ClipboardList },
  { title: "Today's Revenue", value: "Rs. 24,850", description: "vs. yesterday", trend: "+8.2%", icon: BarChart3 },
  { title: "Active Tables", value: "08", description: "out of 24 tables", icon: Utensils },
  { title: "Total Staff", value: "12", description: "2 currently active", icon: Users },
];

/* ───────────── Helpers ───────────── */

/** Fades and slides its children in when they scroll into view. `at` delays it (ms). */
function Reveal({ at = 0, children }: { at?: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setShow(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setShow(true), io.disconnect()), { threshold: 0.1 });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${at}ms` }}
      className={`h-full transition duration-700 ease-out ${show ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-[0.98] opacity-0"}`}
    >
      {children}
    </div>
  );
}

/* ───────────── Hero banner: vivid orange, so it stands out from the dark panels ───────────── */

const ORBIT = [Pizza, Coffee, Soup, Wine];

function Orbit() {
  return (
    <div aria-hidden="true" className="relative hidden size-52 shrink-0 md:block">
      <div className="absolute inset-0 rounded-full border border-dashed border-white/40" />
      <div className="absolute inset-7 rounded-full border border-white/20" />

      {/* Food icons circle the chef hat; each one spins back so it stays upright */}
      <div className="rs-spin absolute inset-0">
        {ORBIT.map((Icon, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 -ml-5 -mt-5"
            style={{ transform: `rotate(${i * 90}deg) translateY(-104px) rotate(${-i * 90}deg)` }}
          >
            <span className="rs-spin-back flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Icon className="size-5" />
            </span>
          </div>
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="absolute size-20 animate-ping rounded-3xl bg-white/30 [animation-duration:3s]" />
        <span className="relative flex size-20 items-center justify-center rounded-3xl bg-white text-orange-600 shadow-2xl shadow-orange-900/30">
          <ChefHat className="size-10" />
        </span>
      </div>
    </div>
  );
}

function Hero({ name }: { name: string }) {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-6 text-white shadow-xl shadow-orange-600/25 sm:p-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="rs-glow absolute -left-[8%] -top-[40%] aspect-square w-[45%] rounded-full bg-white/25 blur-3xl" />
        <div className="rs-glow absolute -bottom-[50%] right-[10%] aspect-square w-[40%] rounded-full bg-amber-300/30 blur-3xl [animation-delay:-7s]" />
        <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_right,black,transparent_70%)]" />

        {/* Rising sparks, like heat from a hot pan. Positions are computed, not random. */}
        {Array.from({ length: 14 }, (_, i) => (
          <span
            key={i}
            className="rs-spark absolute -bottom-3 rounded-full bg-white/80 shadow-[0_0_10px_2px_rgba(255,255,255,0.5)]"
            style={{
              left: `${(i * 29) % 100}%`,
              width: 3 + (i % 3) * 2,
              height: 3 + (i % 3) * 2,
              "--x": `${(i % 2 ? 1 : -1) * (15 + (i % 4) * 12)}px`,
              animationDuration: `${6 + (i % 4) * 1.5}s`,
              animationDelay: `${-i * 0.8}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-8">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur">
            <span className="size-2 animate-pulse rounded-full bg-white" /> Overview
          </p>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, {name}</h1>
          <p className="mt-2 text-white/80">Here&apos;s what&apos;s happening in your restaurant today.</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/orders/new"
              className="group inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-orange-600 shadow-lg shadow-orange-900/20 transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            >
              New order <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/orders"
              className="inline-flex h-11 items-center rounded-xl border border-white/30 bg-white/10 px-5 text-sm font-semibold backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            >
              View orders
            </Link>
          </div>
        </div>

        <Orbit />
      </div>
    </section>
  );
}

/* ───────────── Page ───────────── */

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <ProtectedRoute>
      <DashboardShell>
        <style>{`
          @keyframes rs-spin  { to { transform: rotate(360deg) } }
          @keyframes rs-spark { 0% { transform: translate(0, 0); opacity: 0 } 15% { opacity: .9 } 100% { transform: translate(var(--x), -420px); opacity: 0 } }
          @keyframes rs-glow  { 50% { transform: translate(24px, -20px); opacity: .85 } }
          .rs-spin      { animation: rs-spin 28s linear infinite }
          .rs-spin-back { animation: rs-spin 28s linear infinite reverse }
          .rs-spark     { animation: rs-spark linear infinite }
          .rs-glow      { animation: rs-glow 14s ease-in-out infinite }
          @media (prefers-reduced-motion: reduce) {
            .rs-spin, .rs-spin-back, .rs-glow { animation: none }
            .rs-spark { display: none }
          }
        `}</style>

        <div className="space-y-6 sm:space-y-8">
          <Reveal><Hero name={user?.name ?? "User"} /></Reveal>

          {/* Stats: light cards under the vivid hero. Switch tone="dark" for the ember look. */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STATS.map((stat, i) => (
              <Reveal key={stat.title} at={i * 100}>
                <StatCard {...stat} tone="light" />
              </Reveal>
            ))}
          </div>

          {/* Chart + Orders */}
          <div className="grid gap-6 xl:grid-cols-5">
            <div className="xl:col-span-3"><Reveal><RevenueChart /></Reveal></div>
            <div className="xl:col-span-2"><Reveal at={150}><RecentOrders /></Reveal></div>
          </div>

          <Reveal><QuickActions /></Reveal>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}