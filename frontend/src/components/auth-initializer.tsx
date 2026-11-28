"use client";

import { useEffect } from "react";

import { getAuthSession } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth.store";

export default function AuthInitializer() {
  const setUser = useAuthStore((state) => state.setUser);
  const setInitialized = useAuthStore(
    (state) => state.setInitialized
  );

  useEffect(() => {
    const session = getAuthSession();

    if (session?.user && session.accessToken) {
      setUser(session.user);
    }

    setInitialized();
  }, [setUser, setInitialized]);

  return null;
}