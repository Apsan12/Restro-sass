import { Request, Response } from "express";

import {
  createMenuItemSchema,
  updateMenuItemSchema,
} from "../validator/menuItem.validator.js";

import {
  menuItemService,
  MenuItemServiceError,
} from "../services/menuItem.service.js";

export const createMenuItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context is missing",
      });
      return;
    }

    const validatedData = createMenuItemSchema.parse(
      req.body
    );

    const menuItem = await menuItemService.createMenuItem(
      restaurantId,
      validatedData,
      req.file
    );

    res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      data: menuItem,
    });
  } catch (error) {
    if (error instanceof MenuItemServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: "Invalid menu item data",
    });
  }
};

export const getAllMenuItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context is missing",
      });
      return;
    }

    const menuItems = await menuItemService.getAllMenuItems(
      restaurantId
    );

    res.status(200).json({
      success: true,
      message: "Menu items fetched successfully",
      data: menuItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch menu items",
    });
  }
};

export const getMenuItemById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context is missing",
      });
      return;
    }

    const menuItemId = req.params.menuItemId as string;

    const menuItem = await menuItemService.getMenuItemById(
      restaurantId,
      menuItemId
    );

    res.status(200).json({
      success: true,
      message: "Menu item fetched successfully",
      data: menuItem,
    });
  } catch (error) {
    if (error instanceof MenuItemServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch menu item",
    });
  }
};

export const updateMenuItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context is missing",
      });
      return;
    }

    const menuItemId = req.params.menuItemId as string;

    const validatedData = updateMenuItemSchema.parse(
      req.body
    );

    const menuItem = await menuItemService.updateMenuItem(
      restaurantId,
      menuItemId,
      validatedData,
      req.file
    );

    res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      data: menuItem,
    });
  } catch (error) {
    if (error instanceof MenuItemServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: "Invalid menu item data",
    });
  }
};

export const deleteMenuItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context is missing",
      });
      return;
    }

    const menuItemId = req.params.menuItemId as string;

    await menuItemService.deleteMenuItem(
      restaurantId,
      menuItemId
    );

    res.status(200).json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    if (error instanceof MenuItemServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete menu item",
    });
  }
};