import { Router } from "express";

import {
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
} from "../controller/menuItem.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { tenantMiddleware } from "../middleware/tenant.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { AccountRole } from "../models/Account.js";
import { uploadMenuItemImage } from "../middleware/upload.middleware.js";

const menuItemRouter = Router();

// CREATE MENU ITEM
menuItemRouter.post(
  "/",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(AccountRole.BUSINESS_ADMIN),

  (req, res, next) => {
    uploadMenuItemImage(req, res, (error) => {
      if (error) {
        console.log("========== MULTER ERROR ==========");
        console.log("Error:", error);
        console.log("Field:", (error as any).field);
        console.log("==================================");

        next(error);
        return;
      }

      console.log("========== MULTER SUCCESS ==========");
      console.log("File:", req.file);
      console.log("Body:", req.body);
      console.log("====================================");

      next();
    });
  },

  createMenuItem
);
// GET ALL MENU ITEMS
menuItemRouter.get(
  "/",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(
    AccountRole.BUSINESS_ADMIN,
    AccountRole.STAFF,
    AccountRole.KITCHEN_STAFF
  ),
  getAllMenuItems
);

// GET MENU ITEM BY ID
menuItemRouter.get(
  "/:menuItemId",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(
    AccountRole.BUSINESS_ADMIN,
    AccountRole.STAFF,
    AccountRole.KITCHEN_STAFF
  ),
  getMenuItemById
);

// UPDATE MENU ITEM
menuItemRouter.patch(
  "/:menuItemId",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(AccountRole.BUSINESS_ADMIN),
  uploadMenuItemImage,
  updateMenuItem
);

// DELETE MENU ITEM
menuItemRouter.delete(
  "/:menuItemId",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(AccountRole.BUSINESS_ADMIN),
  deleteMenuItem
);

export default menuItemRouter;