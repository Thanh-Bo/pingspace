import User from "../models/auth.model.js";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary";
export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img, video } = req.body;
    // current user logged in
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!text && !img && !video) {
      return res
        .status(400)
        .json({ error: "Post must have text, image, or video" });
    }
    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }
    if (video) {
      const uploadedResponse = await cloudinary.uploader.upload(video, {
        resource_type: "video",
      });
      video = uploadedResponse.secure_url;
    }
    const newPost = new Post({
      user: userId,
      text,
      img,
      video,
    });

    await newPost.save();
    const populatedPost = await Post.findById(newPost._id).populate({
      path: "user",
      select: "fullName profilePic", // select the fields you want
    });
    res.status(200).json(populatedPost);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.log("Error in createPost controller: ", error);
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text, img, video } = req.body;
    // It is the same
    // const { id: postId } = req.params;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text && !img)
      return res
        .status(400)
        .json({ error: "Comments must have text or image" });
    // id post want to comment
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ error: "Post not found" });

    let comment = { user: userId, text };
    // If there's an image, upload it to Cloudinary
    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      comment.img = uploadedResponse.secure_url; // Store the image URL
    }
    if (video) {
      const uploadedResponse = await cloudinary.uploader.upload(video);
      comment.video = uploadedResponse.secure_url; // Store the image URL
    }
    // Add comments in post and save
    post.comments.push(comment);
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate({ path: "user", select: "fullName profilePic" })
      .populate({ path: "comments.user", select: "fullName profilePic" });

    const notification = new Notification({
      from: userId,
      to: post.user,
      type: "comment",
    });
    await notification.save();
    res.status(200).json(populatedPost);
  } catch (error) {
    console.log("Error in commentOnPost controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (posts.length === 0) return res.status(200).json([]);

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getAllPosts controller : ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikedPost = post.likes.includes(userId);
    let Liked = false;
    if (userLikedPost) {
      // Unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      // Satisfy the condition id.toString() !== userId.toString()
      // If not . Cook !
      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      res
        .status(200)
        .json({ message: "Unlike successfully", updatedLikes, Liked: false });
    } else {
      // Like post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      Liked = true;
      await post.save();

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();

      const updatedLikes = post.likes;
      res
        .status(200)
        .json({ message: "Like successfully", updatedLikes, Liked: true });
    }
  } catch (error) {
    console.log("Error in likeUnlikePost controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getUserPosts controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getLikedPost = async (req, res) => {
  const userId = req.params.id;
  try {
    // User you want to see all posts
    const user = await User.findById(userId);

    if (!user) return res.status(400).json({ error: "User not found" });
    // get the list of Posts that the users has liked
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(likedPosts);
  } catch (error) {
    console.log("Error in getLikedPosts controller : ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllFriendPost = async (req, res) => {
  const userId = req.user._id;
  try {
    // User you want to see all posts
    const user = await User.findById(userId);

    if (!user) return res.status(400).json({ error: "User not found" });
    // get the list of Posts that the users has liked
    const allFriendPosts = await Post.find({ user: { $in: user.friends } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(allFriendPosts);
  } catch (error) {
    console.log("Error in getLikedPosts controller : ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
