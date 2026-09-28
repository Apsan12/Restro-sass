import { z } from "zod";

export const createRestaurantSchema = z.object({
  restaurant: z.object({
    name: z
      .string()
      .min(2, "Restaurant name must be at least 2 characters")
      .max(100, "Restaurant name cannot exceed 100 characters")
      .trim(),

    email: z
      .string()
      .email("Invalid restaurant email address")
      .trim()
      .toLowerCase(),

    phone: z
      .string()
      .trim()
      .optional(),

    address: z
      .string()
      .trim()
      .optional(),
  }),

  admin: z.object({
    name: z
      .string()
      .min(2, "Admin name must be at least 2 characters")
      .max(100, "Admin name cannot exceed 100 characters")
      .trim(),

    email: z
      .string()
      .email("Invalid admin email address")
      .trim()
      .toLowerCase(),

    password: z
      .string()
      .min(6, "Admin password must be at least 6 characters"),
  }),
});

export type CreateRestaurantInput = z.infer<
  typeof createRestaurantSchema
>;