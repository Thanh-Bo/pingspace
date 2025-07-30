import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import User from "../models/auth.model.js";
import Group from "../models/group.model.js";
import Message from "../models/message.model.js";

export const getUsersForSideBar = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Get all groups the user is in
    const groups = await Group.find({ members: userId }).lean();

    // 2. Get last message for each group
    const groupChats = await Promise.all(
      groups.map(async (group) => {
        const lastMessage = await Message.findOne({
          groupId: group._id,
          isLastInGroup: true,
        })
          .populate("senderId", "fullName profilePic")
          .lean();

        return {
          _id: group._id,
          isGroup: true,
          groupImage: group.groupImage,
          groupName: group.groupName || "Unnamed Group",
          createdAt: lastMessage ? lastMessage.createdAt : group.createdAt,
          lastMessage: lastMessage || null,
          members: group.members,
        };
      })
    );

    // 3. Get unique one-to-one chat partners efficiently
    // Distinct help removes duplicates from the results
    const senders = await Message.find({ receiverId: userId, groupId: null })
      .distinct("senderId")
      .lean();
    const receivers = await Message.find({ senderId: userId, groupId: null })
      .distinct("receiverId")
      .lean();
    const senderId = senders.map((id) => id.toString());
    const receiverId = receivers.map((id) => id.toString());
    const usersFromMessages = [...new Set([...senderId, ...receiverId])].filter(
      (id) => id.toString() !== userId.toString()
    );
    // Fetch all users in system , excluding the authenticated user
    const allUsers = await User.find({ _id: { $ne: userId } })
      .select("_id fullName profilePic createAt")
      .lean();
    // Convert user id to string
    const allUserIds = allUsers.map((user) => user._id.toString());

    // List users who haven't sent or received messages from authUser
    const usersWithoutMessages = allUserIds.filter(
      (userId) => !usersFromMessages.includes(userId)
    );

    // Combine users with messages and uses without messages
    const allUniqueUsers = [
      ...new Set([...usersFromMessages, ...usersWithoutMessages]),
    ];
    const oneToOneChats = await Promise.all(
      allUniqueUsers.map(async (otherUserId) => {
        const lastMessage = await Message.findOne({
          $or: [
            {
              senderId: userId,
              receiverId: otherUserId,
              isLastInOneToOne: true,
            },
            {
              senderId: otherUserId,
              receiverId: userId,
              isLastInOneToOne: true,
            },
          ],
        })
          .populate("senderId receiverId", "fullName profilePic")
          .lean();

        const otherUser = await User.findById(otherUserId).lean();
        if (!otherUser) return null; // Skip if user not found

        return {
          _id: otherUser._id,
          isGroup: false,
          profilePic: otherUser.profilePic,
          fullName: otherUser.fullName || "Unknown User",
          createdAt: lastMessage ? lastMessage.createdAt : otherUser.createdAt,
          lastMessage: lastMessage || null,
        };
      })
    );

    // 5. Combine and sort chats
    const allChats = [
      ...groupChats,
      ...oneToOneChats.filter((chat) => chat !== null),
    ].sort((a, b) => {
      const timeA = a.lastMessage ? a.lastMessage.createdAt : a.createdAt;
      const timeB = b.lastMessage ? b.lastMessage.createdAt : b.createdAt;
      return new Date(timeB) - new Date(timeA); // Most recent first
    });

    res.status(200).json(allChats);
  } catch (error) {
    console.error("Error in getUsersForSideBar:", {
      message: error.message,
      stack: error.stack,
    });
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, video } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;
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
      receiverId,
      text: text || "",
      image: imageUrl,
      video: videoUrl,
      isLastInOneToOne: true,
    });
    await Message.updateMany(
      {
        $or: [
          { senderId, receiverId, isLastInOneToOne: true },
          {
            senderId: receiverId,
            receiverId: senderId,
            isLastInOneToOne: true,
          },
        ],
        _id: { $ne: newMessage._id },
      },
      { isLastInOneToOne: false }
    );

    await newMessage.save();

    await newMessage.populate("senderId receiverId", "fullName profilePic");

    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { receiverId: senderId, senderId: receiverId },
      ],
    })
      .populate(
        "senderId",
        "fullName profilePic email bio gender dateOfBirth isOnline coverPic"
      )
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
