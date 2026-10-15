import { Router } from "express";

import {
  createTable,
  getAllTables,
  getTableById,
  updateTable,
  deleteTable,
} from "../controller/table.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { tenantMiddleware } from "../middleware/tenant.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { AccountRole } from "../models/Account.js";

const tableRouter = Router();

// Create table
// BUSINESS_ADMIN only
tableRouter.post(
  "/",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(AccountRole.BUSINESS_ADMIN),
  createTable
);

// Get all tables
// BUSINESS_ADMIN, STAFF, KITCHEN_STAFF
tableRouter.get(
  "/",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(
    AccountRole.BUSINESS_ADMIN,
    AccountRole.STAFF,
    AccountRole.KITCHEN_STAFF
  ),
  getAllTables
);

// Get table by ID
// BUSINESS_ADMIN, STAFF, KITCHEN_STAFF
tableRouter.get(
  "/:tableId",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(
    AccountRole.BUSINESS_ADMIN,
    AccountRole.STAFF,
    AccountRole.KITCHEN_STAFF
  ),
  getTableById
);

// Update table
// BUSINESS_ADMIN only
tableRouter.patch(
  "/:tableId",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(AccountRole.BUSINESS_ADMIN),
  updateTable
);

// Delete table
// BUSINESS_ADMIN only
tableRouter.delete(
  "/:tableId",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(AccountRole.BUSINESS_ADMIN),
  deleteTable
);

export default tableRouter;