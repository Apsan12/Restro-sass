import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import {
  socketAuthMiddleware,
  AuthenticatedSocket,
} from "./socket.middleware.js";
import { AccountRole } from "../models/Account.js";

let io: Server;

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Socket authentication
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    const authenticatedSocket = socket as AuthenticatedSocket;
    const user = authenticatedSocket.user;

    if (!user) {
      socket.disconnect();
      return;
    }

    console.log(
      `Socket connected: ${socket.id} | User: ${user.userId} | Role: ${user.role}`
    );

    /*
     
     * Every restaurant user joins:/ even the admin, staff, and kitchen staff join this room bhaneko matlab 
    each and every user of a restaurant will join this room so that when an order is created or updated, all users of that restaurant will receive the notification.
     * restaurant:{restaurantId}
     */
    if (user.restaurantId) {
      const restaurantRoom = `restaurant:${user.restaurantId}`;

      socket.join(restaurantRoom);

      console.log(
        `Socket ${socket.id} joined ${restaurantRoom}`
      );

      /*
       * Kitchen-specific room it means only the kitchen staff of a restaurant will join this room so that when an order is created or updated, only the kitchen staff will receive the notification.
       *
       * Only KITCHEN_STAFF joins:
       * restaurant:{restaurantId}:kitchen
       */
      if (user.role === AccountRole.KITCHEN_STAFF) {
        const kitchenRoom =
          `restaurant:${user.restaurantId}:kitchen`;

        socket.join(kitchenRoom);

        console.log(
          `Socket ${socket.id} joined ${kitchenRoom}`
        );
      }
    }

    socket.on("disconnect", () => {
      console.log(
        `Socket disconnected: ${socket.id}`
      );
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};