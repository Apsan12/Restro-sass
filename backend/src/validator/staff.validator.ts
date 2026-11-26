import { z } from "zod";
import { AccountRole } from "../models/Account.js";

export const createStaffSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password cannot exceed 100 characters"),

  role: z.enum([
    AccountRole.STAFF,
    AccountRole.KITCHEN_STAFF,
  ]),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;

export const updateStaffSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address")
    .optional(),

  role: z
    .enum([
      AccountRole.STAFF,
      AccountRole.KITCHEN_STAFF,
    ])
    .optional(),
});

export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;