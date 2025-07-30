import express from "express";
import {
  checkAuth,
  fetchAllUsers,
  goggleLogin,
  login,
  logout,
  signup,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", goggleLogin);
router.post("/logout", logout);
router.get("/check", protectRoute, checkAuth);
router.get("/all", protectRoute, fetchAllUsers);

export default router;
