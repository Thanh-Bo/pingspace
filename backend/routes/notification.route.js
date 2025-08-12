import express from "express";
import {
  deleteAllNotifications,
  deleteNotificationsById,
  getNotifications,
} from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getNotifications);
router.delete("/", protectRoute, deleteAllNotifications);
router.delete("/:id", protectRoute, deleteNotificationsById);

export default router;
