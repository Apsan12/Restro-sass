import { Router } from "express";

import { cancelOrder, createOrder, getAllOrders, getOrderById, updateOrderStatus } from "../controller/order.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { tenantMiddleware } from "../middleware/tenant.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

import { AccountRole } from "../models/Account.js";

const orderRouter = Router();

/**
 * Create a new order
 *
 * POST /api/v1/orders
 *
 * BUSINESS_ADMIN and STAFF can create orders.
 *
 * KITCHEN_STAFF cannot create orders.
 * Their responsibility will be handling the kitchen workflow.
 * but oder can be manged in the specific model ways 
 */
orderRouter.post(
  "/",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(
    AccountRole.BUSINESS_ADMIN,
    AccountRole.STAFF
  ),
  createOrder
);
orderRouter.get(
  "/:orderId",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(
    AccountRole.BUSINESS_ADMIN,
    AccountRole.STAFF,
    AccountRole.KITCHEN_STAFF
  ),
  getOrderById
);
orderRouter.patch(
  "/:orderId/status",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(
    AccountRole.BUSINESS_ADMIN,
    AccountRole.KITCHEN_STAFF
  ),
  updateOrderStatus
);
orderRouter.get(
  "/",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(
    AccountRole.BUSINESS_ADMIN,
    AccountRole.STAFF,
    AccountRole.KITCHEN_STAFF
  ),
  getAllOrders
);
orderRouter.post(
  "/:orderId/cancel",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(
    AccountRole.BUSINESS_ADMIN,
    AccountRole.STAFF
  ),
  cancelOrder
);
export default orderRouter;