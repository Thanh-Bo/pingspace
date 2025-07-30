import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGroupStore } from "@/store/useGroupStore";
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
import ConfirmationDialog from "./ConfirmationDialog";
import { Group } from "@/store/useChatStore";
import GroupInfoDialog from "../ChatComponents/GroupInfoDialog";

const GroupListDisplay = () => {
  const {
    userGroups,
    isLoadingUserGroups,
    fetchUserAllGroup,
    leaveGroup,
    isGroupLoading,
    setSelectedGroup,
    selectedGroup,
  } = useGroupStore();
  const [showGroupInfor, setShowGroupInfor] = useState(false);
  // Sort and search group
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  // Leave Group
  const [isConfirmToLeaveGroup, setIsConfirmToLeaveGroup] = useState(false);
  const [groupToLeave, setGroupToLeave] = useState<Group | null>(null);

  useEffect(() => {
    fetchUserAllGroup();
  }, [fetchUserAllGroup]);

  // Search and sort group
  const searchAndSortedGroups = useMemo(() => {
    let currentGroups = [...userGroups];

    // Search group
    if (searchTerm) {
      currentGroups = currentGroups.filter((group) =>
        group.groupName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    currentGroups.sort((a, b) => {
      const nameA = a.groupName || "";
      const nameB = b.groupName || "";
      if (sortBy === "name-asc") {
        return nameA.localeCompare(nameB);
      } else if (sortBy === "name-desc") {
        return nameB.localeCompare(nameA);
      }
      return 0;
    });

    return currentGroups;
  }, [userGroups, searchTerm, sortBy]);

  const handleLeaveGroupClick = (group: Group) => {
    setGroupToLeave(group);
    setIsConfirmToLeaveGroup(true);
  };

  const handleConfirmLeaveGroup = async () => {
    if (groupToLeave) {
      await leaveGroup(groupToLeave._id);
      setIsConfirmToLeaveGroup(false);
      setGroupToLeave(null);
    }
  };
  const getSortButtonText = () => {
    if (sortBy === "name-asc") return "Name (A-Z)";
    if (sortBy === "name-desc") return "Name (Z-A)";
    return "Sort"; // Default
  };
  if (isLoadingUserGroups) {
    return (
      <p className="text-center text-muted-foreground p-4">Loading groups...</p>
    );
  }
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-container">
        <p className="text-base font-semibold text-foreground">
          Joined Groups ({userGroups.length})
        </p>
      </div>

      {/* Search and Sort groups */}
      <div className="p-4 bg-container flex gap-2 items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search groups"
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border-input-border text-foreground placeholder:text-muted-foreground focus-visible:ring-transparent focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
            <DropdownMenuContent
              className="w-[180px] bg-secondary border-divider"
              sideOffset={5}
              collisionPadding={10}
            >
              <DropdownMenuItem
                onClick={() => setSortBy("name-asc")}
                className="text-foreground hover:bg-chat-hover focus:bg-chat-hover cursor-pointer"
              >
                Name (A - Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortBy("name-desc")}
                className="text-foreground hover:bg-chat-hover focus:bg-chat-hover cursor-pointer"
              >
                Name (Z - A)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      </div>

      {/* Group List Items */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {searchAndSortedGroups.length === 0 &&
        !isLoadingUserGroups &&
        userGroups.length > 0 &&
        searchTerm ? (
          <p className="text-center text-muted-foreground py-4">
            No groups found matching your search
          </p>
        ) : searchAndSortedGroups.length === 0 &&
          !isLoadingUserGroups &&
          userGroups.length == 0 ? (
          <p className="text-center text-muted-foreground py-4">
            You haven't joined any group yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {searchAndSortedGroups.map((group) => (
              <div
                key={group._id}
                className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-chat-hover transitions-colors duration-200"
                onClick={() => {
                  setSelectedGroup(group);
                  setShowGroupInfor(true);
                }}
              >
                <div className="flex items-center gap-3 ">
                  <Avatar className="size-12">
                    <AvatarImage
                      src={group.groupImage || "/pingspace.png"}
                      className="rounded-full"
                    />
                    <AvatarFallback>
                      {group.groupName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="font-semibold text-lg text-foreground">
                      {group.groupName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {group.members.length} members
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="size-8 p-0 rounded-full text-muted-foreground  hover:bg-sender"
                      >
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuContent className="w-[150px] bg-secondary border-divider rounded-sm">
                        <DropdownMenuItem
                          className="text-foreground hover:bg-chat-hover focus:bg-hover flex justify-center cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLeaveGroupClick(group);
                          }}
                          disabled={isGroupLoading}
                        >
                          {isGroupLoading && groupToLeave?._id === group._id
                            ? "Leaving..."
                            : "Leave"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGroup(group);
                            setShowGroupInfor(true);
                          }}
                          className="text-foreground hover:bg-chat-hover focus:bg-hover flex justify-center cursor-pointer"
                        >
                          View Group
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenuPortal>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog for leaving Group */}
      {groupToLeave && (
        <ConfirmationDialog
          isOpen={isConfirmToLeaveGroup}
          onClose={() => setIsConfirmToLeaveGroup(false)}
          onConfirm={handleConfirmLeaveGroup}
          title="Leave Group"
          description={`Are you sure you want to leave the groups ${groupToLeave.groupName}`}
          confirmText="Leave"
          confirmVariant="destructive"
          isConfirming={
            isGroupLoading && groupToLeave?._id === groupToLeave._id
          }
        />
      )}
      <div className="hidden">
        {selectedGroup && (
          <GroupInfoDialog
            isOpen={showGroupInfor}
            onClose={() => setShowGroupInfor(false)}
            group={selectedGroup}
          />
        )}
      </div>
    </div>
  );
};

export default GroupListDisplay;
