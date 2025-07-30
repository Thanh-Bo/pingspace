import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  addMembers,
  createGroup,
  deleteGroup,
  getGroupDetails,
  getGroupMessages,
  getUserAllGroups,
  leaveGroup,
  removeMembers,
  sendGroupMessage,
  updateGroupImage,
  updateGroupName,
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.post("/:id/members", protectRoute, addMembers);
router.delete("/:id/members", protectRoute, removeMembers);
router.put("/:id/name", protectRoute, updateGroupName);
router.get("/:id", protectRoute, getGroupDetails);
router.get("/", protectRoute, getUserAllGroups);
router.delete("/:id/leave", protectRoute, leaveGroup);
router.delete("/:id", protectRoute, deleteGroup);
router.get("/:id/messages", protectRoute, getGroupMessages);
router.post("/send", protectRoute, sendGroupMessage);
router.put("/:id/image", protectRoute, updateGroupImage);
export default router;
