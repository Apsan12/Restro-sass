import { Request, Response } from "express";

import { createOrderSchema, updateOrderStatusSchema } from "../validator/order.validator.js";
import {
  orderService,
  OrderServiceError,
} from "../services/order.service.js";
import { OrderStatus } from "../models/order.js";

/**
 * Create a new order.
 *
 * POST /api/v1/orders
 */
export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    /*
     * restaurantId comes from the authenticated user's JWT.
     *
     * Staff should NEVER send restaurantId manually.
     */
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context is missing",
      });
      return;
    }

    /*
     * userId comes from the authenticated user's JWT.
     *
     * This becomes the staffId of the order.
     */
    const staffId = req.user?.userId;

    if (!staffId) {
      res.status(401).json({
        success: false,
        message: "Authenticated user information is missing",
      });
      return;
    }

    /*
     * Validate the request body using Zod.
     */
    const validatedData = createOrderSchema.parse(req.body);

    /*
     * Send the validated data to the service layer.
     */
    const order = await orderService.createOrder(
      restaurantId,
      staffId,
      validatedData
    );

    /*
     * Return the newly created order.
     */
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    /*
     * Handle known business errors from OrderService.
     */
    if (error instanceof OrderServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    /*
     * Handle Zod validation errors.
     */
    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    /*
     * Fallback error.
     */
    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
  
};
export const getAllOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context is missing",
      });
      return;
    }

    const page = req.query.page;
    const limit = req.query.limit;
    const status = req.query.status;

    let orderStatus: OrderStatus | undefined;

    if (status) {
      if (
        typeof status !== "string" ||
        !Object.values(OrderStatus).includes(status as OrderStatus)
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
        return;
      }

      orderStatus = status as OrderStatus;
    }

    const result = await orderService.getAllOrders(
      restaurantId,
      typeof page === "string" ? page : undefined,
      typeof limit === "string" ? limit : undefined,
      orderStatus
    );

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    if (error instanceof OrderServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};
export const getOrderById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context is missing",
      });
      return;
    }

    const orderId = req.params.orderId;

    if (Array.isArray(orderId)) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
      return;
    }

    const order = await orderService.getOrderById(
      restaurantId,
      orderId
    );

    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    if (error instanceof OrderServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};
export const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Authenticated user information is missing",
      });
      return;
    }

    const restaurantId = user.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context is missing",
      });
      return;
    }

    const orderId = req.params.orderId;

    if (Array.isArray(orderId)) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
      return;
    }

    const validationResult = updateOrderStatusSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: validationResult.error.issues[0]?.message,
      });
      return;
    }

    const result = await orderService.updateOrderStatus(
      restaurantId,
      orderId,
      validationResult.data.status,
      user.role,
      user.userId
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof OrderServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

export const cancelOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context is missing",
      });
      return;
    }

    const orderId = req.params.orderId;

    if (Array.isArray(orderId)) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
      return;
    }
const user = req.user;

if (!user) {
  res.status(401).json({
    success: false,
    message: "Authenticated user information is missing",
  });
  return;
}
 const order = await orderService.cancelOrder(
  restaurantId,
  orderId,
  req.user!.userId
);

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    if (error instanceof OrderServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
    });
  }
};