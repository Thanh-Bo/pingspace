import express from "express";
import {
  getAllUsers,
  getFriends,
  getUserProfile,
  removeFriends,
  setSuggestedUsers,
  updatedUser,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/profile/:id", protectRoute, getUserProfile);
router.put("/update", protectRoute, updatedUser);
router.get("/friends", protectRoute, getFriends);
router.get("/", protectRoute, getAllUsers);
router.delete("/friends/:id", protectRoute, removeFriends);
router.get("/suggested", protectRoute, setSuggestedUsers);
export default router;
