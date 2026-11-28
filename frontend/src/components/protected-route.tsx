"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const isInitialized = useAuthStore(
    (state) => state.isInitialized
  );

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(
        `/login?redirect=${encodeURIComponent(pathname)}`// Redirect to login with the current path as a query parameter
      );
    }
  }, [
    isInitialized,
    isAuthenticated,
    pathname,
    router,
  ]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f6f2]">
        <p className="text-sm text-stone-500">
          Loading Manage Resto...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}