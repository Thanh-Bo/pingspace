import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import User from "../models/auth.model.js";
import Group from "../models/group.model.js";
import Message from "../models/message.model.js";
import mongoose from "mongoose";

export const createGroup = async (req, res) => {
  try {
    const { name, membersId, groupImage } = req.body;
    const creatorId = req.user._id;
    if (!name || !membersId || !Array.isArray(membersId)) {
      return res
        .status(400)
        .json({ error: "Group name and members are required" });
    }

    // Validate that at least 2 other members (excluding the admin) are selected
    if (membersId.length < 2) {
      return res.status(400).json({
        error:
          "At least 2 other members (excluding the admin) are required to create a group",
      });
    }

    let imageUrl = groupImage;
    // Group Image
    if (groupImage) {
      const uploadedResponse = await cloudinary.uploader.upload(groupImage);
      imageUrl = uploadedResponse.secure_url;
    }

    // Convert membersId strings to ObjectIds for the database query
    const memberObjectIds = membersId.map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    // Combine the creator's ID with the selected members (creatorId might already be an ObjectId)
    const allMemberIds = [...new Set([...memberObjectIds, creatorId])];
    const validUsers = await User.find({ _id: { $in: allMemberIds } });
    if (validUsers.length !== allMemberIds.length) {
      return res.status(400).json({ error: "Some user IDs are invalid" });
    }

    // Convert all IDs to strings for deduplication with new Set
    const memberIdStrings = membersId.map((id) => id.toString());
    const creatorIdString = creatorId.toString();
    const members = [...new Set([...memberIdStrings, creatorIdString])];
    const admin = creatorId;

    const newGroup = new Group({
      groupName: name,
      members: members,
      admin: admin,
      groupImage: imageUrl,
      lastMessage: null,
    });

    await newGroup.save();

    res.status(201).json(newGroup);
  } catch (error) {
    console.log("Error in createGroup: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const updateGroupImage = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { groupImage } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (!groupImage) {
      return res.status(400).json({ error: "Image is required" });
    }

    // Optionally destroy old image (if stored in Cloudinary)
    if (group.groupImage) {
      try {
        const publicId = group.groupImage.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.warn(
          "Failed to delete old image (may not exist in Cloudinary):",
          err.message
        );
      }
    }

    // Upload new image
    const uploadedResponse = await cloudinary.uploader.upload(groupImage);
    group.groupImage = uploadedResponse.secure_url;

    await group.save();

    res.status(200).json(group);
  } catch (error) {
    console.log("Error in updateGroupImage: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const addMembers = async (req, res) => {
  try {
    const { id: groupId } = req.params; // Group ID from URL
    const { memberIds } = req.body; // Array of user IDs to add

    // Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    // Validate new member IDs
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res
        .status(400)
        .json({ error: "memberIds must be a non-empty array" });
    }
    // Find all users whose _id is in the memberIds array
    const validUsers = await User.find({ _id: { $in: memberIds } });
    if (validUsers.length !== memberIds.length) {
      return res.status(400).json({ error: "Some user IDs are invalid" });
    }

    // Add new members, avoiding duplicates
    const updatedMembers = [...new Set([...group.members, ...memberIds])];
    group.members = updatedMembers;

    await group.save();
    res.status(200).json(group);
  } catch (error) {
    console.log("Error in addMembers: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeMembers = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { memberIds } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (group.admin.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "Only the admin can remove members" });
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res
        .status(400)
        .json({ error: "Members must be a non-empty array" });
    }

    if (memberIds.includes(userId.toString())) {
      return res
        .status(400)
        .json({ error: "Cannot remove the admin from the group" });
    }

    group.members = group.members.filter(
      (member) => memberIds.includes(member.toString()) === false
    );

    if (group.members.length === 0) {
      return res
        .status(400)
        .json({ error: "Group must have at least one member" });
    }

    await group.save();
    const updatedGroup = await Group.findById(groupId)
      .populate("members", "_id fullName profilePic")
      .populate("admin", "_id fullName profilePic");
    res.status(200).json(updatedGroup);
  } catch (error) {
    console.log("Error in removeMembers: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateGroupName = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { name } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (name.trim() === "") {
      return res.status(400).json({ error: "A valid group name is required" });
    }

    group.groupName = name.trim();

    await group.save();

    res.status(200).json(group);
  } catch (error) {
    console.log("Error in updateGroupName: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroupDetails = async (req, res) => {
  try {
    const groupIds = req.params.id;
    const userId = req.user._id;

    const group = await Group.findById(groupIds)
      .populate("members")
      .populate("admin");

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (
      !group.members.some(
        (member) => member._id.toString() === userId.toString()
      )
    ) {
      // if (!group.members.includes(userId.toString()))
      return res
        .status(403)
        .json({ error: "You are not a member of this group" });
    }

    res.status(200).json(group);
  } catch (error) {
    console.log("Error in getGroupDetails: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Get all groups that current user is a member of
export const getUserAllGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ members: userId })
      .populate("members", "fullName")
      .populate("admin", "fullName");

    res.status(200).json(groups);
  } catch (error) {
    console.log("Error in getUserGroup : ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const groupIds = req.params.id;
    const userId = req.user._id;
    // so value group is a object
    const group = await Group.findById(groupIds);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (!group.members.includes(userId.toString())) {
      return res
        .status(403)
        .json({ error: "You are not a member of this group" });
    }

    if (group.admin.toString() === userId.toString()) {
      return res.status(403).json({ error: "Admin cannot leave a group" });
    }
    // .If it’s different, that member stays in the list. If it’s the same, that member gets removed.
    // The filter keeps all member not equal to the userId
    group.members = group.members.filter(
      (member) => member.toString !== userId.toString()
    );

    await group.save();
    res.status(200).json(group);
  } catch (error) {
    console.log("Error in leaveGroup: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const groupIds = req.params.id;
    const userId = req.user._id;

    const group = await Group.findById(groupIds);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only admin can delete the group" });
    }

    await Group.deleteOne({ _id: groupIds });
    res.status(200).json({ message: "Group delete successfully" });
  } catch (error) {
    console.log("Error in deleteGroup: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (!group.members.includes(userId.toString())) {
      return res
        .status(403)
        .json({ error: "You are not a member of this group" });
    }

    const messages = await Message.find({ groupId })
      .populate("senderId", "_id fullName profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getGroupMessages: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const sendGroupMessage = async (req, res) => {
  try {
    const { text, image, video, groupId } = req.body;
    const senderId = req.user._id;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(400).json({ error: "Group ID is invalid " });
    }
    if (!text && !image && !video) {
      return res
        .status(404)
        .json({ error: "Message must contain text or image or video" });
    }

    let imageUrl = ""; // Default to empty string per schema
    let videoUrl = ""; // Default to empty string per schema

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        resource_type: "image",
      });
      imageUrl = uploadResponse.secure_url;
    }

    if (video) {
      const uploadResponse = await cloudinary.uploader.upload(video, {
        resource_type: "video",
      });
      videoUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      groupId,
      text: text || "", // Align with schema default
      image: imageUrl,
      video: videoUrl,
      isLastInGroup: true,
    });
    // Find the previous last message and mark it as not the last message anymore
    await Message.updateOne(
      { groupId, isLastInGroup: true, _id: { $ne: newMessage._id } },
      { isLastInGroup: false }
    );
    await newMessage.save();
    await newMessage.populate("senderId", "fullName profilePic");

    const members = group.members.map((id) => id.toString());
    members.forEach((memberId) => {
      const memberSocketId = getReceiverSocketId(memberId);
      if (memberSocketId) {
        console.log(
          "sendGroupMessage: Emitting to memberId = ",
          memberId,
          "socketId= ",
          memberSocketId
        );
        io.to(memberSocketId).emit("newMessage", newMessage);
      }
    });
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendGroupMessage: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
