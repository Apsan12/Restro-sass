"use client";

import { useState, type ComponentProps, type CSSProperties, type ReactNode } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ChefHat, Eye, EyeOff, LockKeyhole, Mail, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { login } from "@/services/auth.service";
import { saveAuthSession } from "@/lib/auth";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuthStore } from "@/stores/auth.store";

const schema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
type FormData = z.infer<typeof schema>;

/* ───────────── Animation helpers ─────────────
   Every entrance uses one class (rs-in) and a delay set with d(ms). */

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

const Appear = ({ at = 0, className = "", children }: { at?: number; className?: string; children: ReactNode }) => (
  <div className={`rs-in ${className}`} style={d(at)}>{children}</div>
);

const Done = ({ children }: { children: ReactNode }) => (
  <div className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500/15 text-sm font-semibold text-emerald-300">
    <Check className="size-4" /> {children}
  </div>
);

const Row = ({ a, b, className = "" }: { a: string; b: string; className?: string }) => (
  <div className={`flex justify-between ${className}`}><span>{a}</span><span>{b}</span></div>
);

/* ───────────── The four scenes of a restaurant day ───────────── */

const OrderScene = () => (
  <div className="space-y-2.5">
    {[["2× Butter chicken", "Rs 900"], ["2× Garlic naan", "Rs 240"], ["1× Mango lassi", "Rs 180"]].map(([a, b], i) => (
      <Appear key={a} at={200 + i * 500}>
        <Row a={a} b={b} className="rounded-xl bg-white/[0.06] px-4 py-3 text-sm text-white/80" />
      </Appear>
    ))}
    <Appear at={1900}><Row a="Total" b="Rs 1,320" className="px-1 pt-2 text-sm font-semibold text-white" /></Appear>
    <Appear at={2500}><Done>Sent to kitchen</Done></Appear>
  </div>
);

const KitchenScene = () => (
  <div className="space-y-4">
    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
      <div className="rs-bar h-full w-full rounded-full bg-gradient-to-r from-orange-500 to-emerald-400" />
    </div>
    {["Butter chicken", "Garlic naan", "Mango lassi"].map((name, i) => (
      <Appear key={name} at={500 + i * 900} className="flex items-center gap-3 text-sm text-white/85">
        <Check className="size-5 rounded-full bg-emerald-500 p-1 text-white" /> {name} cooked
      </Appear>
    ))}
    <Appear at={3400}><Done>Ready to serve</Done></Appear>
  </div>
);

const ServeScene = () => (
  <div className="relative h-full rounded-xl bg-white/[0.04]">
    <div className="absolute left-3 top-1/2 flex size-14 -translate-y-1/2 items-center justify-center rounded-xl border border-white/15 text-[11px] text-white/60">
      Kitchen
    </div>
    {[["3", "42%", "22%"], ["4", "42%", "72%"], ["5", "70%", "22%"], ["6", "70%", "72%"]].map(([n, left, top]) => (
      <div
        key={n}
        style={{ left, top }}
        className={`absolute flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border text-xs ${
          n === "5" ? "border-orange-400/70 bg-orange-500/15 text-white" : "border-white/15 text-white/50"
        }`}
      >
        T{n}
      </div>
    ))}
    <div className="rs-walk absolute left-[70%] top-[44%] size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400 shadow-[0_0_18px_rgba(249,115,22,0.9)]" />
    <Appear at={3000} className="absolute inset-x-5 bottom-4"><Done>Table 5 served</Done></Appear>
  </div>
);

const PayScene = () => (
  <div className="space-y-4">
    <div className="space-y-1.5 text-sm text-white/55">
      <Row a="Subtotal" b="Rs 1,320" />
      <Row a="VAT 13%" b="Rs 172" />
      <Row a="Total" b="Rs 1,492" className="border-t border-white/10 pt-2 font-semibold text-white" />
    </div>
    <Appear at={900}><Done>Paid by QR</Done></Appear>
    <div className="rounded-xl bg-white/[0.04] p-3">
      <div className="flex justify-between text-xs text-white/50">
        <span>Today&apos;s sales</span>
        <Appear at={1800}><b className="text-sm text-white">Rs 48,200</b></Appear>
      </div>
      <div className="mt-2 flex h-14 items-end gap-2">
        {[38, 52, 44, 66, 58, 82].map((h, i) => (
          <div key={i} className="rs-grow flex-1 rounded-t bg-orange-500/80" style={{ height: `${h}%`, ...d(1400 + i * 100) }} />
        ))}
      </div>
    </div>
  </div>
);

const STAGES = [
  { name: "Order", Scene: OrderScene, text: "Waiters take orders on any phone or tablet. No paper, no shouting across the room." },
  { name: "Kitchen", Scene: KitchenScene, text: "Tickets reach the kitchen the moment they are sent, with live status for every dish." },
  { name: "Serve", Scene: ServeScene, text: "Staff see which table is ready, so hot food reaches the right guest." },
  { name: "Pay", Scene: PayScene, text: "Add VAT, take cash, card or QR, and watch sales update as each bill closes." },
];

/* Auto-plays: when a step's progress bar finishes, the next step starts.
   Hover pauses everything. Clicking a step jumps to it. */
function Storyboard() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const { Scene, text } = STAGES[step];

  return (
    <div
      className={`w-full max-w-md ${paused ? "[&_*]:[animation-play-state:paused]" : ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#1f1711]/80 shadow-2xl shadow-black/40 backdrop-blur">
        <div className="flex justify-between border-b border-white/10 px-5 py-3 text-xs text-white/50">
          <span>Table 5 · Order #128</span>
          <span className="flex items-center gap-1.5">
            <span className="rs-ping size-1.5 rounded-full bg-emerald-400" /> Live
          </span>
        </div>
        <div key={step} className="rs-in h-[280px] p-5"><Scene /></div>
      </div>

      <p key={text} className="rs-in mt-5 min-h-14 max-w-sm leading-7 text-white/65">{text}</p>

      <div className="mt-4 grid grid-cols-4 gap-3">
        {STAGES.map((s, n) => (
          <button key={s.name} onClick={() => setStep(n)} className="group text-left focus-visible:outline-none">
            <div className="h-0.5 overflow-hidden rounded-full bg-white/15">
              <div
                key={n === step ? `live-${step}` : n}
                className={`h-full bg-orange-500 ${n === step ? "rs-fill" : ""}`}
                style={{ width: n <= step ? "100%" : 0 }}
                onAnimationEnd={() => n === step && setStep((step + 1) % STAGES.length)}
              />
            </div>
            <p className={`mt-2.5 text-sm transition-colors ${n === step ? "font-semibold text-white" : "text-white/40 group-hover:text-white/70"}`}>
              {n + 1}. {s.name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────── Form field: label + icon + input + error ───────────── */

type FieldProps = ComponentProps<"input"> & {
  label: string;
  icon: LucideIcon;
  reg: UseFormRegisterReturn;
  error?: string;
  aside?: ReactNode; // next to the label (e.g. "Forgot password?")
  end?: ReactNode;   // inside the input, right side (e.g. show/hide)
};

function Field({ label, icon: Icon, reg, error, aside, end, ...props }: FieldProps) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <label htmlFor={reg.name} className="font-medium text-stone-700">{label}</label>
        {aside}
      </div>
      <div className="group relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-orange-500" />
        <input
          id={reg.name}
          aria-invalid={!!error}
          aria-describedby={error ? `${reg.name}-error` : undefined}
          {...props}
          {...reg}
          className={`h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 hover:border-stone-300 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 ${
            error ? "border-red-300" : "border-stone-200"
          }`}
        />
        {end}
      </div>
      {error && <p id={`${reg.name}-error`} className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

const Logo = ({ dark = false }: { dark?: boolean }) => (
  <div className="flex items-center gap-3">
    <div className="flex size-11 items-center justify-center rounded-xl bg-orange-500">
      <ChefHat className="size-6 text-white" />
    </div>
    <span className={`text-xl font-semibold tracking-tight ${dark ? "text-white" : "text-stone-900"}`}>Manage Resto</span>
  </div>
);

const linkClass = "font-medium text-orange-600 transition-colors hover:text-orange-700 focus-visible:underline focus-visible:outline-none";

/* ───────────── Page ───────────── */

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [done, setDone] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

 const onSubmit = async (data: FormData) => {
  setLoginError(null);

  try {
    const { data: res } = await login(data);

    saveAuthSession({
      user: res.user,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    });

    setUser(res.user);

    setDone(true);
    toast.success("Login successful");

    setTimeout(() => router.push("/dashboard"), 450);
  } catch (error) {
    const message = getApiErrorMessage(error);

    setLoginError(message);
    setShake(true);
  }
};

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <style>{`
        @keyframes rs-in    { from { opacity: 0; transform: translateY(10px) } }
        @keyframes rs-w     { from { width: 0 } }
        @keyframes rs-grow  { from { transform: scaleY(0) } }
        @keyframes rs-walk  { from { left: 14%; top: 50% } }
        @keyframes rs-shake { 25% { transform: translateX(-8px) } 50% { transform: translateX(7px) } 75% { transform: translateX(-4px) } }
        @keyframes rs-ping  { to { transform: scale(2.4); opacity: 0 } }
        @keyframes rs-glow  { 50% { transform: translate(30px, -24px); opacity: .9 } }
        .rs-in    { animation: rs-in .6s var(--d, 0ms) cubic-bezier(.22, 1, .36, 1) both }
        .rs-bar   { animation: rs-w 3.4s .5s ease-out both }
        .rs-fill  { animation: rs-w 5200ms linear both }
        .rs-grow  { transform-origin: bottom; animation: rs-grow .6s var(--d, 0ms) cubic-bezier(.22, 1, .36, 1) both }
        .rs-walk  { animation: rs-walk 2.4s .5s cubic-bezier(.45, 0, .2, 1) both }
        .rs-shake { animation: rs-shake .4s ease-in-out }
        .rs-ping  { animation: rs-ping 1.8s infinite }
        .rs-glow  { animation: rs-glow 14s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) {
          .rs-in, .rs-bar, .rs-fill, .rs-grow, .rs-walk, .rs-shake, .rs-ping, .rs-glow { animation: none !important }
        }
      `}</style>

      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        {/* Left: animated explanation of the product */}
        <section className="relative hidden overflow-hidden bg-[#17120e] lg:block">
          <div className="rs-glow absolute -left-24 -top-24 size-[28rem] rounded-full bg-orange-500/20 blur-3xl" />
          <div className="rs-glow absolute -bottom-40 -right-24 size-[30rem] rounded-full bg-orange-700/20 blur-3xl [animation-delay:-7s]" />

          <div className="relative flex h-full flex-col justify-between gap-10 p-12 xl:p-16">
            <Logo dark />
            <div className="space-y-9">
              <div className="max-w-lg">
                <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-white xl:text-5xl">
                  From the first order to the final bill, one flow.
                </h1>
                <p className="mt-4 max-w-md text-white/55">Watch how a single table moves through your restaurant.</p>
              </div>
              <Storyboard />
            </div>
            <p className="text-sm text-white/35">Orders, kitchen, floor and billing in one system.</p>
          </div>
        </section>

        {/* Right: sign in */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div
            className={`rs-in w-full max-w-md ${shake ? "rs-shake" : ""}`}
            onAnimationEnd={(e) => e.animationName === "rs-shake" && setShake(false)}
          >
            <div className="mb-10 lg:hidden"><Logo /></div>

            <h2 className="text-3xl font-semibold tracking-tight text-stone-900">
  Welcome back
</h2>

<p className="mt-2 text-sm text-stone-500">
  Sign in to manage your restaurant.
</p>

{loginError && (
  <div
    role="alert"
    className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
  >
    {loginError}
  </div>
)}

<form
  onSubmit={handleSubmit(onSubmit)}
  noValidate
  className="mt-8 space-y-5"
>
              <Field
                label="Email"
                icon={Mail}
                reg={register("email")}
                error={errors.email?.message}
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="you@restaurant.com"
              />

              <Field
                label="Password"
                icon={LockKeyhole}
                reg={register("password")}
                error={errors.password?.message}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                aside={<button type="button" className={linkClass}>Forgot password?</button>}
                end={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
                  >
                    {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                  </button>
                }
              />

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-stone-600">
                <input type="checkbox" className="size-4 rounded border-stone-300 accent-orange-500" />
                Keep me signed in
              </label>

              <button
                type="submit"
                disabled={isSubmitting || done}
                className={`group flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/30 active:scale-[0.99] disabled:cursor-not-allowed ${
                  done ? "bg-emerald-500 shadow-emerald-500/25" : "bg-orange-500 shadow-orange-500/25 hover:bg-orange-600 disabled:opacity-70"
                }`}
              >
                {done ? (
                  <><Check className="size-5" /> Signed in</>
                ) : isSubmitting ? (
                  <><span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Signing in…</>
                ) : (
                  <>Sign in <ArrowRight className="size-[18px] transition-transform group-hover:translate-x-1" /></>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-stone-500">
              Need an account? <button type="button" className={linkClass}>Ask your admin</button>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}