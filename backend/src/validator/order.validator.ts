import { z } from "zod";
import { OrderStatus } from "../models/order.js";

export const orderItemSchema = z.object({
  menuItemId: z.string().min(1, "Menu item ID is required"),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),
});

export const createOrderSchema = z
  .object({
    tableId: z.string().min(1, "Table ID is required").optional(),

    roomId: z.string().min(1, "Room ID is required").optional(),

    items: z
      .array(orderItemSchema)
      .min(1, "An order must contain at least one item"),
  })
  .refine(
    (data) => Boolean(data.tableId) !== Boolean(data.roomId),
    {
      message: "An order must have either a table or a room, not both",
      path: ["tableId"],
    }
  );

export type OrderItemInput = z.infer<typeof orderItemSchema>;


export type CreateOrderInput = z.infer<
  typeof createOrderSchema
>;



export const updateOrderStatusSchema = z.object({
  status: z.enum([
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
  ]),
});

export type UpdateOrderStatusInput = z.infer<
  typeof updateOrderStatusSchema
>;