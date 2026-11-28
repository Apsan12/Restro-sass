import { MoreHorizontal } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  admin: string;
  orders: string;
  status: "Active" | "Pending";
}

const restaurants: Restaurant[] = [
  {
    id: "1",
    name: "The Food House",
    admin: "John Doe",
    orders: "1,240",
    status: "Active",
  },
  {
    id: "2",
    name: "Urban Bites",
    admin: "Sarah Smith",
    orders: "986",
    status: "Active",
  },
  {
    id: "3",
    name: "Cafe Aroma",
    admin: "David Wilson",
    orders: "542",
    status: "Pending",
  },
  {
    id: "4",
    name: "Taste Corner",
    admin: "Michael Brown",
    orders: "428",
    status: "Active",
  },
];

const statusStyles: Record<
  Restaurant["status"],
  string
> = {
  Active: "bg-emerald-50 text-emerald-600",
  Pending: "bg-amber-50 text-amber-600",
};

export default function RestaurantOverview() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-stone-900">
            Restaurant Overview
          </h2>

          <p className="mt-1 text-sm text-stone-500">
            Monitor restaurants registered on the platform.
          </p>
        </div>

        <button
          type="button"
          className="hidden text-sm font-semibold text-orange-500 transition hover:text-orange-600 sm:block"
        >
          View all
        </button>

        <button
          type="button"
          aria-label="Restaurant options"
          className="rounded-lg p-2 text-stone-500 transition hover:bg-stone-100 sm:hidden"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <div className="divide-y divide-stone-100">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-sm font-bold text-orange-600">
                {restaurant.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-stone-900">
                  {restaurant.name}
                </p>

                <p className="truncate text-xs text-stone-500">
                  Admin: {restaurant.admin}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-6 sm:justify-end">
              <div>
                <p className="text-xs text-stone-400">
                  Orders
                </p>

                <p className="mt-1 text-sm font-semibold text-stone-900">
                  {restaurant.orders}
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[restaurant.status]}`}
              >
                {restaurant.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}