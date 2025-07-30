import { axiosInstance } from "@/lib/axios";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { create } from "zustand";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";
export interface User {
  _id: string;
  email: string;
  fullName: string;
  profilePic: string;
  coverPic: string;
  createdAt: string;
  updatedAt: string;
  isOnline: boolean;
  gender: string | null;
  bio: string | null;
  dateOfBirth: Date | null;
  googleId?: string;
}

interface AuthState {
  allUser: User[];
  authUser: User | null;
  isCheckingAuth: boolean;
  isAllUserLoading: boolean;
  isLoggingIn: boolean;
  isSigningUp: boolean;
  socket: Socket | null;
  onlineUsers: string[];
  checkAuth: () => Promise<void>;
  signup: (data: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
  updateProfile: (data: {
    email?: string;
    fullName?: string;
    currentPassword?: string;
    bio?: string;
    newPassword?: string;
    gender?: string;
    dateOfBirth?: Date;
    profilePic?: string;
    coverPic?: string;
  }) => Promise<void>;

  getUserProfile: (userId: string) => Promise<User | null>;
  isRightPanelFullScreenOnMobile: boolean;
  setRightPanelFullScreenOnMobile: (isFullScreen: boolean) => void;
  getAllUser: () => Promise<void>;
  loginWithGoogle: (id_token: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isAllUserLoading: false,
  isLoggingIn: false,
  socket: null,
  allUser: [],
  onlineUsers: [],
  isRightPanelFullScreenOnMobile: false,
  setRightPanelFullScreenOnMobile: (isFullScreen: boolean) => {
    set({ isRightPanelFullScreenOnMobile: isFullScreen });
  },
  loginWithGoogle: async (id_token: string) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/google", { id_token });
      set({ authUser: res.data, isLoggingIn: false });
      toast.success("Logged in with Google");
      get().connectSocket();
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.log(
          "Google Login Error:",
          error.response ? error.response.data : error.message
        );
        toast.error(error?.response?.data.error);
      }
      set({ authUser: null, isLoggingIn: false });
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data, isCheckingAuth: false });
      get().connectSocket();
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.log(
          "Error in checking auth:",
          error.response ? error.response.data : error.message
        );
      }
      set({ authUser: null });
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data: {
    fullName: string;
    email: string;
    password: string;
  }) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data, isSigningUp: false });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.log(
          "Error Response:",
          error.response ? error.response.data : error.message
        );
        toast.error(error?.response?.data.error || "An error occurred");
      }
      set({ authUser: null });
      set({ isSigningUp: false });
    }
  },
  login: async (data: { email: string; password: string }) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data, isLoggingIn: false });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.log(
          "Error Response:",
          error.response ? error.response.data : error.message
        );
        toast.error(error?.response?.data.error || "An error occurred");
      }
      set({ authUser: null });
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.log(
          "Error Response:",
          error.response ? error.response.data : error.message
        );
        toast.error(error?.response?.data.error || "An error occurred");
      }
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;
    const socket = io(SOCKET_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();
    set({ socket: socket });
    socket.on("getOnlineUsers", (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket?.disconnect();
    }
  },
  updateProfile: async (data: {
    email?: string;
    fullName?: string;
    currentPassword?: string;
    newPassword?: string;
    bio?: string;
    gender?: string;
    dateOfBirth?: Date;
    profilePic?: string;
    coverPic?: string;
  }) => {
    try {
      const res = await axiosInstance.put("/user/update", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.log(
          "Error in updateProfile:",
          error.response ? error.response.data : error.message
        );
        toast.error(error?.response?.data.error || "Failed to update profile");
      }
    }
  },
  getUserProfile: async (userId: string) => {
    try {
      const res = await axiosInstance.get(`/user/profile/${userId}`);

      return res.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.log(
          "Error in getUserProfile:",
          error.response ? error.response.data : error.message
        );
        toast.error(
          error?.response?.data.error || "Failed to get user profile"
        );
      }
    }
  },
  getAllUser: async () => {
    set({ isAllUserLoading: true });
    try {
      const res = await axiosInstance.get("/user");
      set({ allUser: res.data });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error(
          "Error fetching all users:",
          error.response?.data?.error || error.message
        );
        toast.error(error.response?.data?.error || "Failed to fetch users.");
      } else {
        console.error(
          "An unexpected error occurred while fetching users:",
          error
        );
        toast.error("An unexpected error occurred.");
      }
    } finally {
      set({ isAllUserLoading: false }); // Set loading to false regardless of success or failure
    }
  },
}));
