import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "@/lib/axios";
import { AxiosError } from "axios";
import { useAuthStore } from "./useAuthStore";
import { Socket } from "socket.io-client";

export interface User {
  _id: string;
  email: string;
  fullName: string;
  profilePic: string;
  coverPic: string;
  createdAt: string;
  updatedAt: string;
  gender: string | null;
  bio: string | null;
  dateOfBirth: Date | null;
}

export interface Message {
  _id: string;
  senderId: User | string;
  sender: { _id: string; fullName: string; profilePic: string };
  receiverId: User;
  groupId: string | null;
  text: string;
  image: string;
  video: string;

  createdAt: string;
  updatedAt: string;
  isLastInGroup?: boolean;
  isLastInOneToOne?: boolean;
}

export interface Group {
  _id: string;
  groupName: string;
  members: User[];
  admin: User;
  groupImage: string | null;
  createdAt: string;
}
export interface Chat {
  _id: string;
  isGroup: boolean;
  groupName?: string;
  createdAt: string;
  lastMessage: Message | null;
  coverPic: string;
  profilePic: string;
  fullName: string;
  groupImage: string | null;
  admin: string;
  members: User[];
  email?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  updatedAt?: string;
  isOnline?: boolean;
}
interface ChatStore {
  messages: Message[];
  groups: Group[];
  chats: Chat[];
  selectedChat: Chat | null;
  socket: Socket | null;

  isUsersLoading: boolean;
  isGroupsLoading: boolean;
  isMessagesLoading: boolean;
  subscribeFromMessage: () => void;
  unsubscribeFromMessage: () => void;
  getChats: () => Promise<void>;
  getMessages: (userId: string, isGroup?: boolean) => Promise<void>;
  sendMessage: (messageData: {
    text?: string;
    image?: string;
    video?: string;
  }) => Promise<void>;
  fetchGroups: () => Promise<void>;
  setSelectedChat: (chat: Chat | null) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  messages: [],
  users: [],
  groups: [],
  socket: null,
  selectedChat: null,
  isGroupsLoading: false,
  isUsersLoading: false,
  isMessagesLoading: false,
  fetchGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/group");
      set({ groups: res.data });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error(
          "Error in fetchGroups (useChatStore):",
          error.response?.data?.error || error.message
        );
        toast.error(error.response?.data?.error || "Failed to fetch groups.");
      } else {
        console.error(
          "An unexpected error occurred while fetching groups:",
          error
        );
        toast.error("An unexpected error occurred.");
      }
    } finally {
      set({ isGroupsLoading: false });
    }
  },
  getChats: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get<Chat[]>("/message/users/sidebar");
      set({
        chats: res.data,
        isUsersLoading: false,
      });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.log(
          "Error in getUsers chat store:",
          error.response ? error.response.data : error.message
        );
        toast.error(error?.response?.data.error || "An error occurred");
      }
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId: string, isGroup: boolean = false) => {
    set({ isMessagesLoading: true });
    try {
      // Determine the API endpoint based on whether the chat is a group or one to one
      const endpoint = isGroup
        ? `/group/${userId}/messages`
        : `/message/${userId}`;
      // Take the value  from backend getMessage
      const res = await axiosInstance.get<Message[]>(endpoint);
      const normalizedMessages = res.data.map((msg) => ({
        ...msg,
        sender:
          typeof msg.senderId !== "string"
            ? {
                _id: msg.senderId._id,
                fullName: msg.senderId.fullName,
                profilePic: msg.senderId.profilePic || "",
              }
            : { _id: msg.senderId, fullName: "Unknown", profilePic: "" },
        // sender on the right and received on the left use in chat bubble.
        senderId:
          typeof msg.senderId === "string"
            ? msg.senderId
            : msg.senderId?._id?.toString(),
      }));
      set({ messages: normalizedMessages, isMessagesLoading: false });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.log("Error in getMessages:", error);
        const msg =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch messages";
        toast.error(msg);
      }
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData: {
    text?: string;
    image?: string;
    video?: string;
  }) => {
    // Get the authenticated user
    const authUser = useAuthStore.getState().authUser;
    // Check if the authenticated user exists
    if (!authUser) {
      console.error("No auth user");
      return;
    }
    // Get the current state value
    const { selectedChat, messages, chats } = get();
    // Check if chat is selected
    if (!selectedChat) return;
    try {
      // Determine if select group chat
      const isGroup = selectedChat.isGroup;
      // Set the API endpoint based on that
      const endpoint = isGroup
        ? `/group/send`
        : `/message/send/${selectedChat._id}`;
      // Value to send with endpoint
      const payload = {
        ...messageData,
        senderId: authUser._id,
        groupId: isGroup ? selectedChat._id : undefined,
      };
      const res = await axiosInstance.post<Message>(endpoint, payload);
      const newMessage = {
        ...res.data,
        senderId: authUser._id,
        sender: {
          _id: authUser._id,
          fullName: authUser.fullName,
          profilePic: authUser.profilePic,
        },
      };
      // Update chats for sender to reflect the new last message
      set({
        messages: [...messages, newMessage],
        chats: chats
          .map((chat) =>
            chat._id === selectedChat._id
              ? { ...chat, lastMessage: newMessage }
              : chat
          )

          .sort(
            (a, b) =>
              new Date(b.lastMessage!.createdAt).getTime() -
              new Date(a.lastMessage!.createdAt).getTime()
          ),
      });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.log(
          "Error in sendMessages chat store:",
          error.response ? error.response.data : error.message
        );
        toast.error(error?.response?.data.error || "An error occurred");
      }
    }
  },
  subscribeFromMessage: () => {
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    if (!socket || !authUser)
      return console.error("Socket or user not initialized");

    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      console.log("Received via socket:", newMessage);

      const { selectedChat, messages, chats } = get();
      const authUserId = authUser._id;

      const senderId =
        typeof newMessage.senderId === "string"
          ? newMessage.senderId
          : newMessage.senderId._id;
      const receiverId =
        typeof newMessage.receiverId === "string"
          ? newMessage.receiverId
          : newMessage.receiverId?._id;

      const chatId =
        newMessage.groupId ||
        (receiverId === authUserId ? senderId : receiverId);

      if (!chatId || messages.some((m) => m._id === newMessage._id)) return;

      const senderChat = chats.find((chat) => chat._id === senderId);
      const normalizedMessage = {
        ...newMessage,
        senderId: senderId || "unknown",
        sender: senderChat
          ? {
              _id: senderId,
              fullName: senderChat.fullName,
              profilePic: senderChat.profilePic,
            }
          : { _id: senderId, fullName: "Unknown", profilePic: "" },
      };

      const updatedChats = chats
        .map((chat) =>
          chat._id === chatId
            ? {
                ...chat,
                lastMessage: normalizedMessage,
                createdAt: normalizedMessage.createdAt,
              }
            : chat
        )
        .sort(
          (a, b) =>
            new Date(b.lastMessage?.createdAt || 0).getTime() -
            new Date(a.lastMessage?.createdAt || 0).getTime()
        );

      const updatedMessages =
        selectedChat?._id === chatId
          ? [...messages, normalizedMessage]
          : messages;

      // Ensure selectedChat is synced if message is for it

      set({
        messages: updatedMessages,
        chats: updatedChats,
      });
    });
  },

  unsubscribeFromMessage: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },

  setSelectedChat: (chat: Chat | null) => set({ selectedChat: chat }),
}));
