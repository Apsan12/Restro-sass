import { Router } from "express";

import { createStaff, deleteStaff, getAllStaff, getStaffById, updateStaff } from "../controller/staff.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { AccountRole } from "../models/Account.js";

const staffRouter = Router();

staffRouter.post(
  "/",
  authMiddleware,
  authorizeRoles(AccountRole.BUSINESS_ADMIN),
  createStaff
);
staffRouter.get(
  "/",
  authMiddleware,
  authorizeRoles(AccountRole.BUSINESS_ADMIN),
  getAllStaff
);
staffRouter.get(
  "/:staffId",
  authMiddleware,
  authorizeRoles(AccountRole.BUSINESS_ADMIN),
  getStaffById
);
staffRouter.patch(
  "/:staffId",
  authMiddleware,
  authorizeRoles(AccountRole.BUSINESS_ADMIN),
  updateStaff 
); 

staffRouter.delete(
  "/:staffId",
  authMiddleware,
  authorizeRoles(AccountRole.BUSINESS_ADMIN),
  deleteStaff
);



export default staffRouter;