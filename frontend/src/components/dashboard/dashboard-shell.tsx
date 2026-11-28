"use client";

import { useState } from "react";

import Sidebar from "@/components/dashboard/sidebar";
import Navbar from "@/components/dashboard/navbar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({
  children,
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f8f6f2]">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}