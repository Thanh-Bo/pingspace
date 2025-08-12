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
dotenv.config();

const PORT = process.env.PORT || 5000;

// AFTER: The Correct Configuration
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // Keep this if needed
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }, // Keep this for popups
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Allow scripts from your domain, Google, and inline scripts (needed by Vite/React)
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://accounts.google.com",
          "https://apis.google.com",
        ],
        // Allow styles from your domain and inline styles (needed by Tailwind/Vite)
        styleSrc: ["'self'", "'unsafe-inline'"],
        // *** THIS IS THE FIX FOR YOUR IMAGE PROBLEM ***
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        // Allow connections to your own server (including WebSockets)
        // IMPORTANT: Replace 'https://your-deployed-app.com' with your actual production URL
        connectSrc: [
          "'self'",
          "http://localhost:5000",
          "ws://localhost:5000",
          "wss://pingspace.onrender.com",
        ],
        // Allow Google Sign-In to open its iframe
        frameSrc: ["'self'", "https://accounts.google.com"],
      },
    },
  })
);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.use(cookieParser());
app.use(express.json({ limit: "50mb" })); // or any size you need
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(
  cors({
    origin: ["http://localhost:5173", "https://pingspace.onrender.com"],
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

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
});
server.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port : ", PORT);
});
