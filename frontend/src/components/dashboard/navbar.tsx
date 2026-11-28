"use client";

import { useEffect, useState } from "react";
import { Bell, Cake, Coffee, LogOut, Menu, Pizza, Salad, Sandwich, Soup, UtensilsCrossed, Wine } from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";

interface NavbarProps {
  onMenuClick: () => void;
  onLogout?: () => void; // optional: shows a log out button
}

// [greeting, service label] for the current hour
const getService = (h: number) =>
  h >= 5 && h < 11 ? ["Good morning", "Breakfast service"]
  : h >= 11 && h < 16 ? ["Good afternoon", "Lunch service"]
  : h >= 16 && h < 22 ? ["Good evening", "Dinner service"]
  : ["Hello", "Late night"];

const FOOD = [Pizza, Soup, Coffee, UtensilsCrossed, Wine, Salad, Sandwich, Cake];
const ROW = Array.from({ length: 32 }, (_, i) => FOOD[i % FOOD.length]); // 32 icons, wide enough for big screens

/** Warm gradient with a slow conveyor of food icons and a soft light sweep. */
function Background() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-gradient-to-r from-orange-50 via-white to-amber-50">
      <style>{`
        @keyframes rs-belt  { to { transform: translateX(-50%) } }
        @keyframes rs-shine { from { transform: translateX(-150%) } to { transform: translateX(450%) } }
        .rs-belt  { animation: rs-belt 120s linear infinite }
        .rs-shine { animation: rs-shine 9s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) { .rs-belt, .rs-shine { animation: none } }
      `}</style>

      <div className="h-full [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="rs-belt flex h-full w-max items-center text-orange-500/20">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {ROW.map((Icon, i) => (
                <Icon key={i} className={`mr-14 size-6 shrink-0 ${i % 2 ? "translate-y-3" : "-translate-y-3"}`} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="rs-shine absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/80 to-transparent" />
    </div>
  );
}

export default function Navbar({ onMenuClick, onLogout }: NavbarProps) {
  const user = useAuthStore((state) => state.user);
  const [hour, setHour] = useState<number | null>(null); // set after load to avoid hydration mismatch

  useEffect(() => setHour(new Date().getHours()), []);

  const [greeting, service] = hour === null ? ["Welcome back", ""] : getService(hour);
  const firstName = user?.name?.split(" ")[0];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-orange-100 px-4 sm:h-20 sm:px-6">
      <Background />

      {/* Left: menu (mobile) + greeting */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="rounded-xl p-2 text-stone-600 transition hover:bg-orange-50 hover:text-orange-600 lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-stone-900 sm:text-lg">
            {greeting}{firstName && hour !== null ? `, ${firstName}` : ""}
          </h1>
          <p className="hidden truncate text-sm text-stone-500 sm:block">Manage your restaurant with ease.</p>
        </div>
      </div>

      {/* Right: service chip, bell, user */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {service && (
          <span className="hidden items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700 md:flex">
            <span className="size-2 animate-pulse rounded-full bg-orange-500" />
            {service}
          </span>
        )}

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl p-2.5 text-stone-600 transition hover:bg-orange-50 hover:text-orange-600"
        >
          <Bell className="size-5" />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-orange-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-3 border-l border-stone-200 pl-3 sm:pl-4">
          <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-semibold text-white">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>

          <div className="hidden max-w-40 sm:block">
            <p className="truncate text-sm font-semibold text-stone-900">{user?.name ?? "User"}</p>
            <p className="truncate text-xs capitalize text-stone-500">{user?.role?.replaceAll("_", " ").toLowerCase() ?? "user"}</p>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              aria-label="Log out"
              className="rounded-xl p-2 text-stone-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="size-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}