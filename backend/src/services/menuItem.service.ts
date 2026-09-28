import mongoose from "mongoose";
import { MenuItem } from "../models/MenuItem.js";
import { Category } from "../models/Category.js";
import {
  CreateMenuItemInput,
  UpdateMenuItemInput,
} from "../validator/menuItem.validator.js";
import {
  uploadMenuItemImageToCloudinary,
  deleteCloudinaryImage,
} from "./cloudinary.service.js";

export class MenuItemServiceError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "MenuItemServiceError";
    this.statusCode = statusCode;
  }
}

export class MenuItemService {
  // CREATE MENU ITEM
  async createMenuItem(
    restaurantId: string,
    data: CreateMenuItemInput,
    file?: Express.Multer.File
  ) {
    if (!mongoose.Types.ObjectId.isValid(data.categoryId)) {
      throw new MenuItemServiceError(
        "Invalid category ID",
        400
      );
    }

    // Make sure the category belongs to this restaurant
    const category = await Category.findOne({
      _id: data.categoryId,
      restaurantId,
    });

    if (!category) {
      throw new MenuItemServiceError(
        "Category not found in this restaurant",
        404
      );
    }

    // Prevent duplicate menu item names in the same category
    const existingMenuItem = await MenuItem.findOne({
      restaurantId,
      categoryId: data.categoryId,
      name: data.name,
    });

    if (existingMenuItem) {
      throw new MenuItemServiceError(
        "A menu item with this name already exists in this category",
        409
      );
    }

    let uploadedPublicId: string | undefined;

    try {
      let image;

      // Upload image if provided
      if (file) {
        const uploadResult =
          await uploadMenuItemImageToCloudinary(
            file.buffer,
            restaurantId
          );

        uploadedPublicId = uploadResult.public_id;

        image = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        };
      }

      // Create menu item
      const menuItem = await MenuItem.create({
        restaurantId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        price: data.price,
        isAvailable: data.isAvailable ?? true,
        image,
      });

      return menuItem;
    } catch (error) {
      // If MongoDB creation fails after Cloudinary upload,
      // remove the uploaded image to prevent orphan files.
      if (uploadedPublicId) {
        try {
          await deleteCloudinaryImage(uploadedPublicId);
        } catch (cleanupError) {
          console.error(
            "Failed to cleanup uploaded Cloudinary image:",
            cleanupError
          );
        }
      }

      throw error;
    }
  }

  // GET ALL MENU ITEMS
  async getAllMenuItems(restaurantId: string) {
    return MenuItem.find({
      restaurantId,
    })
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });
  }

  // GET MENU ITEM BY ID
  async getMenuItemById(
    restaurantId: string,
    menuItemId: string
  ) {
    if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
      throw new MenuItemServiceError(
        "Invalid menu item ID",
        400
      );
    }

    const menuItem = await MenuItem.findOne({
      _id: menuItemId,
      restaurantId,
    }).populate("categoryId", "name");

    if (!menuItem) {
      throw new MenuItemServiceError(
        "Menu item not found",
        404
      );
    }

    return menuItem;
  }

  // UPDATE MENU ITEM
  async updateMenuItem(
    restaurantId: string,
    menuItemId: string,
    data: UpdateMenuItemInput,
    file?: Express.Multer.File
  ) {
    if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
      throw new MenuItemServiceError(
        "Invalid menu item ID",
        400
      );
    }

    const menuItem = await MenuItem.findOne({
      _id: menuItemId,
      restaurantId,
    });

    if (!menuItem) {
      throw new MenuItemServiceError(
        "Menu item not found",
        404
      );
    }

    // If category is being changed,
    // verify that the new category belongs to this restaurant.
    if (data.categoryId) {
      if (!mongoose.Types.ObjectId.isValid(data.categoryId)) {
        throw new MenuItemServiceError(
          "Invalid category ID",
          400
        );
      }

      const category = await Category.findOne({
        _id: data.categoryId,
        restaurantId,
      });

      if (!category) {
        throw new MenuItemServiceError(
          "Category not found in this restaurant",
          404
        );
      }
    }

    // Check duplicate name when name/category changes
    if (data.name || data.categoryId) {
      const existingMenuItem = await MenuItem.findOne({
        _id: { $ne: menuItemId },
        restaurantId,
        categoryId:
          data.categoryId ?? menuItem.categoryId,
        name: data.name ?? menuItem.name,
      });

      if (existingMenuItem) {
        throw new MenuItemServiceError(
          "A menu item with this name already exists in this category",
          409
        );
      }
    }

    let newUploadedPublicId: string | undefined;
    const oldPublicId = menuItem.image?.publicId;

    try {
      // Upload new image if provided
      if (file) {
        const uploadResult =
          await uploadMenuItemImageToCloudinary(
            file.buffer,
            restaurantId
          );

        newUploadedPublicId = uploadResult.public_id;

        menuItem.image = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        };
      }

      // Update normal fields
      if (data.categoryId !== undefined) {
        menuItem.categoryId = new mongoose.Types.ObjectId(
          data.categoryId
        );
      }

      if (data.name !== undefined) {
        menuItem.name = data.name;
      }

      if (data.description !== undefined) {
        menuItem.description = data.description;
      }

      if (data.price !== undefined) {
        menuItem.price = data.price;
      }

      if (data.isAvailable !== undefined) {
        menuItem.isAvailable = data.isAvailable;
      }

      await menuItem.save();

      // Delete old Cloudinary image only AFTER MongoDB succeeds
      if (
        file &&
        oldPublicId &&
        oldPublicId !== newUploadedPublicId
      ) {
        try {
          await deleteCloudinaryImage(oldPublicId);
        } catch (cleanupError) {
          console.error(
            "Failed to delete old Cloudinary image:",
            cleanupError
          );
        }
      }

      return menuItem;
    } catch (error) {
      // MongoDB update failed.
      // Remove newly uploaded image so we don't leave
      // an unused Cloudinary file.
      if (newUploadedPublicId) {
        try {
          await deleteCloudinaryImage(
            newUploadedPublicId
          );
        } catch (cleanupError) {
          console.error(
            "Failed to cleanup new Cloudinary image:",
            cleanupError
          );
        }
      }

      throw error;
    }
  }

  // DELETE MENU ITEM
  async deleteMenuItem(
    restaurantId: string,
    menuItemId: string
  ) {
    if (!mongoose.Types.ObjectId.isValid(menuItemId)) {
      throw new MenuItemServiceError(
        "Invalid menu item ID",
        400
      );
    }

    const menuItem = await MenuItem.findOneAndDelete({
      _id: menuItemId,
      restaurantId,
    });

    if (!menuItem) {
      throw new MenuItemServiceError(
        "Menu item not found",
        404
      );
    }

    // Delete Cloudinary image after MongoDB deletion
    if (menuItem.image?.publicId) {
      try {
        await deleteCloudinaryImage(
          menuItem.image.publicId
        );
      } catch (cleanupError) {
        console.error(
          "Failed to delete Cloudinary image:",
          cleanupError
        );
      }
    }

    return menuItem;
  }
}

export const menuItemService = new MenuItemService();