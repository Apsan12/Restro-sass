import mongoose from "mongoose";
import { Order, OrderStatus } from "../models/order.js";
import {
  getPaginationMeta,
  getPaginationParams,
} from "../utils/pagination.js";

export class ReportServiceError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ReportServiceError";
    this.statusCode = statusCode;
  }
}

export interface ReportDateRange {
  startDate: Date;
  endDate: Date;
}

export class ReportService {
  /**
   * Get dashboard statistics.
   *
   * If restaurantId is provided:
   * - Returns statistics for that restaurant only.
   *
   * If restaurantId is not provided:
   * - Returns statistics across all restaurants.
   */
  async getDashboard(restaurantId?: string) {
    const filter: {
      restaurantId?: mongoose.Types.ObjectId;
    } = {};

    if (restaurantId) {
      if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        throw new ReportServiceError(
          "Invalid restaurant ID",
          400
        );
      }

      filter.restaurantId = new mongoose.Types.ObjectId(
        restaurantId
      );
    }

    const [
      totalOrders,
      completedOrders,
      cancelledOrders,
      pendingOrders,
      preparingOrders,
      readyOrders,
      revenueResult,
    ] = await Promise.all([
      Order.countDocuments(filter),

      Order.countDocuments({
        ...filter,
        status: OrderStatus.COMPLETED,
      }),

      Order.countDocuments({
        ...filter,
        status: OrderStatus.CANCELLED,
      }),

      Order.countDocuments({
        ...filter,
        status: OrderStatus.PENDING,
      }),

      Order.countDocuments({
        ...filter,
        status: OrderStatus.PREPARING,
      }),

      Order.countDocuments({
        ...filter,
        status: OrderStatus.READY,
      }),

      Order.aggregate([
        {
          $match: {
            ...filter,
            status: OrderStatus.COMPLETED,
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$totalAmount",
            },
          },
        },
      ]),
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    return {
      totalOrders,
      completedOrders,
      cancelledOrders,
      pendingOrders,
      preparingOrders,
      readyOrders,
      totalRevenue,
    };
  }

  /**
   * Get top-selling menu items.
   *
   * Only COMPLETED orders are included.
   */
  async getTopSellingItems(
    restaurantId?: string,
    page?: string | number,
    limit?: string | number
  ) {
    const filter: {
      restaurantId?: mongoose.Types.ObjectId;
      status: OrderStatus;
    } = {
      status: OrderStatus.COMPLETED,
    };

    if (restaurantId) {
      if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        throw new ReportServiceError(
          "Invalid restaurant ID",
          400
        );
      }

      filter.restaurantId = new mongoose.Types.ObjectId(
        restaurantId
      );
    }

    const {
      page: currentPage,
      limit: currentLimit,
      skip,
    } = getPaginationParams(page, limit);

    const result = await Order.aggregate([
      {
        $match: filter,
      },

      {
        $unwind: "$items",
      },

      {
        $group: {
          _id: "$items.menuItemId",

          itemName: {
            $first: "$items.name",
          },

          totalQuantity: {
            $sum: "$items.quantity",
          },

          totalSales: {
            $sum: "$items.totalPrice",
          },
        },
      },

      {
        $sort: {
          totalQuantity: -1,
        },
      },

      {
        $skip: skip,
      },

      {
        $limit: currentLimit,
      },
    ]);

    const totalResult = await Order.aggregate([
      {
        $match: filter,
      },

      {
        $unwind: "$items",
      },

      {
        $group: {
          _id: "$items.menuItemId",
        },
      },

      {
        $count: "total",
      },
    ]);

    const total =
      totalResult.length > 0
        ? totalResult[0].total
        : 0;

    const pagination = getPaginationMeta(
      currentPage,
      currentLimit,
      total
    );

    return {
      items: result,
      pagination,
    };
  }

  /**
   * Get top-selling categories.
   *
   * MenuItem -> Category lookup is used because
   * OrderItem currently stores menuItemId only.
   */
  async getTopSellingCategories(
    restaurantId?: string,
    page?: string | number,
    limit?: string | number
  ) {
    const filter: {
      restaurantId?: mongoose.Types.ObjectId;
      status: OrderStatus;
    } = {
      status: OrderStatus.COMPLETED,
    };

    if (restaurantId) {
      if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        throw new ReportServiceError(
          "Invalid restaurant ID",
          400
        );
      }

      filter.restaurantId = new mongoose.Types.ObjectId(
        restaurantId
      );
    }

    const {
      page: currentPage,
      limit: currentLimit,
      skip,
    } = getPaginationParams(page, limit);

    const result = await Order.aggregate([
      {
        $match: filter,
      },

      {
        $unwind: "$items",
      },

      {
        $lookup: {
          from: "menuitems",
          localField: "items.menuItemId",
          foreignField: "_id",
          as: "menuItem",
        },
      },

      {
        $unwind: "$menuItem",
      },

      {
        $lookup: {
          from: "categories",
          localField: "menuItem.categoryId",
          foreignField: "_id",
          as: "category",
        },
      },

      {
        $unwind: "$category",
      },

      {
        $group: {
          _id: "$category._id",

          categoryName: {
            $first: "$category.name",
          },

          totalQuantity: {
            $sum: "$items.quantity",
          },

          totalSales: {
            $sum: "$items.totalPrice",
          },
        },
      },

      {
        $sort: {
          totalQuantity: -1,
        },
      },

      {
        $skip: skip,
      },

      {
        $limit: currentLimit,
      },
    ]);

    const totalResult = await Order.aggregate([
      {
        $match: filter,
      },

      {
        $unwind: "$items",
      },

      {
        $lookup: {
          from: "menuitems",
          localField: "items.menuItemId",
          foreignField: "_id",
          as: "menuItem",
        },
      },

      {
        $unwind: "$menuItem",
      },

      {
        $group: {
          _id: "$menuItem.categoryId",
        },
      },

      {
        $count: "total",
      },
    ]);

    const total =
      totalResult.length > 0
        ? totalResult[0].total
        : 0;

    const pagination = getPaginationMeta(
      currentPage,
      currentLimit,
      total
    );

    return {
      categories: result,
      pagination,
    };
  }

  /**
   * Get order statistics grouped by staff.
   *
   * staffId represents the person who created the order.
   */
  async getOrdersByStaff(
    restaurantId?: string,
    page?: string | number,
    limit?: string | number
  ) {
    const filter: {
      restaurantId?: mongoose.Types.ObjectId;
    } = {};

    if (restaurantId) {
      if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        throw new ReportServiceError(
          "Invalid restaurant ID",
          400
        );
      }

      filter.restaurantId = new mongoose.Types.ObjectId(
        restaurantId
      );
    }

    const {
      page: currentPage,
      limit: currentLimit,
      skip,
    } = getPaginationParams(page, limit);

    const result = await Order.aggregate([
      {
        $match: filter,
      },

      {
        $group: {
          _id: "$staffId",

          totalOrders: {
            $sum: 1,
          },

          completedOrders: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    OrderStatus.COMPLETED,
                  ],
                },
                1,
                0,
              ],
            },
          },

          cancelledOrders: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    OrderStatus.CANCELLED,
                  ],
                },
                1,
                0,
              ],
            },
          },

          totalRevenue: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    OrderStatus.COMPLETED,
                  ],
                },
                "$totalAmount",
                0,
              ],
            },
          },
        },
      },

      {
        $lookup: {
          from: "accounts",
          localField: "_id",
          foreignField: "_id",
          as: "staff",
        },
      },

      {
        $unwind: {
          path: "$staff",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 0,
          staffId: "$_id",
          staffName: "$staff.name",
          staffEmail: "$staff.email",
          totalOrders: 1,
          completedOrders: 1,
          cancelledOrders: 1,
          totalRevenue: 1,
        },
      },

      {
        $sort: {
          totalOrders: -1,
        },
      },

      {
        $skip: skip,
      },

      {
        $limit: currentLimit,
      },
    ]);

    const totalResult = await Order.aggregate([
      {
        $match: filter,
      },

      {
        $group: {
          _id: "$staffId",
        },
      },

      {
        $count: "total",
      },
    ]);

    const total =
      totalResult.length > 0
        ? totalResult[0].total
        : 0;

    const pagination = getPaginationMeta(
      currentPage,
      currentLimit,
      total
    );

    return {
      staff: result,
      pagination,
    };
  }

  /**
   * Get revenue report.
   *
   * Only COMPLETED orders contribute to revenue.
   */
  async getRevenueReport(
    restaurantId?: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const match: {
      restaurantId?: mongoose.Types.ObjectId;
      status: OrderStatus;
      createdAt?: {
        $gte?: Date;
        $lt?: Date;
      };
    } = {
      status: OrderStatus.COMPLETED,
    };

    if (restaurantId) {
      if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        throw new ReportServiceError(
          "Invalid restaurant ID",
          400
        );
      }

      match.restaurantId = new mongoose.Types.ObjectId(
        restaurantId
      );
    }

    if (startDate || endDate) {
      match.createdAt = {};

      if (startDate) {
        match.createdAt.$gte = startDate;
      }

      if (endDate) {
        match.createdAt.$lt = endDate;
      }
    }

    const result = await Order.aggregate([
      {
        $match: match,
      },

      {
        $group: {
          _id: null,

          totalOrders: {
            $sum: 1,
          },

          totalRevenue: {
            $sum: "$totalAmount",
          },

          averageOrderValue: {
            $avg: "$totalAmount",
          },
        },
      },
    ]);

    if (result.length === 0) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
      };
    }

    return {
      totalOrders: result[0].totalOrders,
      totalRevenue: result[0].totalRevenue,
      averageOrderValue: result[0].averageOrderValue,
    };
  }
}

export const reportService = new ReportService();