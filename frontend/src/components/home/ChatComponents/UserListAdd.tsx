import { axiosInstance } from "@/lib/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
/// UserListAdd.tsx
// Define the User interface based on the backend User model
interface User {
  _id: string;
  fullName: string;
  email: string;
  profilePic: string;
}

interface UserListProps {
  selectedUsers: string[];
  onSelectionChange: (selectedUsers: string[]) => void;
  excludeUserId?: string[] | string; // Optional: exclude a specific user (e.g., the authenticated user)
}
const UserList = ({
  selectedUsers,
  onSelectionChange,
  excludeUserId,
}: UserListProps) => {
  // State to store the list of users fetched from the backend
  const [users, setUsers] = useState<User[]>([]);

  // State to track loading state for fetching users
  const [isFetchingUsers, setIsFetchingUsers] = useState(true);

  useEffect(() => {
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
  }, []);

  if (isFetchingUsers) {
    return <p className="text-sm text-muted-foreground">Loading users...</p>;
  }

  const filteredUsers = excludeUserId
    ? users.filter((user) => {
        if (Array.isArray(excludeUserId)) {
          return !excludeUserId.includes(user._id);
        }
        return user._id !== excludeUserId;
      })
    : users;

  if (filteredUsers.length === 0) {
    return <p className="text-sm text-muted-foreground">No users found.</p>;
  }
  return (
    <div className="flex flex-col gap-2 overflow-auto max-h-60">
      {filteredUsers.map((user) => (
        <div
          key={user._id}
          className={`flex gap-3 items-center p-2 rounded cursor-pointer active:scale-95
                                transition-all ease-in-out duration-300
                                ${
                                  selectedUsers.includes(user._id)
                                    ? "bg-green-200"
                                    : ""
                                }
                        `}
          // Choose user to add in group
          onClick={() => {
            if (selectedUsers.includes(user._id)) {
              onSelectionChange(selectedUsers.filter((id) => id !== user._id));
            } else {
              onSelectionChange([...selectedUsers, user._id]);
            }
          }}
        >
          <Avatar className="overflow-visible">
            <AvatarImage
              src={user.profilePic || "levi.jpg"}
              className="rounded-full object-cover size-20"
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
      ))}
    </div>
  );
};

export default UserList;
