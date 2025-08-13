import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";

interface Notification {
  _id: string;
  from: {
    _id: string;
    fullName: string;
    profilePic?: string;
  };
  to: string;
  type: "like" | "comment";
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationStore {
  unreadCount: number;
  notifications: Notification[];
  isFetchingNotification: boolean;
  isDeletingNotification: boolean;
  isDeletingAllNotification: boolean;
  fetchNotifications: () => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  deleteNotificationById: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isFetchingNotification: false,
  isDeletingNotification: false,
  isDeletingAllNotification: false,

  // Fetch all notifications
  fetchNotifications: async () => {
    try {
      const res = await axiosInstance.get("/notification");
      set({
        notifications: res.data.notifications,
        unreadCount: res.data.unreadCount,
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      set({ isFetchingNotification: false });
    }
  },

  // Delete all notifications
  deleteAllNotifications: async () => {
    try {
      set({ isDeletingAllNotification: true });
      await axiosInstance.delete("/notification");
      set({ notifications: [] });
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    } finally {
      set({ isDeletingAllNotification: false });
    }
  },

  // Delete a single notification
  deleteNotificationById: async (id: string) => {
    try {
      set({ isDeletingNotification: true });
      await axiosInstance.delete(`/notification/${id}`);
      set({
        notifications: get().notifications.filter((n) => n._id !== id),
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    } finally {
      set({ isDeletingNotification: false });
    }
  },
}));
