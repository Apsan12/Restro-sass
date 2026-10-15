import { Request, Response, NextFunction } from "express";
import { AccountRole } from "../models/Account.js";

export const tenantMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  // SUPER_ADMIN can access across all restaurants
  if (req.user.role === AccountRole.SUPER_ADMIN) {
    next();
    return;
  }

  // Restaurant-specific users must have a restaurantId
  if (
    req.user.role === AccountRole.BUSINESS_ADMIN ||
    req.user.role === AccountRole.STAFF ||
    req.user.role === AccountRole.KITCHEN_STAFF
  ) {
    if (!req.user.restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context is missing",
      });
      return;
    }

    next();
    return;
  }

  res.status(403).json({
    success: false,
    message: "Invalid account role",
  });
};

/// tenantMiddleware ensures that the user has the appropriate role and restaurant context to access certain routes.
//  It checks if the user is authenticated and has a valid role (SUPER_ADMIN, BUSINESS_ADMIN, or STAFF). 
// If the user is a BUSINESS_ADMIN or STAFF, it also verifies that they belong to a restaurant. If any of these checks fail, 
// it responds with an appropriate error message and status code.