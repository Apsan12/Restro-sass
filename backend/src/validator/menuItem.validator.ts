import { z } from "zod";

export const createMenuItemSchema = z.object({
  categoryId: z
    .string()
    .min(1, "Category ID is required"),

  name: z
    .string()
    .trim()
    .min(2, "Menu item name must be at least 2 characters")
    .max(100, "Menu item name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  price: z.coerce
    .number()
    .positive("Price must be greater than 0"),

  isAvailable: z
    .preprocess(
      (value) => {
        if (value === undefined) return undefined;

        if (value === "true" || value === true) return true;
        if (value === "false" || value === false) return false;

        return value;
      },
      z.boolean().optional()
    ),
});

export type CreateMenuItemInput = z.infer<
  typeof createMenuItemSchema
>;

export const updateMenuItemSchema = z.object({
  categoryId: z
    .string()
    .min(1, "Category ID is required")
    .optional(),

  name: z
    .string()
    .trim()
    .min(2, "Menu item name must be at least 2 characters")
    .max(100, "Menu item name cannot exceed 100 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  price: z.coerce
    .number()
    .positive("Price must be greater than 0")
    .optional(),

  isAvailable: z
    .preprocess(
      (value) => {
        if (value === undefined) return undefined;

        if (value === "true" || value === true) return true;
        if (value === "false" || value === false) return false;

        return value;
      },
      z.boolean().optional()
    ),
});

export type UpdateMenuItemInput = z.infer<
  typeof updateMenuItemSchema
>;