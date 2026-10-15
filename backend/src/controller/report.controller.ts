import { Request, Response } from "express";
import { AccountRole } from "../models/Account.js";
import { OrderStatus } from "../models/order.js";
import { reportService } from "../services/report.service.js";
import {
  getReportDateRange,
  ReportPeriod,
} from "../utils/reportDate.js";

const getRestaurantIdForReport = (req: Request): string | undefined => {
  if (!req.user) {
    return undefined;
  }

  // SUPER_ADMIN can see all restaurants unless
  // a specific restaurantId is provided.
  if (req.user.role === AccountRole.SUPER_ADMIN) {
    const restaurantId = req.query.restaurantId;

    if (typeof restaurantId === "string") {
      return restaurantId;
    }

    return undefined;
  }

  // Restaurant users can only access their own restaurant.
  return req.user.restaurantId;
};

const getPeriod = (req: Request): ReportPeriod => {
  const period = req.query.period;

  if (typeof period !== "string") {
    return "today";
  }

  const validPeriods: ReportPeriod[] = [
    "today",
    "yesterday",
    "this_week",
    "last_week",
    "this_month",
    "last_month",
    "this_year",
  ];

  if (!validPeriods.includes(period as ReportPeriod)) {
    throw new Error("Invalid report period");
  }

  return period as ReportPeriod;
};

export const getDashboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = getRestaurantIdForReport(req);

    const result = await reportService.getDashboard(
      restaurantId
    );

    res.status(200).json({
      success: true,
      message: "Dashboard report fetched successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard report",
    });
  }
};

export const getTopSellingItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = getRestaurantIdForReport(req);

    const result = await reportService.getTopSellingItems(
      restaurantId,
      req.query.page as string,
      req.query.limit as string
    );

    res.status(200).json({
      success: true,
      message: "Top selling items fetched successfully",
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch top selling items",
    });
  }
};

export const getTopSellingCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = getRestaurantIdForReport(req);

    const result =
      await reportService.getTopSellingCategories(
        restaurantId,
        req.query.page as string,
        req.query.limit as string
      );

    res.status(200).json({
      success: true,
      message: "Top selling categories fetched successfully",
      data: result.categories,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch top selling categories",
    });
  }
};

export const getOrdersByStaff = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = getRestaurantIdForReport(req);

    const result = await reportService.getOrdersByStaff(
      restaurantId,
      req.query.page as string,
      req.query.limit as string
    );

    res.status(200).json({
      success: true,
      message: "Staff order report fetched successfully",
      data: result.staff,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch staff order report",
    });
  }
};

export const getRevenueReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = getRestaurantIdForReport(req);

    const period = getPeriod(req);

    const { startDate, endDate } =
      getReportDateRange(period);

    const result = await reportService.getRevenueReport(
      restaurantId,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      message: "Revenue report fetched successfully",
      data: {
        period,
        startDate,
        endDate,
        ...result,
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch revenue report",
    });
  }
};