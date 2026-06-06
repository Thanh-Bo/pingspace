import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import groupRoutes from "./routes/group.route.js";
import userRoutes from "./routes/user.route.js";
import requestRoutes from "./routes/request.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import { app, server } from "./lib/socket.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const PORT = process.env.PORT || 5000;
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

// Security headers
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com", "https://apis.google.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://lh3.googleusercontent.com"],
        connectSrc: ["'self'", "http://localhost:5000", "ws://localhost:5000", process.env.FRONTEND_URL, process.env.BACKEND_URL].filter(Boolean),
        frameSrc: ["'self'", "https://accounts.google.com"],
      },
    },
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/user", userRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/post", postRoutes);
app.use("/api/notification", notificationRoutes);

// Health check endpoint
app.get("/health", (req, res) => res.json({ status: "ok" }));

server.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port : ", PORT);
});
