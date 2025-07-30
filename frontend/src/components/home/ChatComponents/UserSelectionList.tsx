// src/components/chat/UserList.tsx (Modification)

import { axiosInstance } from "@/lib/axios";
import { User } from "@/store/useChatStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Or your actual Avatar import
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// Define the User interface based on the backend User model
// Ensure this User interface is comprehensive for display purposes

interface UserSelectionListProps {
  mode: "add" | "remove";
  selectedUsers: string[];
  onSelectionChange: (selectedUsers: string[]) => void;
  excludeUserIds?: string[];
  usersToDisplay?: User[];
}

const UserSelectionList = ({
  selectedUsers,
  onSelectionChange,
  excludeUserIds,
  usersToDisplay,
  mode,
}: UserSelectionListProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(true);

  useEffect(() => {
    setIsFetchingUsers(true);
    // For remove members
    if (mode === "remove" && usersToDisplay) {
      setUsers(usersToDisplay);
      setIsFetchingUsers(false);
    }
    // For add members
    else if (mode === "add") {
      // Otherwise, fetch all user
      const fetchUsers = async () => {
        try {
          setIsFetchingUsers(true);
          const allUser = await axiosInstance.get<User[]>("/auth/all");
          setUsers(allUser.data);
        } catch (error) {
          toast.error("Failed to load user");
          console.log("Error fetching all user ", error);
        } finally {
          setIsFetchingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [mode, usersToDisplay]);

  if (isFetchingUsers) {
    return <p className="text-sm text-muted-foreground">Loading users...</p>;
  }

  let filterUsers = users;
  // Remove excludeUser (add is currentMembers || remove is group.admin)
  if (excludeUserIds && excludeUserIds.length > 0) {
    filterUsers = users.filter((user) => !excludeUserIds.includes(user._id));
  }

  if (filterUsers.length === 0) {
    return <p className="text-sm text-muted-foreground">No users found.</p>;
  }

  return (
    <div className="flex flex-col gap-2 overflow-auto max-h-60">
      {filterUsers.map((user) => {
        const isSelected = selectedUsers.includes(user._id);

        return (
          <div
            key={user._id}
            className={`flex gap-3 items-center p-2 rounded cursor-pointer
                            transition-all ease-in-out duration-300
                            hover:bg-chat-hover
                            ${isSelected ? "bg-chat-hover" : ""}
                        `}
            onClick={() => {
              if (isSelected) {
                onSelectionChange(
                  selectedUsers.filter((id) => id !== user._id)
                );
              } else {
                onSelectionChange([...selectedUsers, user._id]);
              }
            }}
          >
            <Avatar className="overflow-visible">
              <AvatarImage
                src={user.profilePic || "pingspace.png"}
                className="rounded-full object-cover "
              />
              <AvatarFallback>
                <div className="animate-pulse bg-gray-tertiary w-full h-full rounded-full" />
              </AvatarFallback>
            </Avatar>
            <div className="w-full">
              <div className="flex items-center justify-between">
                <p className="text-md font-medium">{user.fullName}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserSelectionList;
