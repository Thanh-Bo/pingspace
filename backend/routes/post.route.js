import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  commentOnPost,
  createPost,
  deletePost,
  getAllFriendPost,
  getAllPosts,
  getLikedPost,
  getUserPosts,
  likeUnlikePost,
} from "../controllers/post.controller.js";

const router = express.Router();
router.get("/all", protectRoute, getAllPosts);
router.post("/create", protectRoute, createPost);
router.delete("/:id", protectRoute, deletePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.get("/likes/:id", protectRoute, getLikedPost);
router.get("/user/:id", protectRoute, getUserPosts);
router.get("/all/friend", protectRoute, getAllFriendPost);
export default router;
