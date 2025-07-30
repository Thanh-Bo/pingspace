import toast from "react-hot-toast";
import { create } from "zustand";
import { AxiosError } from "axios";
import { useAuthStore } from "./useAuthStore";
import { axiosInstance } from "@/lib/axios";
import { Group, useChatStore } from "./useChatStore";

// Define the Group interface based on the backend Group model

// Define the state and actions for the group store
interface GroupStore {
  userGroups: Group[];
  isLoadingUserGroups: boolean;
  selectedGroup: Group | null;
  isGroupLoading: boolean;
  isLoadingGroupImage: boolean;
  createGroup: (
    name: string,
    membersId: string[],
    groupImage?: string
  ) => Promise<void>;
  addMemberGroup: (groupId: string, membersId: string[]) => Promise<void>;
  removeMemberGroup: (groupId: string, membersId: string[]) => Promise<void>;
  updateGroupName: (groupId: string, name: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  fetchUserGroup: (groupId: string) => Promise<void>;
  fetchUserAllGroup: () => Promise<void>;
  setSelectedGroup: (group: Group | null) => void;
  updateGroupImage: (groupImage: string, groupId: string) => Promise<void>;
}

export const useGroupStore = create<GroupStore>((set, get) => ({
  userGroups: [],
  isLoadingGroupImage: false,
  isLoadingUserGroups: false,
  // Initial state
  selectedGroup: null,
  isGroupLoading: false,
  setSelectedGroup: (group) => set({ selectedGroup: group }),
  updateGroupImage: async (groupImage: string, groupId: string) => {
    const authUser = useAuthStore.getState().authUser;
    if (!authUser) {
      toast.error("User not authenticated");
      return;
    }

    set({ isLoadingGroupImage: true });
    try {
      const response = await axiosInstance.put<Group>(
        `/group/${groupId}/image`,
        { groupImage }
      );
      const updated = response.data;
      const { groups, chats } = useChatStore.getState();

      const updateImage = groups.map((group) =>
        group._id === groupId ? updated : group
      );
      const updateChat = chats.map((chat) =>
        chat._id === groupId
          ? { ...chat, groupImage: updated.groupImage }
          : chat
      );
      useChatStore.setState({
        groups: updateImage,
        chats: updateChat,
      });
      const newSelectedChat = updateChat.find((chat) => chat._id === groupId);
      if (newSelectedChat) {
        useChatStore.getState().setSelectedChat(newSelectedChat);
      }

      toast.success("Update group image successfully");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.error || "Failed to update group image"
        );
        console.log("Error in updateGroupImage: ", error.response?.data);
      } else {
        toast.error("An unexpected error occurred");
        console.log("Error in updateGroupImage: ", error);
      }
    }
  },
  // Function to create new group
  createGroup: async (
    name: string,
    membersId: string[],
    groupImage?: string
  ) => {
    const authUser = useAuthStore.getState().authUser;
    if (!authUser) {
      toast.error("User not authenticated");
      return;
    }

    set({ isGroupLoading: true });
    try {
      const response = await axiosInstance.post<Group>("/group/create", {
        name,
        membersId: membersId,
        groupImage,
      });
      const newGroup = response.data;
      console.log(newGroup);
      // Update the groups and chats in useChatStore
      const { groups, chats } = useChatStore.getState();
      const updateGroups = [...groups, newGroup];
      // Update chat for sidebar
      const newChat = {
        _id: newGroup._id,
        groupName: newGroup.groupName,
        createdAt: newGroup.createdAt || new Date().toISOString(),
        groupImage: newGroup.groupImage || "",
        lastMessage: null,
        isGroup: true,
        profilePic: "",
        fullName: "",
        members: newGroup.members,
        coverPic: "", // or newGroup.coverPic if available
        admin: newGroup.admin._id,
      };
      const updatedChats = [...chats, newChat];
      // Update useChatStore state
      useChatStore.setState({
        groups: updateGroups,
        chats: updatedChats.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      });
      set({
        selectedGroup: newGroup,
        userGroups: [...get().userGroups, newGroup],
      });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.error);
        console.log(
          "Error in createGroup group store : ",
          error.response?.data
        );
      }
    } finally {
      set({ isGroupLoading: false });
    }
  },
  addMemberGroup: async (groupId: string, memberIds: string[]) => {
    // Implement addMemberGroup functionality
    set({ isGroupLoading: true });
    try {
      /// Add members the group via backendd
      const response = await axiosInstance.post<Group>(
        `/group/${groupId}/members`,
        { memberIds }
      );
      const updatedGroup = response.data;
      const { groups } = useChatStore.getState();
      // Update member group after add members
      const updatedGroups = groups.map((group) =>
        group._id === groupId ? updatedGroup : group
      );

      useChatStore.setState({
        groups: updatedGroups,
      });
      set({ selectedGroup: updatedGroup, userGroups: updatedGroups });
      toast.success("Members added successfully");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.error || "Failed to add members");
        console.log("Error in addMemberGroup: ", error.response?.data);
      } else {
        toast.error("An unexpected error occurred");
        console.log("Error in addMemberGroup: ", error);
      }
    } finally {
      set({ isGroupLoading: false });
    }
  },
  removeMemberGroup: async (groupId: string, memberIds: string[]) => {
    // Implement removeMemberGroup functionality
    set({ isGroupLoading: true });
    try {
      const response = await axiosInstance.delete(`/group/${groupId}/members`, {
        data: { memberIds },
      });

      /// Take data
      const updatedGroup = response.data;
      const { groups } = useChatStore.getState();
      // Updated group after remove members
      const updatedGroups = groups.map((group) =>
        group._id === groupId ? updatedGroup : group
      );

      // Update sidebar
      useChatStore.setState({
        groups: updatedGroups,
      });
      set({ selectedGroup: updatedGroup, userGroups: updatedGroups });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.error || "Failed to add members");
        console.log("Error in removeMemberGroup: ", error.response?.data);
      } else {
        toast.error("An unexpected error occurred");
        console.log("Error in removeMemberGroup: ", error);
      }
    } finally {
      set({ isGroupLoading: false });
    }
  },
  updateGroupName: async (groupId: string, name: string) => {
    // Implement updateGroupName functionality
    try {
      const response = await axiosInstance.put(`/group/${groupId}/name`, {
        name,
      });

      const updated = response.data;
      const { groups, chats } = useChatStore.getState();
      const updatedName = groups.map((group) =>
        group._id === groupId ? updated : group
      );

      const updateChats = chats.map((chat) =>
        chat._id === groupId ? { ...chat, groupName: updated.groupName } : chat
      );

      useChatStore.setState({
        groups: updatedName,
        chats: updateChats,
      });

      // Fix to update name immediately in header right panel
      const newSelectedChat = updateChats.find((chat) => chat._id === groupId);
      if (newSelectedChat) {
        useChatStore.getState().setSelectedChat(newSelectedChat);
      }

      toast.success("Group name updated successfully");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.error || "Failed to add members");
        console.log("Error in updateNameGroup: ", error.response?.data);
      } else {
        toast.error("An unexpected error occurred");
        console.log("Error in updateNameGroup: ", error);
      }
    }
  },
  leaveGroup: async (groupId: string) => {
    // Implement leaveGroup functionality
    const authUser = useAuthStore.getState().authUser;
    if (!authUser) {
      toast.error("User not authenticated");
      return;
    }
    set({ isGroupLoading: true });
    try {
      // Check if the user is the admin
      const { groups, chats } = useChatStore.getState();
      const group = groups.find((g) => g._id === groupId);
      if (!group) {
        toast.error("Group not found");
        return;
      }
      if (group.admin?._id == authUser._id) {
        toast.error(
          "Admin can't leave the group . Please deleted the group instead"
        );
        return;
      }
      // Make the request to backend to leave the group
      const response = await axiosInstance.delete(`/group/${groupId}/leave`);

      const updatedGroup = response.data;

      // If the user was the last member , the group might be deleted
      if (!updatedGroup) {
        // Group was deleted (e.g., last member left)
        const updatedGroups = groups.filter((group) => group._id !== groupId);
        const updatedChats = chats.filter((chat) => chat._id !== groupId);

        useChatStore.setState({
          groups: updatedGroups,
          chats: updatedChats,
        });
        set({ selectedGroup: null });
      } else {
        // Updated groups and chats with the new members list
        const updatedGroups = groups.map((group) =>
          group._id === groupId ? updatedGroup : group
        );
        // Remove the chat from sidebar since member left
        const updatedChats = chats.filter((chat) => chat._id !== groupId);
        useChatStore.setState({
          groups: updatedGroups,
          chats: updatedChats,
        });
        set({ selectedGroup: null });
      }
      toast.success("You have left the group successfully");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.error || "Failed to leave group");
        console.log("Error in leaveGroup: ", error.response?.data);
      } else {
        toast.error("An unexpected error occurred");
        console.log("Error in leaveGroup: ", error);
      }
    } finally {
      set({ isGroupLoading: false });
    }
  },
  deleteGroup: async (groupId: string) => {
    // Implement deleteGroup functionality
    const authUser = useAuthStore.getState().authUser;
    if (!authUser) {
      toast.error("User not authenticated");
      return;
    }

    set({ isGroupLoading: true });

    try {
      const { groups, chats } = useChatStore.getState();

      const group = groups.find((group) => group._id === groupId);

      if (!group) {
        toast.error("Group not found");
        return;
      }

      if (group?.admin?._id !== authUser._id) {
        toast.error("Only the admin can deleted the group");
        return;
      }

      // Make request to backend to delete the group
      await axiosInstance.delete(`/group/${groupId}`);

      const updatedGroups = groups.filter((group) => group._id !== groupId);
      const updatedChats = chats.filter((chat) => chat._id !== groupId);

      useChatStore.setState({
        groups: updatedGroups,
        chats: updatedChats,
      });
      set({
        selectedGroup: null,
        userGroups: get().userGroups.filter((g) => g._id !== groupId),
      });
      toast.success("Group deleted successfully");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.error || "Failed to delete group");
        console.log("Error in deleteGroup: ", error.response?.data);
      } else {
        toast.error("An unexpected error occurred");
        console.log("Error in deleteGroup: ", error);
      }
    } finally {
      set({ isGroupLoading: false });
    }
  },
  // Group detail
  fetchUserGroup: async (groupId: string) => {
    set({ isGroupLoading: true }); // Start loading
    try {
      const response = await axiosInstance.get<Group>(`/group/${groupId}`);
      const fetchedGroup = response.data; // Get the actual group data from the response

      // Update the selectedGroup state in *this* useGroupStore
      set({ selectedGroup: fetchedGroup });
    } catch (error: unknown) {
      // Handle any errors that occur during the fetch operation
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.error || "Failed to fetch group details"
        );
        console.log("Error in fetchUserGroup: ", error.response?.data);
      } else {
        toast.error("An unexpected error occurred");
        console.log("Error in fetchUserGroup : ", error);
      }
    } finally {
      set({ isGroupLoading: false }); // Always stop loading, whether successful or not
    }
  },
  fetchUserAllGroup: async () => {
    set({ isGroupLoading: true }); // Start loading
    try {
      const response = await axiosInstance.get<Group[]>(`/group`);

      // Update the selectedGroup state in *this* useGroupStore
      set({ userGroups: response.data });
    } catch (error: unknown) {
      // Handle any errors that occur during the fetch operation
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.error || "Failed to fetch group details"
        );
        console.log("Error in fetchUserGroup: ", error.response?.data);
      } else {
        toast.error("An unexpected error occurred");
        console.log("Error in fetchUserGroup : ", error);
      }
    } finally {
      set({ isGroupLoading: false }); // Always stop loading, whether successful or not
    }
  },
}));
