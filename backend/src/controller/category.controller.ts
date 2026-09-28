import { Request, Response } from "express";

import {
  createCategorySchema,
  updateCategorySchema,
} from "../validator/category.validator.js";

import {
  CategoryServiceError,
  categoryService,
} from "../services/category.service.js";
import { getPaginationParams } from "../utils/pagination.js";


// CREATE CATEGORY
export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validation = createCategorySchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      });
      return;
    }

    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context not found",
      });
      return;
    }

    const category = await categoryService.createCategory(
      validation.data,
      restaurantId
    );

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    if (error instanceof CategoryServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Create category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};


// GET ALL CATEGORIES
export const getAllCategories = async (
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

    const { page, limit } = getPaginationParams(
      req.query.page as string,
      req.query.limit as string
    );

    const result =
      await categoryService.getAllCategories(
        restaurantId,
        page,
        limit
      );

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    if (error instanceof CategoryServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error(
      "Get categories error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to retrieve categories",
    });
  }
};
// GET CATEGORY BY ID
export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categoryId = req.params.categoryId as string;
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context not found",
      });
      return;
    }

    if (!categoryId) {
      res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
      return;
    }

    const category = await categoryService.getCategoryById(
      categoryId,
      restaurantId
    );

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: category,
    });
  } catch (error) {
    if (error instanceof CategoryServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Get category by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve category",
    });
  }
};
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categoryId = req.params.categoryId as string;
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context not found",
      });
      return;
    }

    if (!categoryId) {
      res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
      return;
    }

    const validation = updateCategorySchema.safeParse(
      req.body
    );
console.log(validation)
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

    const category = await categoryService.updateCategory(
      categoryId,
      restaurantId,
      validation.data
    );

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    if (error instanceof CategoryServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Update category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categoryId = req.params.categoryId as string;
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        message: "Restaurant context not found",
      });
      return;
    }

    if (!categoryId) {
      res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
      return;
    }

    await categoryService.deleteCategory(
      categoryId,
      restaurantId
    );

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    if (error instanceof CategoryServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Delete category error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};