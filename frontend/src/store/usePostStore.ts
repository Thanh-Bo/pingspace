import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "./useAuthStore";
import { User } from "./useChatStore";

export interface Comment {
  _id: string;
  text: string;
  img?: string;
  video?: string;
  user: {
    _id: string;
    fullName: string;
    profilePic?: string;
  };
  createdAt: string;
}

export interface Post {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    profilePic?: string;
  };
  text: string;
  img?: string;
  video?: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

interface PostStore {
  posts: Post[];
  likedPosts: Post[];
  allFriendPost: Post[];
  userPosts: Post[];
  suggestedUsers: User[];
  isFetchingAllFriendPost: boolean;
  isFetchingAllPosts: boolean;
  isCreatingPost: boolean;
  isDeletingPost: boolean;
  isLikingPost: boolean;
  isCommentingPost: boolean;
  isFetchingUserPosts: boolean;
  isFetchingLikedPosts: boolean;
  isFetchingSuggestUser: boolean;
  fetchAllFriendPost: () => Promise<void>;
  fetchAllPosts: () => Promise<void>;
  createPost: (text: string, img?: string, video?: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  likeUnlikePost: (postId: string) => Promise<void>;
  commentOnPost: (postId: string, text: string, img?: string) => Promise<void>;
  fetchUserPosts: (username: string) => Promise<void>;
  fetchLikedPosts: (userId: string) => Promise<void>;
  fetchSuggestedUsers: () => Promise<void>;
}

export const usePostStore = create<PostStore>((set) => ({
  allFriendPost: [],
  posts: [],
  likedPosts: [],
  userPosts: [],
  suggestedUsers: [],
  isFetchingAllFriendPost: false,
  isFetchingSuggestUser: false,
  isFetchingAllPosts: false,
  isCreatingPost: false,
  isDeletingPost: false,
  isLikingPost: false,
  isCommentingPost: false,
  isFetchingUserPosts: false,
  isFetchingLikedPosts: false,
  fetchSuggestedUsers: async () => {
    set({ isFetchingSuggestUser: true });
    try {
      const res = await axiosInstance.get<User[]>("/user/suggested");
      set({ suggestedUsers: res.data });
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to fetch posts");
    } finally {
      set({ isFetchingSuggestUser: false });
    }
  },
  fetchAllPosts: async () => {
    set({ isFetchingAllPosts: true });
    try {
      const { data } = await axiosInstance.get<Post[]>("/post/all");
      set({ posts: data });
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to fetch posts");
    } finally {
      set({ isFetchingAllPosts: false });
    }
  },

  createPost: async (text, img, video) => {
    set({ isCreatingPost: true });
    const authUser = useAuthStore.getState().authUser;
    if (!authUser) {
      toast.error("You must be logged in to post");
      return;
    }

    try {
      const { data } = await axiosInstance.post<Post>("/post/create", {
        text,
        img,
        video,
      });
      set((state) => ({ posts: [data, ...state.posts] }));
      toast.success("Post created!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      set({ isCreatingPost: false });
    }
  },

  deletePost: async (postId) => {
    set({ isDeletingPost: true });
    try {
      await axiosInstance.delete(`/post/${postId}`);
      set((state) => ({
        posts: state.posts.filter((p) => p._id !== postId),
      }));
      toast.success("Post deleted");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    } finally {
      set({ isDeletingPost: false });
    }
  },

  likeUnlikePost: async (postId) => {
    set({ isLikingPost: true });
    try {
      const { data } = await axiosInstance.post(`/post/like/${postId}`);
      set((state) => ({
        posts: state.posts.map((post) =>
          post._id === postId ? { ...post, likes: data.updatedLikes } : post
        ),
      }));
    } catch (error) {
      console.error("Error like / unlike post:", error);
      toast.error("Failed to update like status");
    } finally {
      set({ isLikingPost: false });
    }
  },

  commentOnPost: async (postId, text, img) => {
    set({ isCommentingPost: true });
    try {
      const { data } = await axiosInstance.post(`/post/comment/${postId}`, {
        text,
        img,
      });
      set((state) => ({
        posts: state.posts.map((post) => (post._id === postId ? data : post)),
      }));
      toast.success("Comment added");
    } catch (error) {
      console.error("Error commenting on post:", error);
      toast.error("Failed to comment");
    } finally {
      set({ isCommentingPost: false });
    }
  },

  fetchUserPosts: async (userId) => {
    set({ isFetchingUserPosts: true });
    try {
      const { data } = await axiosInstance.get<Post[]>(`/post/user/${userId}`);
      set({ userPosts: data });
    } catch (error) {
      console.error("Error fetching user posts:", error);
      toast.error("Failed to fetch user posts");
    } finally {
      set({ isFetchingUserPosts: false });
    }
  },

  fetchLikedPosts: async (userId) => {
    set({ isFetchingLikedPosts: true });
    try {
      const { data } = await axiosInstance.get<Post[]>(`/post/likes/${userId}`);
      set({ likedPosts: data });
    } catch (error) {
      console.error("Error fetching liked posts:", error);
      toast.error("Failed to fetch liked posts");
    } finally {
      set({ isFetchingLikedPosts: false });
    }
  },
  fetchAllFriendPost: async () => {
    set({ isFetchingAllFriendPost: true });
    try {
      const { data } = await axiosInstance.get<Post[]>("/post/all/friend");
      set({ allFriendPost: data });
    } catch (error) {
      console.error("Error fetching liked posts:", error);
      toast.error("Failed to fetch liked posts");
    } finally {
      set({ isFetchingAllFriendPost: false });
    }
  },
}));
