import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/* A waiter lifts the dome... and the dish is "404".
   Behind it, the kitchen is hot: glowing heat, drifting chilies and rising embers.
   All motion is CSS (no hooks), so this stays a server component. */

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

// [left %, top %, size px, rotation deg]
const CHILIES = [[7, 14, 60, -30], [88, 16, 48, 40], [12, 70, 46, 25], [86, 68, 64, -50], [30, 88, 34, 70]];

const Chili = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d="M18 14c10-2 22 4 30 18 4 8 8 14 14 18-14 4-30 0-40-12C14 30 12 20 18 14z" className="fill-red-500" />
    <path d="M22 20c8 0 16 6 22 16" stroke="white" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" />
    <path d="M18 14c-2-4 0-8 4-10" className="stroke-green-700" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

function SpicyBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-gradient-to-b from-[#fff8f0] via-[#ffeedd] to-[#ffd9b8]" aria-hidden="true">
      {/* Heat glow behind the plate */}
      <div className="rs-heat absolute left-1/2 top-[38%] size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-orange-400/40 to-red-500/25 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-red-400/25 to-transparent" />

      {/* Drifting chilies */}
      {CHILIES.map(([left, top, size, rot], i) => (
        <div
          key={i}
          className="rs-drift absolute opacity-70 drop-shadow-lg"
          style={{ left: `${left}%`, top: `${top}%`, "--r": `${rot}deg`, animationDelay: `${-i * 1.3}s` } as React.CSSProperties}
        >
          <Chili size={size} />
        </div>
      ))}

      {/* Rising embers: positions are computed, so server and client always match */}
      {Array.from({ length: 16 }, (_, i) => (
        <span
          key={i}
          className="rs-ember absolute -bottom-3 rounded-full bg-orange-500 shadow-[0_0_10px_3px_rgba(249,115,22,0.6)]"
          style={{
            left: `${(i * 37) % 100}%`,
            width: 4 + (i % 3) * 2,
            height: 4 + (i % 3) * 2,
            "--x": `${(i % 2 ? 1 : -1) * (20 + (i % 4) * 15)}px`,
            animationDuration: `${7 + (i % 5) * 1.6}s`,
            animationDelay: `${-i * 0.9}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <style>{`
        @keyframes rs-lift  { 0%, 12% { transform: none } 28%, 72% { transform: translateY(-78px) rotate(-10deg) } 88%, 100% { transform: none } }
        @keyframes rs-num   { 0%, 24% { opacity: 0; transform: scale(.6) } 36%, 72% { opacity: 1; transform: none } 84%, 100% { opacity: 0; transform: scale(.6) } }
        @keyframes rs-steam { 0%, 26% { opacity: 0; transform: scale(.6) } 40% { opacity: .7 } 72% { opacity: 0; transform: translateY(-64px) scale(1.5) } 100% { opacity: 0 } }
        @keyframes rs-in    { from { opacity: 0; transform: translateY(12px) } }
        @keyframes rs-heat  { 50% { transform: translate(-50%, -50%) scale(1.15); opacity: .85 } }
        @keyframes rs-drift { 0%, 100% { transform: translateY(0) rotate(var(--r)) } 50% { transform: translateY(-16px) rotate(calc(var(--r) + 12deg)) } }
        @keyframes rs-ember { 0% { transform: translate(0, 0) scale(1); opacity: 0 } 15% { opacity: .9 } 100% { transform: translate(var(--x), -100vh) scale(.4); opacity: 0 } }

        .rs-cloche { animation: rs-lift  7s ease-in-out infinite }
        .rs-num    { animation: rs-num   7s ease-in-out infinite }
        .rs-steam  { animation: rs-steam 7s ease-out infinite }
        .rs-in     { animation: rs-in .7s var(--d, 0ms) cubic-bezier(.22, 1, .36, 1) both }
        .rs-heat   { animation: rs-heat  6s ease-in-out infinite }
        .rs-drift  { animation: rs-drift 9s ease-in-out infinite }
        .rs-ember  { animation: rs-ember linear infinite }

        @media (prefers-reduced-motion: reduce) {
          .rs-cloche { animation: none; transform: translateY(-78px) rotate(-10deg) }
          .rs-drift  { animation: none; transform: rotate(var(--r)) }
          .rs-num, .rs-steam, .rs-in, .rs-heat { animation: none }
          .rs-ember  { display: none }
        }
      `}</style>

      <SpicyBackground />

      <div className="relative z-10 w-full max-w-lg text-center">
        {/* The stage: plate, number, steam and dome */}
        <div className="relative mx-auto mt-10 h-52 w-64">
          <div className="absolute inset-x-0 bottom-0 h-7 rounded-[50%] border border-orange-100 bg-white shadow-xl shadow-red-900/20" />

          <p className="rs-num absolute inset-x-0 bottom-5 text-6xl font-black tracking-tight text-stone-900">404</p>

          {[40, 50, 60].map((left, i) => (
            <span
              key={left}
              className="rs-steam absolute bottom-16 size-5 rounded-full bg-white/80 blur-md"
              style={{ left: `${left}%`, animationDelay: `${i * 0.25}s` }}
            />
          ))}

          <div className="rs-cloche absolute inset-x-8 bottom-5 origin-bottom-left">
            <span className="mx-auto block size-4 rounded-full bg-red-600" />
            <div className="relative h-24 rounded-t-full bg-gradient-to-b from-orange-500 to-red-500 shadow-lg shadow-red-500/30">
              <span className="absolute left-5 top-5 h-10 w-2.5 rotate-[25deg] rounded-full bg-white/40" />
            </div>
            <div className="-mx-2 h-2 rounded-full bg-red-600" />
          </div>
        </div>

        <p className="rs-in mx-auto mt-10 w-fit rounded-full border border-orange-300 bg-white/70 px-3.5 py-1 text-sm font-medium text-orange-700 backdrop-blur" style={delay(100)}>
          Chef&apos;s special today: Page not found
        </p>

        <h1 className="rs-in mt-5 text-3xl font-semibold tracking-tight text-stone-900" style={delay(200)}>
          This page isn&apos;t on the menu
        </h1>

        <p className="rs-in mx-auto mt-3 max-w-sm leading-7 text-stone-600" style={delay(300)}>
          The page you ordered doesn&apos;t exist or has been moved. Let&apos;s get you back to the dining room.
        </p>

        <Link
          href="/"
          style={delay(400)}
          className="rs-in group mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-orange-500 px-6 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/30"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to Manage Resto
        </Link>
      </div>
    </main>
  );
}