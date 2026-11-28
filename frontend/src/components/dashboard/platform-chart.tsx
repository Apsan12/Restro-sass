"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "Jan", revenue: 82000 },
  { month: "Feb", revenue: 97000 },
  { month: "Mar", revenue: 91000 },
  { month: "Apr", revenue: 118000 },
  { month: "May", revenue: 135000 },
  { month: "Jun", revenue: 154000 },
  { month: "Jul", revenue: 142000 },
];

export default function PlatformRevenueChart() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-stone-900">
          Platform Revenue
        </h2>

        <p className="mt-1 text-sm text-stone-500">
          Revenue performance across all restaurants.
        </p>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 5,
              right: 5,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="platformRevenue"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#f97316"
                  stopOpacity={0.25}
                />

                <stop
                  offset="100%"
                  stopColor="#f97316"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) =>
                `Rs. ${value / 1000}k`
              }
            />

            <Tooltip
              formatter={(value) => [
                `Rs. ${Number(value).toLocaleString()}`,
                "Revenue",
              ]}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#f97316"
              strokeWidth={3}
              fill="url(#platformRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}