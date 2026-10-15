import { Router } from "express";
import { AccountRole } from "../models/Account.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { tenantMiddleware } from "../middleware/tenant.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

import {
  getDashboard,
  getTopSellingItems,
  getTopSellingCategories,
  getOrdersByStaff,
  getRevenueReport,
} from "../controller/report.controller.js";

const reportRouter = Router();

reportRouter.get(                           
  "/dashboard",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(
    AccountRole.SUPER_ADMIN,
    AccountRole.BUSINESS_ADMIN,
    AccountRole.STAFF,
    AccountRole.KITCHEN_STAFF
  ),
  getDashboard
);

reportRouter.get(
  "/top-items",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(
    AccountRole.SUPER_ADMIN,
    AccountRole.BUSINESS_ADMIN,
    AccountRole.STAFF,
    AccountRole.KITCHEN_STAFF
  ),
  getTopSellingItems
);

reportRouter.get(
  "/top-categories",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(
    AccountRole.SUPER_ADMIN,
    AccountRole.BUSINESS_ADMIN,
    AccountRole.STAFF,
    AccountRole.KITCHEN_STAFF
  ),
  getTopSellingCategories
);

reportRouter.get(
  "/orders-by-staff",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(
    AccountRole.SUPER_ADMIN,
    AccountRole.BUSINESS_ADMIN,
    AccountRole.STAFF,
    AccountRole.KITCHEN_STAFF
  ),
  getOrdersByStaff
);

reportRouter.get(
  "/revenue",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(
    AccountRole.SUPER_ADMIN,
    AccountRole.BUSINESS_ADMIN,
    // AccountRole.STAFF,
    // AccountRole.KITCHEN_STAFF
  ),
  getRevenueReport
);

export default reportRouter;