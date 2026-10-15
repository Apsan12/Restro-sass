import { Router } from "express";

import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} from "../controller/room.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { tenantMiddleware } from "../middleware/tenant.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { AccountRole } from "../models/Account.js";

const roomRouter = Router();

// Create room
// BUSINESS_ADMIN only
roomRouter.post(
  "/",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(AccountRole.BUSINESS_ADMIN),
  createRoom
);

// Get all rooms
// BUSINESS_ADMIN, STAFF, KITCHEN_STAFF
roomRouter.get(
  "/",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(
    AccountRole.BUSINESS_ADMIN,
    AccountRole.STAFF,
    AccountRole.KITCHEN_STAFF
  ),
  getAllRooms
);

// Get room by ID
// BUSINESS_ADMIN, STAFF, KITCHEN_STAFF
roomRouter.get(
  "/:roomId",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(
    AccountRole.BUSINESS_ADMIN,
    AccountRole.STAFF,
    AccountRole.KITCHEN_STAFF
  ),
  getRoomById
);

// Update room
// BUSINESS_ADMIN only
roomRouter.patch(
  "/:roomId",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(AccountRole.BUSINESS_ADMIN),
  updateRoom
);

// Delete room
// BUSINESS_ADMIN only
roomRouter.delete(
  "/:roomId",
  authMiddleware,
  tenantMiddleware,
  authorizeRoles(AccountRole.BUSINESS_ADMIN),
  deleteRoom
);

export default roomRouter;
