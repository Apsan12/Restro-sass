import dotenv from "dotenv";
dotenv.config({ path: "./src/.env" });

import app from "./app.js";
import { connectDatabase } from "./src/config/database.js";
import { seedSuperAdmin } from "./src/scripts/seedSuperAdmin.js";

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    await seedSuperAdmin();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();