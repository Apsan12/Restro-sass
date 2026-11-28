import Link from "next/link";
import { ArrowUpRight, ClipboardPlus, Plus, Users, Utensils } from "lucide-react";

/* 1. The actions. Edit the text and the href (the page each card opens). */
const actions = [
  { title: "New Order", description: "Create a new restaurant order", icon: ClipboardPlus, href: "/orders/new", color: "orange" },
  { title: "Add Menu Item", description: "Add a new item to your menu", icon: Utensils, href: "/menu/new", color: "emerald" },
  { title: "Add Staff", description: "Create a staff account", icon: Users, href: "/staff/new", color: "sky" },
  { title: "Add Category", description: "Create a menu category", icon: Plus, href: "/categories/new", color: "violet" },
] as const;

/* 2. The colors. Tailwind needs full class names, so they are written out here once. */
const colors = {
  orange: { tile: "from-orange-400 to-orange-600 shadow-orange-500/30", hover: "hover:border-orange-400/60" },
  emerald: { tile: "from-emerald-400 to-emerald-600 shadow-emerald-500/30", hover: "hover:border-emerald-400/60" },
  sky: { tile: "from-sky-400 to-sky-600 shadow-sky-500/30", hover: "hover:border-sky-400/60" },
  violet: { tile: "from-violet-400 to-violet-600 shadow-violet-500/30", hover: "hover:border-violet-400/60" },
};

/* 3. The panel: a warm "ember" background with glass cards on top. Each card is a link.
      Everything is in this one file, so there is nothing else to import. */
export default function QuickActions() {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-[#2b1409] via-[#1c120c] to-[#3a1708] p-5 text-white shadow-xl shadow-orange-900/10 sm:p-6">
      <style>{`
        @keyframes rs-up   { from { opacity: 0; transform: translateY(12px) } }
        @keyframes rs-glow { 50% { transform: translate(24px, -20px); opacity: .85 } }
        .rs-up   { animation: rs-up .5s cubic-bezier(.22, 1, .36, 1) both }
        .rs-glow { animation: rs-glow 14s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) { .rs-up, .rs-glow { animation: none } }
      `}</style>

      {/* Background: two glowing lights and a faint dot texture */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="rs-glow absolute -left-[10%] -top-[40%] aspect-square w-[45%] rounded-full bg-orange-500/30 blur-3xl" />
        <div className="rs-glow absolute -bottom-[50%] -right-[5%] aspect-square w-[40%] rounded-full bg-amber-500/20 blur-3xl [animation-delay:-7s]" />
        <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,180,100,0.13)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
      </div>

      <h2 className="text-base font-semibold">Quick Actions</h2>
      <p className="mb-5 mt-1 text-sm text-white/55">Frequently used restaurant management actions</p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map(({ title, description, icon: Icon, href, color }, i) => (
          <Link
            key={title}
            href={href}
            style={{ animationDelay: `${i * 80}ms` }}
            className={`rs-up group relative rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/[0.12] hover:shadow-2xl hover:shadow-black/30 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400/30 ${colors[color].hover}`}
          >
            <ArrowUpRight className="absolute right-4 top-4 size-4 text-white/30 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />

            <span className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${colors[color].tile}`}>
              <Icon className="size-5" />
            </span>

            <p className="mt-4 text-sm font-semibold">{title}</p>
            <p className="mt-1 text-xs leading-5 text-white/55">{description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
