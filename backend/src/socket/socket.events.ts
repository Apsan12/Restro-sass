import { getIO } from "./socket.js";

export const emitOrderCreated = (
  restaurantId: string,
  order: unknown
): void => {
  const io = getIO();

  io.to(`restaurant:${restaurantId}`).emit(
    "order:created",
    order
  );
};