import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import groupRoutes from "./routes/group.route.js";
import userRoutes from "./routes/user.route.js";
import requestRoutes from "./routes/request.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import { app, server } from "./lib/socket.js";
import path from "path";
dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false, // This is often needed to prevent other issues
  })
);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "client/dist")));

app.use(cookieParser());
app.use(express.json({ limit: "50mb" })); // or any size you need
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/user", userRoutes);
app.use("/api/request", requestRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist", "index.html"));
});
server.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port : ", PORT);
});
