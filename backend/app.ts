import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRouter from "./src/routes/auth.routes.js";
import restaurantRouter from "./src/routes/restaurant.routes.js";
import staffRouter from "./src/routes/staff.routes.js";
import categoryRouter from "./src/routes/category.routes.js";
import menuItemRouter from "./src/routes/menuItem.routes.js";

const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors());

// Parse JSON
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/restaurants", restaurantRouter);
app.use("/api/v1/staff", staffRouter);
app.use("/api/v1/categories", categoryRouter); 
app.use("/api/v1/menu-items", menuItemRouter);

// Health check
app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Restaurant SaaS API is running",
  });
});

export default app;