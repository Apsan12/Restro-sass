import { Request, Response } from "express";

import { createRestaurantSchema } from "../validator/restaurant.validator.js";
import { restaurantService, RestaurantServiceError } from "../services/restaurant.service.js";


export const createRestaurant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // multipart/form-data sends nested objects as JSON strings
    let restaurant;
    let admin;

    try {
      restaurant =
        typeof req.body.restaurant === "string"
          ? JSON.parse(req.body.restaurant)
          : req.body.restaurant;

      admin =
        typeof req.body.admin === "string"
          ? JSON.parse(req.body.admin)
          : req.body.admin;
    } catch {
      res.status(400).json({
        success: false,
        message: "Invalid restaurant or admin data format",
      });
      return;
    }

    const validatedData = createRestaurantSchema.parse({
      restaurant,
      admin,
    });

    const logoBuffer = req.file?.buffer;

    const createdRestaurant =
      await restaurantService.createRestaurant(
        validatedData,
        logoBuffer
      );

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      data: createdRestaurant,
    });
  } catch (error) {
    if (error instanceof RestaurantServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error,
      });
      return;
    }

    console.error("Create restaurant error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};