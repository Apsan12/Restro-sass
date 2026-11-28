import Link from "next/link";
import { CheckCircle2, ChefHat, Clock3, type LucideIcon } from "lucide-react";

type Status = "Pending" | "Preparing" | "Completed";

interface Order {
  id: string;
  token: string;
  customer: string;
  table: string;
  amount: string;
  status: Status;
}

const orders: Order[] = [
  { id: "1", token: "#1042", customer: "Walk-in Customer", table: "Table 04", amount: "Rs. 1,250", status: "Completed" },
  { id: "2", token: "#1043", customer: "John Doe", table: "Table 08", amount: "Rs. 2,450", status: "Preparing" },
  { id: "3", token: "#1044", customer: "Walk-in Customer", table: "Table 02", amount: "Rs. 850", status: "Pending" },
  { id: "4", token: "#1045", customer: "Sarah", table: "Room 03", amount: "Rs. 3,200", status: "Completed" },
];

// Each status has its own icon and colors (full class names, as Tailwind needs).
const statusStyles: Record<Status, { icon: LucideIcon; tile: string; pill: string }> = {
  Pending: { icon: Clock3, tile: "bg-amber-400/15 text-amber-300", pill: "bg-amber-400/15 text-amber-300" },
  Preparing: { icon: ChefHat, tile: "bg-sky-400/15 text-sky-300", pill: "bg-sky-400/15 text-sky-300" },
  Completed: { icon: CheckCircle2, tile: "bg-emerald-400/15 text-emerald-300", pill: "bg-emerald-400/15 text-emerald-300" },
};

export default function RecentOrders() {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-[#2b1409] via-[#1c120c] to-[#3a1708] text-white shadow-xl shadow-orange-900/10">
      <style>{`
        @keyframes rs-up   { from { opacity: 0; transform: translateY(10px) } }
        @keyframes rs-glow { 50% { transform: translate(24px, -20px); opacity: .85 } }
        .rs-up   { animation: rs-up .5s cubic-bezier(.22, 1, .36, 1) both }
        .rs-glow { animation: rs-glow 14s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) { .rs-up, .rs-glow { animation: none } }
      `}</style>

      {/* Background: glowing lights and a faint dot texture */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="rs-glow absolute -left-[10%] -top-[30%] aspect-square w-[45%] rounded-full bg-orange-500/25 blur-3xl" />
        <div className="rs-glow absolute -bottom-[40%] -right-[5%] aspect-square w-[40%] rounded-full bg-amber-500/15 blur-3xl [animation-delay:-7s]" />
        <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,180,100,0.13)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
      </div>

      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-base font-semibold">Recent Orders</h2>
          <p className="mt-1 text-sm text-white/55">Latest restaurant orders</p>
        </div>

        <Link href="/orders" className="rounded-lg px-2 py-1 text-sm font-semibold text-orange-300 transition hover:bg-white/10 hover:text-orange-200">
          View all
        </Link>
      </div>

      <ul className="divide-y divide-white/10">
        {orders.map((order, i) => {
          const { icon: Icon, tile, pill } = statusStyles[order.status];

          return (
            <li
              key={order.id}
              style={{ animationDelay: `${i * 80}ms` }}
              className="rs-up flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.05] sm:px-6"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tile}`}>
                  <Icon className="size-5" />
                </span>

                <div className="min-w-0">
                  <p className="text-sm font-semibold">{order.token}</p>
                  <p className="truncate text-xs text-white/55">
                    {order.customer} · {order.table}
                    <span className="sm:hidden"> · {order.amount}</span>
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-4">
                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${pill}`}>
                  {order.status === "Preparing" && <span className="size-1.5 animate-pulse rounded-full bg-sky-300" />}
                  {order.status}
                </span>
                <span className="hidden text-sm font-semibold sm:block">{order.amount}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}