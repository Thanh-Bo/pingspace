import { create } from "zustand";
import { User } from "./useChatStore.ts";
import { axiosInstance } from "@/lib/axios";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

export interface Request {
  _id: string;
  sender: User;
  receiver: User;
  status: "pending" | "accepted" | "cancelled" | "rejected";
  createdAt: string;
  updatedAt: string;
}

interface RequestState {
  pendingRequests: Request[];
  sentRequests: Request[];
  friendsList: User[];
  isLoadingPendingRequests: boolean;
  isLoadingSentRequests: boolean;
  isLoadingFriends: boolean;
  isSendingRequest: boolean;
  isAcceptingRequest: boolean;
  isRejectingRequest: boolean;
  isCancellingRequest: boolean;
  isRemovingFriend: boolean;
  requestError: string | null;

  getPendingRequests: () => Promise<void>;
  getSentRequests: () => Promise<void>;
  sendRequest: (receiverId: string) => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string) => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;
  getFriendsList: () => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
}

export const useRequestStore = create<RequestState>((set, get) => ({
  pendingRequests: [],
  sentRequests: [],
  friendsList: [],
  isLoadingPendingRequests: false,
  isLoadingSentRequests: false,
  isLoadingFriends: false,
  isSendingRequest: false,
  isAcceptingRequest: false,
  isRejectingRequest: false,
  isCancellingRequest: false,
  isRemovingFriend: false,
  requestError: null,

  getPendingRequests: async () => {
    set({ isLoadingPendingRequests: true, requestError: null });
    try {
      const res = await axiosInstance.get("/request/pending");
      set({ pendingRequests: res.data, isLoadingPendingRequests: false });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data.error || "Failed to fetch pending requests";
        toast.error(errorMessage);
        set({ requestError: errorMessage, isLoadingPendingRequests: false });
      }
    }
  },

  getSentRequests: async () => {
    set({ isLoadingSentRequests: true, requestError: null });
    try {
      const res = await axiosInstance.get("/request/sent");
      set({ sentRequests: res.data, isLoadingSentRequests: false });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error || "Failed to fetch sent requests";
        toast.error(errorMessage);
        set({ requestError: errorMessage, isLoadingSentRequests: false });
      }
    }
  },

  sendRequest: async (receiverId: string) => {
    set({ isSendingRequest: true, requestError: null });
    try {
      const res = await axiosInstance.post("/request/send", { receiverId });
      toast.success(res.data.message || "Request sent successfully");
      // It save data in backend  , no need to display in frontend
      // And getSentRequest will take it back from backend and display to frontend
      get().getSentRequests();
      set({ isSendingRequest: false });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error || "Failed to send request";
        toast.error(errorMessage);
        set({ requestError: errorMessage, isSendingRequest: false });
      }
    }
  },

  acceptRequest: async (requestId: string) => {
    set({ isAcceptingRequest: true, requestError: null });
    try {
      const res = await axiosInstance.post(`/request/accept/${requestId}`);
      toast.success(res.data.message || "Request accepted");

      // Refresh shit
      get().getPendingRequests();
      get().getFriendsList();
      set({ isAcceptingRequest: false });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error || "Failed to accept request";
        toast.error(errorMessage);
        set({ requestError: errorMessage, isAcceptingRequest: false });
      }
    }
  },

  rejectRequest: async (requestId: string) => {
    set({ isRejectingRequest: true, requestError: null });
    try {
      const res = await axiosInstance.delete(`/request/reject/${requestId}`);
      toast.success(res.data.message || "Request rejected");

      get().getPendingRequests();
      set({ isRejectingRequest: false });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error || "Failed to reject request";
        toast.error(errorMessage);
        set({ requestError: errorMessage, isRejectingRequest: false });
      }
    }
  },
  cancelRequest: async (requestId: string) => {
    set({ isCancellingRequest: true, requestError: null });
    try {
      const res = await axiosInstance.post(`/request/cancel/${requestId}`);
      toast.success(res.data.message || "Request cancelled");

      get().getSentRequests();
      set({ isCancellingRequest: false });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error || "Failed to cancel request";
        toast.error(errorMessage);
        set({ requestError: errorMessage, isCancellingRequest: false });
      }
    }
  },
  getFriendsList: async () => {
    set({ isLoadingFriends: true, requestError: null });
    try {
      const res = await axiosInstance.get("/user/friends");
      set({ friendsList: res.data, isLoadingFriends: false });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error || "Failed to fetch friends list";
        toast.error(errorMessage);
        set({ requestError: errorMessage, isLoadingFriends: false });
      }
    }
  },
  removeFriend: async (friendId: string) => {
    set({ isRemovingFriend: true, requestError: null });
    try {
      const res = await axiosInstance.delete(`/user/friends/${friendId}`);
      toast.success(res.data.message || "Friend removed successfully");
      get().getFriendsList();
      set({ isRemovingFriend: false });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const errorMessage =
          error.response?.data?.error || "Failed to cancel request";
        toast.error(errorMessage);
        set({ requestError: errorMessage, isCancellingRequest: false });
      }
    }
  },
}));
