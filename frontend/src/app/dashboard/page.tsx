"use client";

import ProtectedRoute from "@/components/protected-route";
import { useAuthStore } from "@/stores/auth.store";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <ProtectedRoute>
      <main className="min-h-screen p-8">
        <h1 className="text-3xl font-bold">
          Restaurant Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Welcome, {user?.name ?? "User"}
        </p>
      </main>
    </ProtectedRoute>
  );
}