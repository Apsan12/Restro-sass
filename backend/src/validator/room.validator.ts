import { z } from "zod";

export const createRoomSchema = z.object({
  roomNumber: z.string().trim().min(1).max(50),

  name: z.string().trim().max(100).optional(),

  capacity: z.coerce
    .number()
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1"),

  description: z.string().trim().max(500).optional(),

  amenities: z.array(z.string().trim().min(1)).optional(),

  bookingFee: z.coerce
    .number()
    .min(0, "Booking fee cannot be negative")
    .default(0),

  minimumOrderAmount: z.coerce
    .number()
    .min(0, "Minimum order amount cannot be negative")
    .optional(),
});

export type CreateRoomInput = z.infer<
  typeof createRoomSchema
>;

export const updateRoomSchema = z.object({
  roomNumber: z.string().trim().min(1).max(50).optional(),

  name: z.string().trim().max(100).optional(),

  capacity: z.coerce
    .number()
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1")
    .optional(),

  description: z.string().trim().max(500).optional(),

  amenities: z.array(z.string().trim().min(1)).optional(),

  bookingFee: z.coerce
    .number()
    .min(0, "Booking fee cannot be negative")
    .optional(),

  minimumOrderAmount: z.coerce
    .number()
    .min(0, "Minimum order amount cannot be negative")
    .optional(),

  isActive: z.boolean().optional(),
});

export type UpdateRoomInput = z.infer<
  typeof updateRoomSchema
>;