import { Category } from "../models/Category.js";
import { getPaginationMeta } from "../utils/pagination.js";
import { CreateCategoryInput, UpdateCategoryInput } from "../validator/category.validator.js";

export class CategoryServiceError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "CategoryServiceError";
    this.statusCode = statusCode;
  }
}

export interface CreatedCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  restaurantId: string;
}
export interface GetCategoriesResult {
  data: CreatedCategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export class CategoryService {
  async createCategory(
    data: CreateCategoryInput,
    restaurantId: string
  ): Promise<CreatedCategory> {
    // 1. Make sure restaurant context exists
    if (!restaurantId) {
      throw new CategoryServiceError(
        "Restaurant context is required",
        400
      );
    }

    // 2. Check duplicate category within this restaurant
    const existingCategory = await Category.findOne({
      restaurantId,
      name: data.name,
    });

    if (existingCategory) {
      throw new CategoryServiceError(
        "A category with this name already exists",
        409
      );
    }

    // 3. Create category
    const category = await Category.create({
      restaurantId,
      name: data.name,
      description: data.description,
      isActive: true,
    });

    // 4. Return safe response
    return {
      id: category._id.toString(),
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      restaurantId: category.restaurantId.toString(),
    };
  }
async getAllCategories(
  restaurantId: string,
  page: number,
  limit: number
): Promise<GetCategoriesResult> {
  if (!restaurantId) {
    throw new CategoryServiceError(
      "Restaurant context is required",
      400
    );
  }

  const skip = (page - 1) * limit;

  const [categories, total] = await Promise.all([
    Category.find({ restaurantId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Category.countDocuments({
      restaurantId,
    }),
  ]);

  return {
    data: categories.map((category) => ({
      id: category._id.toString(),
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      restaurantId: category.restaurantId.toString(),
    })),

    pagination: getPaginationMeta(
      page,
      limit,
      total
    ),
  };
}
// GET CATEGORY BY ID
async getCategoryById(
  categoryId: string,
  restaurantId: string
): Promise<CreatedCategory> {
  if (!restaurantId) {
    throw new CategoryServiceError(
      "Restaurant context is required",
      400
    );
  }

  if (!categoryId) {
    throw new CategoryServiceError(
      "Category ID is required",
      400
    );
  }

  const category = await Category.findOne({
    _id: categoryId,
    restaurantId,
  });

  if (!category) {
    throw new CategoryServiceError(
      "Category not found",
      404
    );
  }

  return {
    id: category._id.toString(),
    name: category.name,
    description: category.description,
    isActive: category.isActive,
    restaurantId: category.restaurantId.toString(),
  };
}
async updateCategory(
  categoryId: string,
  restaurantId: string,
  data: UpdateCategoryInput
): Promise<CreatedCategory> {
  if (!restaurantId) {
    throw new CategoryServiceError(
      "Restaurant context is required",
      400
    );
  }

  if (!categoryId) {
    throw new CategoryServiceError(
      "Category ID is required",
      400
    );
  }

  const category = await Category.findOne({
    _id: categoryId,
    restaurantId,
  });

  if (!category) {
    throw new CategoryServiceError(
      "Category not found",
      404
    );
  }

  // Check duplicate name within the same restaurant
  if (data.name && data.name !== category.name) {
    const existingCategory = await Category.findOne({
      restaurantId,
      name: data.name,
      _id: { $ne: categoryId },
    });

    if (existingCategory) {
      throw new CategoryServiceError(
        "A category with this name already exists",
        409
      );
    }
  }

  if (data.name !== undefined) {
    category.name = data.name;
  }

  if (data.description !== undefined) {
    category.description = data.description;
  }

  if (data.isActive !== undefined) {
    category.isActive = data.isActive;
  }

  await category.save();

  return {
    id: category._id.toString(),
    name: category.name,
    description: category.description,
    isActive: category.isActive,
    restaurantId: category.restaurantId.toString(),
  };
}
async deleteCategory(
  categoryId: string,
  restaurantId: string
): Promise<void> {
  if (!restaurantId) {
    throw new CategoryServiceError(
      "Restaurant context is required",
      400
    );
  }

  if (!categoryId) {
    throw new CategoryServiceError(
      "Category ID is required",
      400
    );
  }

  const category = await Category.findOne({
    _id: categoryId,
    restaurantId,
  });

  if (!category) {
    throw new CategoryServiceError(
      "Category not found",
      404
    );
  }

  await category.deleteOne();
}
}

export const categoryService = new CategoryService(); 