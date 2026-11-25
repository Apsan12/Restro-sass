import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import {
  socketAuthMiddleware,
  AuthenticatedSocket,
} from "./socket.middleware.js";

let io: Server;

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

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

    if (user.restaurantId) {
      const restaurantRoom = `restaurant:${user.restaurantId}`;

      socket.join(restaurantRoom);

      console.log(
        `Socket ${socket.id} joined ${restaurantRoom}`
      );
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