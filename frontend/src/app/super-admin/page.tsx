
"use client";

import {
  Building2,
  ClipboardList,
  DollarSign,
  Users,
} from "lucide-react";

import DashboardShell from "@/components/dashboard/dashboard-shell";
import ProtectedRoute from "@/components/protected-route";
import StatCard from "@/components/dashboard/stat-card";
import RestaurantOverview from "@/components/dashboard/restaurant-overview";
import RecentPlatformActivity from "@/components/dashboard/recent-platform-activity";

import { useAuthStore } from "@/stores/auth.store";
import PlatformRevenueChart from "@/components/dashboard/platform-chart";

export default function SuperAdminPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <ProtectedRoute>
      <DashboardShell>
        <div className="space-y-8">
          {/* Page Header */}
          <div>
            <p className="text-sm font-medium text-orange-500">
              Platform Overview
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              Welcome back, {user?.name ?? "Super Admin"}
            </h1>

            <p className="mt-2 text-sm text-stone-500">
              Monitor and manage the entire Manage Resto platform.
            </p>
          </div>

          {/* Platform Stats */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Restaurants"
              value="48"
              description="Registered restaurants"
              icon={Building2}
            />

            <StatCard
              title="Total Orders"
              value="12,840"
              description="Across all restaurants"
              icon={ClipboardList}
            />

            <StatCard
              title="Platform Revenue"
              value="Rs. 485K"
              description="This month"
              trend="+14.8%"
              icon={DollarSign}
            />

            <StatCard
              title="Total Users"
              value="326"
              description="Admins and staff"
              icon={Users}
            />
          </div>

          {/* Revenue + Restaurants */}
          <div className="grid gap-6 lg:grid-cols-2">
            <PlatformRevenueChart />

            <RestaurantOverview />
          </div>

          {/* Recent Activity */}
          <RecentPlatformActivity />
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
