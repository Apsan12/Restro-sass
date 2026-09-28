import { Request, Response } from "express";

import { createStaffSchema, updateStaffSchema } from "../validator/staff.validator.js";
import {
  StaffServiceError,
  staffService,
} from "../services/staff.service.js";

export const createStaff = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // 1. Validate request body
    const validation = createStaffSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      });
      return;
    }

    // 2. Get restaurant from authenticated user
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context not found",
      });
      return;
    }

    // 3. Call service
    const staff = await staffService.createStaff(
      validation.data,
      restaurantId
    );

    // 4. Send response
    res.status(201).json({
      success: true,
      message: "Staff created successfully",
      data: staff,
    });
  } catch (error) {
    if (error instanceof StaffServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Create staff error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create staff",
    });
  }
};
export const getAllStaff = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context not found",
      });
      return;
    }

    const staff = await staffService.getAllStaff(restaurantId);

    res.status(200).json({
      success: true,
      message: "Staff retrieved successfully",
      data: staff,
    });
  } catch (error) {
    if (error instanceof StaffServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Get staff error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve staff",
    });
  }
};
export const getStaffById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const staffId = req.params.staffId as string;

    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context not found",
      });
      return;
    }

    if (!staffId) {
      res.status(400).json({
        success: false,
        message: "Staff ID is required",
      });
      return;
    }

    const staff = await staffService.getStaffById(
      staffId,
      restaurantId
    );

    res.status(200).json({
      success: true,
      message: "Staff retrieved successfully",
      data: staff,
    });
  } catch (error) {
    if (error instanceof StaffServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Get staff by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve staff",
    });
  }
};
export const updateStaff = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const staffId = req.params.staffId as string;
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context not found",
      });
      return;
    }

    if (!staffId) {
      res.status(400).json({
        success: false,
        message: "Staff ID is required",
      });
      return;
    }

    const validation = updateStaffSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      });
      return;
    }

    if (Object.keys(validation.data).length === 0) {
      res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
      return;
    }

    const staff = await staffService.updateStaff(
      staffId,
      restaurantId,
      validation.data
    );

    res.status(200).json({
      success: true,
      message: "Staff updated successfully",
      data: staff,
    });
  } catch (error) {
    if (error instanceof StaffServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Update staff error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update staff",
    });
  }
};

export const deleteStaff = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const staffId = req.params.staffId as string;
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context not found",
      });
      return;
    }

    if (!staffId) {
      res.status(400).json({
        success: false,
        message: "Staff ID is required",
      });
      return;
    }

    await staffService.deleteStaff(
      staffId,
      restaurantId
    );

    res.status(200).json({
      success: true,
      message: "Staff deleted successfully",
    });
  } catch (error) {
    if (error instanceof StaffServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Delete staff error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete staff",
    });
  }
};