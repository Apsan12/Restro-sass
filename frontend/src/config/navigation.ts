import {
  BarChart3,
  ClipboardList,
  CookingPot,
  LayoutDashboard,
  Settings,
  ShoppingBag,
  Table2,
  Users,
  Utensils,
  Building2,
  ShieldCheck,
  Activity,
} from "lucide-react";

import { AccountRole } from "@/types/roles";

export interface NavigationItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

export const navigationByRole: Record<
  AccountRole,
  NavigationItem[]
> = {
  [AccountRole.SUPER_ADMIN]: [
    {
      label: "Overview",
      href: "/super-admin",
      icon: LayoutDashboard,
    },
    {
      label: "Restaurants",
      href: "/super-admin/restaurants",
      icon: Building2,
    },
    {
      label: "Business Admins",
      href: "/super-admin/business-admins",
      icon: ShieldCheck,
    },
    {
      label: "Orders",
      href: "/super-admin/orders",
      icon: ClipboardList,
    },
    {
      label: "Analytics",
      href: "/super-admin/analytics",
      icon: BarChart3,
    },
    {
      label: "Activity",
      href: "/super-admin/activity",
      icon: Activity,
    },
    {
      label: "Settings",
      href: "/super-admin/settings",
      icon: Settings,
    },
  ],

  [AccountRole.BUSINESS_ADMIN]: [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Orders",
      href: "/dashboard/orders",
      icon: ClipboardList,
    },
    {
      label: "Menu",
      href: "/dashboard/menu",
      icon: Utensils,
    },
    {
      label: "Categories",
      href: "/dashboard/categories",
      icon: ShoppingBag,
    },
    {
      label: "Tables",
      href: "/dashboard/tables",
      icon: Table2,
    },
    {
      label: "Rooms",
      href: "/dashboard/rooms",
      icon: Building2,
    },
    {
      label: "Staff",
      href: "/dashboard/staff",
      icon: Users,
    },
    {
      label: "Kitchen",
      href: "/dashboard/kitchen",
      icon: CookingPot,
    },
    {
      label: "Reports",
      href: "/dashboard/reports",
      icon: BarChart3,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ],

  [AccountRole.STAFF]: [
    {
      label: "Dashboard",
      href: "/staff",
      icon: LayoutDashboard,
    },
    {
      label: "Orders",
      href: "/staff/orders",
      icon: ClipboardList,
    },
    {
      label: "Tables & Rooms",
      href: "/staff/tables",
      icon: Table2,
    },
  ],

  [AccountRole.KITCHEN_STAFF]: [
    {
      label: "Dashboard",
      href: "/staff",
      icon: LayoutDashboard,
    },
    {
      label: "Kitchen",
      href: "/staff/kitchen",
      icon: CookingPot,
    },
    {
      label: "Orders",
      href: "/staff/orders",
      icon: ClipboardList,
    },
  ],
};