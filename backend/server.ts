import dotenv from "dotenv";
dotenv.config({ path: "./src/.env" });
import { createServer } from "http";
import app from "./app.js";
import { connectDatabase } from "./src/config/database.js";
import { connectRedis } from "./src/config/redis.js";
import { seedSuperAdmin } from "./src/scripts/seedSuperAdmin.js";
import { initializeSocket } from "./src/socket/socket.js";

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    await connectRedis();
    await seedSuperAdmin();

  const httpServer = createServer(app);

initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Socket.IO server initialized`);
});
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();