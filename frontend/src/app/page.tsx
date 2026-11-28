"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getAuthSession } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const session = getAuthSession();

    if (session?.accessToken) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f6f2]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />

        <p className="text-sm text-stone-500">
          Loading Manage Resto...
        </p>
      </div>
    </main>
  );
}