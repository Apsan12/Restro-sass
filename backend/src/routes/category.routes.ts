import { Router } from "express";

import { createCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from "../controller/category.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { tenantMiddleware } from "../middleware/tenant.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { AccountRole } from "../models/Account.js";

const categoryRouter = Router();

categoryRouter.post(
  "/",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(AccountRole.BUSINESS_ADMIN),
  createCategory
);
categoryRouter.get(
  "/",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(
    AccountRole.BUSINESS_ADMIN,
    AccountRole.STAFF
  ),
  getAllCategories
);
categoryRouter.get(
  "/:categoryId",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(
    AccountRole.BUSINESS_ADMIN,
    AccountRole.STAFF
  ),
  getCategoryById
);
categoryRouter.patch(
  "/:categoryId",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(AccountRole.BUSINESS_ADMIN),
  updateCategory
);
categoryRouter.delete(
  "/:categoryId",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(AccountRole.BUSINESS_ADMIN),
  deleteCategory
);
export default categoryRouter;