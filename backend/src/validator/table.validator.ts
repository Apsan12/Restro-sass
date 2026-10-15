import { z } from "zod";

export const createTableSchema = z.object({
  tableNumber: z.string().trim().min(1).max(50),

  name: z.string().trim().max(100).optional(),

  capacity: z.coerce
    .number()
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1"),
});

export type CreateTableInput = z.infer<typeof createTableSchema>;

export const updateTableSchema = z.object({
  tableNumber: z.string().trim().min(1).max(50).optional(),

  name: z.string().trim().max(100).optional(),

  capacity: z.coerce
    .number()
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1")
    .optional(),

  isActive: z.coerce.boolean().optional(),
});

export type UpdateTableInput = z.infer<typeof updateTableSchema>;