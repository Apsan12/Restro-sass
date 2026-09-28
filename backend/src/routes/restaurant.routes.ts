import { Router } from "express";

import { createRestaurant } from "../controller/restaurant.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { uploadRestaurantLogo } from "../middleware/upload.middleware.js";
import { AccountRole } from "../models/Account.js";

const restaurantRouter = Router();

restaurantRouter.post(
  "/",
  authMiddleware,
  authorizeRoles(AccountRole.SUPER_ADMIN),
  uploadRestaurantLogo,
  createRestaurant
);

export default restaurantRouter;