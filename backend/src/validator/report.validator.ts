import { z } from "zod";

export const reportPeriodSchema = z.object({
  period: z
    .enum([
      "today",
      "yesterday",
      "this_week",
      "last_week",
      "this_month",
      "last_month",
      "this_year",
    ])
    .default("today"),
});

export type ReportPeriod = z.infer<typeof reportPeriodSchema>;