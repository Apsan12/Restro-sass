import {
  Building2,
  CheckCircle2,
  UserPlus,
  Utensils,
} from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: typeof Building2;
  iconStyle: string;
}

const activities: Activity[] = [
  {
    id: "1",
    title: "New restaurant registered",
    description: "The Food House joined Manage Resto",
    time: "10 minutes ago",
    icon: Building2,
    iconStyle: "bg-orange-100 text-orange-600",
  },
  {
    id: "2",
    title: "Business Admin created",
    description: "Sarah Smith was added as a Business Admin",
    time: "32 minutes ago",
    icon: UserPlus,
    iconStyle: "bg-blue-100 text-blue-600",
  },
  {
    id: "3",
    title: "Restaurant activated",
    description: "Urban Bites is now active on the platform",
    time: "1 hour ago",
    icon: CheckCircle2,
    iconStyle: "bg-emerald-100 text-emerald-600",
  },
  {
    id: "4",
    title: "Menu activity",
    description: "Cafe Aroma added 12 new menu items",
    time: "2 hours ago",
    icon: Utensils,
    iconStyle: "bg-purple-100 text-purple-600",
  },
];

export default function RecentPlatformActivity() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-stone-900">
            Recent Platform Activity
          </h2>

          <p className="mt-1 text-sm text-stone-500">
            Recent activity across Manage Resto.
          </p>
        </div>

        <button
          type="button"
          className="hidden text-sm font-semibold text-orange-500 transition hover:text-orange-600 sm:block"
        >
          View all
        </button>
      </div>

      <div className="divide-y divide-stone-100">
        {activities.map((activity) => {
          const Icon = activity.icon;

          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 px-5 py-4"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${activity.iconStyle}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <p className="text-sm font-semibold text-stone-900">
                    {activity.title}
                  </p>

                  <span className="shrink-0 text-xs text-stone-400">
                    {activity.time}
                  </span>
                </div>

                <p className="mt-1 text-sm text-stone-500">
                  {activity.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}