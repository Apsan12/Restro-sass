"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, LogOut, X } from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { clearAuthSession, getAuthSession } from "@/lib/auth";
import { navigationByRole } from "@/config/navigation";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const HOME: Record<string, string> = {
  SUPER_ADMIN: "/super-admin",
  BUSINESS_ADMIN: "/dashboard",
};

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  // Mobile drawer: close with Escape and stop the page behind from scrolling
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileOpen, onClose]);

  if (!user) return null;

  const navigation = navigationByRole[user.role];
  const homeHref = HOME[user.role] ?? "/staff";

  const handleLogout = () => {
    const session = getAuthSession();
    if (session?.refreshToken) {
      // Real logout API will be connected here.
    }
    clearAuthSession();
    clearAuth();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile overlay (always rendered so it can fade) */}
      <button
        type="button"
        aria-label="Close sidebar"
        tabIndex={mobileOpen ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col overflow-hidden bg-[#17120e] text-white shadow-2xl transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:max-w-none lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Warm glows */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-orange-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 size-64 rounded-full bg-red-600/20 blur-3xl" />

        {/* Brand */}
        <div className="relative flex h-20 shrink-0 items-center justify-between px-5">
          <Link href={homeHref} onClick={onClose} className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30">
              <ChefHat className="size-5 text-white" />
            </span>
            <span>
              <span className="block text-lg font-semibold leading-tight tracking-tight">Manage Resto</span>
              <span className="block text-xs text-white/50">Restaurant Management</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-3 px-3 text-xs font-medium text-white/40">Menu</p>

          <ul className="space-y-1">
            {navigation.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);

              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 ${
                      active
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
                        : "text-white/60 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <Icon className={`size-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? "" : "text-orange-400/80"}`} />
                    <span className="truncate">{label}</span>
                    {active && <span className="ml-auto size-1.5 rounded-full bg-white/90" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User */}
        <div className="relative shrink-0 border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[0.06] p-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-sm font-semibold">
              {user.name?.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-white/50">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
          >
            <LogOut className="size-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}