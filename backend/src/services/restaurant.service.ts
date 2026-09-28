import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { Account, AccountRole } from "../models/Account.js";
import { Restaurant } from "../models/Restaurant.js";
import { CreateRestaurantInput } from "../validator/restaurant.validator.js";
import { uploadRestaurantLogo } from "./cloudinary.service.js";

export class RestaurantServiceError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "RestaurantServiceError";
    this.statusCode = statusCode;
  }
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export class RestaurantService {
  async createRestaurant(
    data: CreateRestaurantInput,
    logoBuffer?: Buffer
  ) {
    const session = await mongoose.startSession();

    let uploadedLogoPublicId: string | undefined;

    try {
      session.startTransaction();

      // 1. Check whether admin email already exists
      const existingAdmin = await Account.findOne({
        email: data.admin.email,
      }).session(session);

      if (existingAdmin) {
        throw new RestaurantServiceError(
          "An account with this email already exists",
          409
        );
      }

      // 2. Generate restaurant slug
      const slug = generateSlug(data.restaurant.name);

      // 3. Check whether slug already exists
      const existingRestaurant = await Restaurant.findOne({
        slug,
      }).session(session);

      if (existingRestaurant) {
        throw new RestaurantServiceError(
          "A restaurant with this name already exists",
          409
        );
      }

      // 4. Create restaurant
      const restaurant = await Restaurant.create(
        [
          {
            name: data.restaurant.name,
            slug,
            email: data.restaurant.email,
            phone: data.restaurant.phone,
            address: data.restaurant.address,
            isActive: true,
          },
        ],
        { session }
      );

      const createdRestaurant = restaurant[0];

      // 5. Upload logo to Cloudinary
      if (logoBuffer) {
        const uploadResult = await uploadRestaurantLogo(
          logoBuffer,
          createdRestaurant._id.toString()
        );

        uploadedLogoPublicId = uploadResult.public_id;

        createdRestaurant.logo = uploadResult.secure_url;

        await createdRestaurant.save({ session });
      }

      // 6. Hash Business Admin password
      const hashedPassword = await bcrypt.hash(
        data.admin.password,
        12
      );

      // 7. Create BUSINESS_ADMIN
      await Account.create(
        [
          {
            restaurantId: createdRestaurant._id,
            name: data.admin.name,
            email: data.admin.email,
            password: hashedPassword,
            role: AccountRole.BUSINESS_ADMIN,
            isActive: true,
          },
        ],
        { session }
      );

      // 8. Commit transaction
      await session.commitTransaction();

      return {
        id: createdRestaurant._id.toString(),
        name: createdRestaurant.name,
        slug: createdRestaurant.slug,
        email: createdRestaurant.email,
        phone: createdRestaurant.phone,
        address: createdRestaurant.address,
        logo: createdRestaurant.logo,
        isActive: createdRestaurant.isActive,
      };
    } catch (error) {
      await session.abortTransaction();

      // Cloudinary is outside MongoDB transaction,
      // so remove uploaded logo if database operation fails.
      if (uploadedLogoPublicId) {
        try {
          const cloudinary = await import("../config/cloudinary.js");

          await cloudinary.default.uploader.destroy(
            uploadedLogoPublicId
          );
        } catch (cleanupError) {
          console.error(
            "Failed to clean up Cloudinary image:",
            cleanupError
          );
        }
      }

      if (error instanceof RestaurantServiceError) {
        throw error;
      }

      console.error("Restaurant creation failed:", error);

throw new RestaurantServiceError(
  error instanceof Error
    ? error.message
    : "Failed to create restaurant",
  500
);
      
    } finally {
      await session.endSession();
    }
  }
}

export const restaurantService = new RestaurantService();