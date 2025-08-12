import bcrypt from "bcryptjs";
import User from "../models/auth.model.js";
import { v2 as cloudinary } from "cloudinary";
import { getReceiverSocketId, io } from "../lib/socket.js";
export const getUserProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id)
      .select("-password")
      .populate({ path: "friends", select: "_id fullName profilePic" })
      .lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile : ", error.message);
    res.status(500).json({ error: error.message });
  }
};
export const updatedUser = async (req, res) => {
  const {
    email,
    fullName,
    currentPassword,
    newPassword,
    bio,
    gender,
    dateOfBirth,
  } = req.body;
  let { profilePic, coverPic } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    if (
      (!currentPassword && newPassword) ||
      (!newPassword && currentPassword)
    ) {
      return res
        .status(400)
        .json({ error: "Please provide both new and current passwords" });
    }
    if (currentPassword && newPassword) {
      // First argument must be the plain-text password
      // Second argument must be the hashed password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ error: "Current password incorrect" });
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 character" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }
    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(
          user.profilePic.split("/").pop().split(".")[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = uploadedResponse.secure_url;
    }

    if (coverPic) {
      if (user.coverPic) {
        await cloudinary.uploader.destroy(
          user.coverPic.split("/").pop().split(".")[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(coverPic);
      coverPic = uploadedResponse.secure_url;
    }
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail)
        return res.status(400).json({ error: "Email already in use" });
    }
    user.bio = bio || user.bio;
    user.profilePic = profilePic || user.profilePic;
    user.coverPic = coverPic || user.coverPic;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.gender = gender || user.gender;

    user = await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in updateUser : ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const friendLists = await User.findById(userId)
      .select("friends")
      .populate(
        "friends",
        "fullName email profilePic gender dateOfBirth isOnline"
      );

    // Now the friendLists will be an object
    // We have to convert it to array[]
    const friends = friendLists ? friendLists.friends : [];

    return res.status(200).json(friends);
  } catch (error) {
    console.error("Error in getFriends controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeFriends = async (req, res) => {
  try {
    const friendId = req.params.id;
    const userId = req.user._id;

    // Validate user
    if (userId.toString() === friendId.toString()) {
      return res.status(400).json({ error: "Cannot unfriend yourself" });
    }

    // Find both friends
    const currentUser = await User.findById(userId);
    const friendToRemove = await User.findById(friendId);

    if (!currentUser || !friendToRemove) {
      return res.status(404).json({ error: "User or friend not found" });
    }

    // Check if they are actually friends
    if (
      !currentUser.friends.includes(friendId) ||
      !friendToRemove.friends.includes(userId)
    ) {
      return res
        .status(400)
        .json({ error: "You are not friends with this user" });
    }

    // Remove each other using pull
    currentUser.friends.pull(friendId);
    friendToRemove.friends.pull(userId);

    await currentUser.save();
    await friendToRemove.save();

    const friendSocketId = getReceiverSocketId(friendId);
    if (friendSocketId) {
      io.to(friendSocketId).emit("friendRemoved", { userId: userId });
      // Corrected console.log message to use friendId consistently
      console.log(
        `removeFriend: Emitting friendRemoved to ${friendId} (socket: ${friendSocketId})`
      );
    } else {
      // Corrected console.log message to use friendId consistently
      console.log(`removeFriend: Friend ${friendId} is not online.`);
    }
    // 6. Respond to the Current User
    res.status(200).json({
      message: "Friend removed successfully",
      removedFriendId: friendId,
    }); // Use friendId consistently here
  } catch (error) {
    console.error("Error in removeFriend controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const allUserExceptSelf = await User.find({
      _id: { $ne: currentUserId },
    }).select("_id fullName profilePic");
    // if no user found return empty array
    if (!allUserExceptSelf) {
      return res.status(200).json([]);
    }
    res.status(200).json(allUserExceptSelf);
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error in getAllUsers controller:", error.message);
    // Send a 500 Internal Server Error response
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const setSuggestedUsers = async (req, res) => {
  try {
    /// current user id
    const userId = req.user._id;
    // find current user following
    const userFriends = await User.findById(userId).select("friends");
    // find random user (excluding current user)
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);
    // Filter out users the current user is already following
    const filteredUsers = users.filter(
      (user) => !userFriends.friends.includes(user._id)
    );

    const suggestedUsers = filteredUsers.slice(0, 10);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in getSuggestedUsers: ", error.message);
    res.status(500).json({ error: error.message });
  }
};
