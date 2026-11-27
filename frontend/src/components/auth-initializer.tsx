"use client";

import { useEffect } from "react";

import { getAuthSession } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth.store";

export default function AuthInitializer() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const session = getAuthSession();

    if (session?.user) {
      setUser(session.user);
    }
  }, [setUser]);

  return null;
}