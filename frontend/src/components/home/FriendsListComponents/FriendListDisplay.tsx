import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/store/useChatStore";
import { useRequestStore } from "@/store/useRequestStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ProfileDialog from "../ChatComponents/ProfileDialog";
import ConfirmationDialog from "./ConfirmationDialog";

export const FriendListDisplay = () => {
  const {
    friendsList,
    isLoadingFriends,
    getFriendsList,
    removeFriend,
    isRemovingFriend,
  } = useRequestStore();

  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [userToDisplayInProfile, setUserToDisplayInProfile] =
    useState<User | null>(null);
  const [isConfirmUnfriendOpen, setIsConfirmUnfriendOpen] = useState(false);
  const [friendIdToUnfriend, setFriendIdToUnfriend] = useState<string | null>(
    null
  );
  const [friendNameToRemove, setFriendNameToRemove] = useState<string | null>(
    null
  );

  // States for search and sort name
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");

  useEffect(() => {
    getFriendsList();
  }, [getFriendsList]);

  const handleUnfriendClick = (friendId: string, friendName: string) => {
    setFriendIdToUnfriend(friendId);
    setFriendNameToRemove(friendName);
    setIsConfirmUnfriendOpen(true);
  };

  const handleConfirmUnfriend = async () => {
    if (friendIdToUnfriend) {
      await removeFriend(friendIdToUnfriend);
      setIsConfirmUnfriendOpen(false);
      setFriendIdToUnfriend(null);
      setFriendNameToRemove(null);
    }
  };

  // Search and sort friends list
  const searchAndSortedFriends = useMemo(() => {
    let currentFriends = [...friendsList];
    // Search friends
    if (searchTerm) {
      currentFriends = currentFriends.filter((friend) =>
        friend.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    currentFriends.sort((a, b) => {
      const nameA = a.fullName || "";
      const nameB = b.fullName || "";
      if (sortBy === "name-asc") {
        return nameA.localeCompare(nameB);
      } else if (sortBy === "name-desc") {
        return nameB.localeCompare(nameA);
      }
      return 0;
    });

    // Group by first letter of fullName
    return currentFriends.reduce((groups: Record<string, User[]>, friend) => {
      const letter = friend.fullName?.charAt(0).toUpperCase() || "#";
      if (!groups[letter]) {
        groups[letter] = [];
      }
      groups[letter].push(friend);
      return groups;
    }, {});
  }, [friendsList, searchTerm, sortBy]); // This is dependencies , when 3 of these thing call , it work useMemo

  const getSortButtonText = () => {
    if (sortBy === "name-asc") return "Name (A-Z)";
    if (sortBy === "name-desc") return "Name (Z-A)";
    return "Sort"; // Default
  };

  if (isLoadingFriends) {
    return (
      <p className="text-center text-muted-foreground p-4">
        Loading friends...
      </p>
    );
  }

  if (friendsList.length === 0 && !isLoadingFriends) {
    return (
      <p className="text-center text-muted-foreground p-4">
        You don't have any friends yet
      </p>
    );
  }

  const sortedGroups = Object.keys(searchAndSortedFriends).sort();
  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="p-4  bg-container">
        {/* <div className="flex">
          <User2 size={20} className="text-icon" />
          <span className="text-foreground font-medium">Friends list</span>
        </div> */}

        <p className="text-base font-semibold text-foreground">
          Contacts ({friendsList.length})
        </p>
      </div>
      {/* Search & Filter Toolbar */}
      <div className="p-4  bg-container flex gap-2 items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2  transform -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search friends"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border-input-border text-foreground placeholder:text-muted-foreground focus-visible:ring-transparent focus:outline"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-1 rounded-lg border-input-border text-foreground bg-background hover:bg-chat-hover px-3 py-2"
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">{getSortButtonText()}</span>
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent className="w-[180px] bg-secondary border-divider rounded-sm ">
              <DropdownMenuItem
                onClick={() => setSortBy("name-asc")}
                className="text-foreground hover:bg-chat-hover focus:bg-hover flex justify-center cursor-pointer "
              >
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy("name-desc")}
                className="text-foreground hover:bg-chat-hover focus:bg-hover flex justify-center cursor-pointer"
              >
                Name (Z-A)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </div>

      {/* Friend List Items with Alphabetical Grouping */}
      <div className="flex-1  overflow-y-auto  px-4 py-2">
        {sortedGroups.length === 0 &&
        !isLoadingFriends &&
        friendsList.length > 0 &&
        searchTerm ? (
          // No friends found matching search
          <p className="text-center text-muted-foreground py-4">
            No friends found matching your search
          </p>
        ) : sortedGroups.length === 0 &&
          !isLoadingFriends &&
          friendsList.length === 0 ? (
          // No friends at all
          <p className="text-center text-muted-foreground py-4">
            You don't have any friends yet
          </p>
        ) : (
          // Render friends if you have
          sortedGroups.map((letter) => (
            <div key={letter} className="mb-4">
              <p className="text-sm font-semibold text-muted-foreground  top-0 bg-container py-1 z-10">
                {letter}
              </p>
              <div className="flex flex-col gap-2  p-2 rounded-sm">
                {searchAndSortedFriends[letter].map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center justify-between hover:bg-chat-hover rounded-xs p-3"
                    onClick={() => {
                      setUserToDisplayInProfile(friend);
                      setShowProfileDialog(true);
                    }}
                  >
                    <div className="flex items-center gap-3 ">
                      <Avatar className="size-10">
                        <AvatarImage
                          src={friend.profilePic || "/pingspace.png"}
                          className="rounded-full"
                        />
                        <AvatarFallback>
                          {friend.fullName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">{friend.fullName}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="size-8 p-0 rounded-full text-muted-foreground hover:bg-sender"
                          >
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuContent className="w-[150px] bg-secondary border-divider rounded-sm ">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent opening profile dialog
                                handleUnfriendClick(
                                  friend._id,
                                  friend.fullName || "Unknown"
                                );
                              }}
                              className="text-foreground hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white flex justify-center cursor-pointer"
                            >
                              Unfriend
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent opening profile dialog
                                setUserToDisplayInProfile(friend);
                                setShowProfileDialog(true);
                              }}
                              className="text-foreground hover:bg-chat-hover focus:bg-hover flex justify-center cursor-pointer"
                            >
                              View Profile
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenuPortal>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      {/* Profile Dialog */}
      {userToDisplayInProfile && (
        <ProfileDialog
          isOpen={showProfileDialog}
          onClose={() => setShowProfileDialog(false)}
          displayUser={userToDisplayInProfile}
        />
      )}
      {/* Unfriend Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmUnfriendOpen}
        onClose={() => setIsConfirmUnfriendOpen(false)}
        onConfirm={handleConfirmUnfriend}
        title="Unfriend User"
        description={`Are you sure you want to unfriend ${friendNameToRemove} ? `}
        confirmText="Unfriend"
        confirmVariant="destructive"
        isConfirming={isRemovingFriend}
      />
    </div>
  );
};
