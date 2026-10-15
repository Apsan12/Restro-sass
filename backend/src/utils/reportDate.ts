 export type ReportPeriod =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "this_year";

export const getReportDateRange = (
  period: ReportPeriod
): {
  startDate: Date;
  endDate: Date;
} => {
  const now = new Date();

  switch (period) {
    case "today": {
      const startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      return {
        startDate,
        endDate,
      };
    }

    case "yesterday": {
      const endDate = new Date(now);
      endDate.setHours(0, 0, 0, 0);

      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 1);

      return {
        startDate,
        endDate,
      };
    }

    case "this_week": {
      const startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);

      const day = startDate.getDay();

      const diff = day === 0 ? 6 : day - 1;

      startDate.setDate(startDate.getDate() - diff);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);

      return {
        startDate,
        endDate,
      };
    }

    case "last_week": {
      const endDate = new Date(now);
      endDate.setHours(0, 0, 0, 0);

      const day = endDate.getDay();
      const diff = day === 0 ? 6 : day - 1;

      endDate.setDate(endDate.getDate() - diff);

      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 7);

      return {
        startDate,
        endDate,
      };
    }

    case "this_month": {
      const startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

      const endDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
      );

      return {
        startDate,
        endDate,
      };
    }

    case "last_month": {
      const startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

      const endDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

      return {
        startDate,
        endDate,
      };
    }

    case "this_year": {
      const startDate = new Date(
        now.getFullYear(),
        0,
        1
      );

      const endDate = new Date(
        now.getFullYear() + 1,
        0,
        1
      );

      return {
        startDate,
        endDate,
      };
    }

    default:
      throw new Error("Invalid report period");
  }
};