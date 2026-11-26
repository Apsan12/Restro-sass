import { getIO } from "./socket.js";

export const emitOrderCreated = (
  restaurantId: string,
  order: unknown
): void => {
  const io = getIO();

  // General restaurant room
  io.to(`restaurant:${restaurantId}`).emit(
    "order:created",
    order
  );

  // Kitchen room
  io.to(`restaurant:${restaurantId}:kitchen`).emit(
    "kitchen:order_created",
    order
  );
};

export const emitOrderStatusUpdated = (
  restaurantId: string,
  order: unknown
): void => {
  const io = getIO();

  // General restaurant room
  io.to(`restaurant:${restaurantId}`).emit(
    "order:status_updated",
    order
  );

  // Kitchen room
  io.to(`restaurant:${restaurantId}:kitchen`).emit(
    "kitchen:order_status_updated",
    order
  );
};

export const emitOrderCancelled = (
  restaurantId: string,
  order: unknown
): void => {
  const io = getIO();

  // General restaurant room
  io.to(`restaurant:${restaurantId}`).emit(
    "order:cancelled",
    order
  );
};