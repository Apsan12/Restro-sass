import { Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt.js";
import { AccountRole } from "../models/Account.js";

export interface SocketUser {
  userId: string;
  role: AccountRole;
  restaurantId?: string;
}

export interface AuthenticatedSocket extends Socket {
  user?: SocketUser;
}

export const socketAuthMiddleware = (
  socket: AuthenticatedSocket,
  next: (error?: Error) => void
): void => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = verifyAccessToken(token);

    socket.user = {
      userId: decoded.userId,
      role: decoded.role,
      restaurantId: decoded.restaurantId,
    };

    next();
  } catch {
    next(new Error("Invalid or expired access token"));
  }
};