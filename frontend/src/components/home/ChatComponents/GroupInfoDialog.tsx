// src/components/chat/GroupInfoDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Pencil, Trash2, UserMinus, UserPlus, X } from "lucide-react";
import { Group, useChatStore, User } from "@/store/useChatStore"; // To get selectedChat and potentially close the dialog
import { useAuthStore } from "@/store/useAuthStore"; // To check if authUser is admin
import toast from "react-hot-toast";
import { ChangeEvent, useRef, useState } from "react";
import GroupMembersDialog from "./GroupMembersDialog"; // Assuming this is reusable
import { useGroupStore } from "@/store/useGroupStore"; // For leave group, manage group, etc.
import ProfileDialog from "./ProfileDialog";
import UserSelectionList from "./UserSelectionList";

interface GroupInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  closeAllDialog?: () => void;
}

const GroupInfoDialog = ({
  isOpen,
  onClose,
  group,
  closeAllDialog,
}: GroupInfoDialogProps) => {
  const { authUser } = useAuthStore();

  const { setSelectedChat } = useChatStore(); // For "Chat" button functionality
  const {
    leaveGroup,
    deleteGroup,
    addMemberGroup,
    removeMemberGroup,
    fetchUserGroup,
    updateGroupImage,
  } = useGroupStore();

  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);

  // State for add confirmation dialog
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedUsersToRemove, setSelectedUsersToRemove] = useState<string[]>(
    []
  );
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [profileToDisplay, setProfileToDisplay] = useState<User | undefined>(
    undefined
  );

  // Update group image
  const groupImgRef = useRef<HTMLInputElement>(null);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const handleDeleteGroup = async () => {
    if (!group._id) {
      console.error("No selected chat available");
      return;
    }
    console.log(group._id);
    try {
      await deleteGroup(group._id);
      setIsDeleteDialogOpen(false);
      // Close the main dialog after deleting
      // Since deleteGroup updates chats and groups, the UI will reflect the change
    } catch (err) {
      console.log("Error deleting group: ", err);
      toast.error("Failed to delete group");
    }
  };

  const handleLeaveGroup = async () => {
    if (!group._id) {
      console.error("No group ID available to leave");
      return;
    }
    if (window.confirm(`Are you sure you want to leave ${group.groupName}?`)) {
      try {
        await leaveGroup(group._id); // Assuming leaveGroup action
        toast.success(`You have left ${group.groupName}`);
        setSelectedChat(null); // Deselect chat after leaving
        onClose(); // Close the dialog
      } catch (error) {
        console.error("Failed to leave group:", error);
        toast.error("Failed to leave group");
      }
    }
  };

  const handleAddMembers = async () => {
    if (!group) {
      console.error("No selected chat available");
      return;
    }
    try {
      await addMemberGroup(group._id, selectedUsers);

      await handleFetchGroupMembers();
      setIsAddMemberDialogOpen(false);
      setSelectedUsers([]);
    } catch (err) {
      console.log("Error adding member: ", err);
      toast.error("Failed to add member to the group");
    }
  };

  // Check if the authenticated user is the admin
  if (!group) {
    // Optionally, you can render a loading state or nothing
    console.warn(
      "GroupInfoDialog received a null group prop. This might indicate a timing issue."
    );
    return null; // Or <p>Loading group info...</p>
  }

  const handleRemoveMembers = async () => {
    if (!group?._id || selectedUsersToRemove.length === 0) {
      toast.error("Please select at least one member to remove.");
      return;
    }
    try {
      await removeMemberGroup(group._id, selectedUsersToRemove);
      setIsRemoveDialogOpen(false); // Close the dialog
      setSelectedUsersToRemove([]); // Clear selection
      toast.success("Members removed successfully!");
    } catch (err) {
      console.log("Error removing member: ", err);
      toast.error("Failed to remove member(s)");
    }
  };

  const handleFetchGroupMembers = async () => {
    try {
      await fetchUserGroup(group._id);
    } catch (err) {
      console.log("Error fetching group or members: ", err);
      toast.error("Failed to fetch group members");
    }
  };
  const onOpenGroupMembers = () => {
    setIsMembersDialogOpen(true);
    setProfileToDisplay(undefined);
  };

  const handleImageChange = async (
    e: ChangeEvent<HTMLInputElement>,
    imageType: "groupImage"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      // 5Mb limit
      toast.error("Image size must be less than 5MB");
      return;
    }

    if (imageType === "groupImage") {
      setIsUpdatingImage(true);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const based64Image = reader.result as string;
      try {
        await updateGroupImage(based64Image, group._id);
        toast.success("Update group image successfully");
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error updating ${imageType} : `, error.message);
          toast.error(`Failed to update ${imageType}.`);
        } else {
          console.error(`Error updating ${imageType} : `, error);
          toast.error(`Failed to update ${imageType}.`);
        }
      } finally {
        if (imageType === "groupImage") {
          setIsUpdatingImage(false);
        }

        e.target.value = ""; // Clear the input so same file can be selected again
      }
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      toast.error("Failed to read image file.");
      setIsUpdatingImage(false);
    };
  };

  const currentMemberIds = group?.members?.map((member) => member._id) || [];

  const isAdmin = authUser?._id === group.admin?._id;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogPortal>
          <DialogOverlay className="dialog-overlay" />
          <DialogContent className="dialog-content max-w-md w-full">
            <DialogHeader>
              <DialogTitle className="flex flex-col items-center gap-2">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={group.groupImage || "/pingspace.png"}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    <div className="animate-pulse bg-gray-tertiary w-full h-full rounded-full" />
                  </AvatarFallback>
                </Avatar>
                {/* Update Group Image  */}
                <div
                  className="absolute bottom-2 right-2 rounded-full p-2 bg-gray-800/80 cursor-pointer hover:bg-gray-700 transition duration-200"
                  onClick={() =>
                    !isUpdatingImage && groupImgRef.current?.click()
                  }
                >
                  {isUpdatingImage ? (
                    <span className="animate-spin text-white">Updating...</span>
                  ) : (
                    <Pencil className="size-5 text-white" />
                  )}
                </div>
                <input
                  type="file"
                  hidden
                  ref={groupImgRef}
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "groupImage")}
                />
                <span className="text-xl font-bold">
                  {group.groupName ?? "Unnamed Group"}
                </span>
                <p className="text-sm text-muted-foreground">Group</p>
              </DialogTitle>
            </DialogHeader>

            <DialogDescription className="mt-4 flex flex-col gap-4">
              {/* "See Members" button/trigger within GroupInfoDialog */}
              <div
                className="flex items-center gap-4 cursor-pointer hover:bg-chat-hover p-2 rounded-md text-foreground "
                onClick={onOpenGroupMembers} // Use the prop to trigger the parent's handler
              >
                <UserPlus size={20} />
                <p className="text-sm font-medium">
                  See members ({group.members.length})
                </p>
              </div>

              {/* Delete Group */}
              {isAdmin && (
                <div
                  className="flex items-center gap-4 cursor-pointer hover:bg-chat-hover text-red-600 p-2 rounded-md "
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 size={20} />
                  <p className="text-sm font-medium">Delete Group</p>
                </div>
              )}
              {/* Leave Group */}
              {!isAdmin && (
                <div
                  className="flex items-center gap-4 cursor-pointer hover:bg-chat-hover text-red-600 p-2 rounded-md "
                  onClick={handleLeaveGroup}
                >
                  <LogOut size={20} />
                  <p className="text-sm font-medium">Leave Group</p>
                </div>
              )}

              {/* Add member  */}

              <div
                className="flex items-center gap-4 text-foreground p-2 rounded-md hover:bg-chat-hover"
                onClick={() => setIsAddMemberDialogOpen(true)}
              >
                <UserPlus size={20} />
                <p className="text-sm font-medium">Add Member </p>
              </div>

              {/* Remove member  */}
              {isAdmin && (
                <div
                  className="flex items-center gap-4  p-2 rounded-md hover:bg-chat-hover text-red-600"
                  onClick={() => setIsRemoveDialogOpen(true)}
                >
                  <UserMinus size={20} />
                  <p className="text-sm font-medium">Remove Member</p>
                </div>
              )}
            </DialogDescription>
          </DialogContent>
        </DialogPortal>

        {/* Nested Dialogs (placed here so they are rendered on top of GroupInfoDialog) */}
        {/* Group Members Dialog */}
        <GroupMembersDialog
          isOpen={isMembersDialogOpen}
          onClose={() => setIsMembersDialogOpen(false)}
          group={group}
          closeAllDialog={closeAllDialog ?? (() => {})}
        />

        {/* Nested Dialog for Adding Members */}
        <Dialog
          open={isAddMemberDialogOpen}
          onOpenChange={setIsAddMemberDialogOpen}
        >
          <DialogPortal>
            <DialogOverlay className="dialog-overlay" />
            <DialogContent className="dialog-content">
              <DialogHeader></DialogHeader>
              <DialogDescription asChild>
                <div>
                  <UserSelectionList
                    mode="add"
                    selectedUsers={selectedUsers}
                    onSelectionChange={setSelectedUsers}
                    excludeUserIds={currentMemberIds} // Corrected prop name
                  />
                  <div className="flex justify-end mt-4 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddMemberDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddMembers}
                      disabled={selectedUsers.length === 0}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </DialogDescription>
            </DialogContent>
          </DialogPortal>
        </Dialog>

        {/* Nested Dialog for Remove Confirmation */}
        <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
          <DialogPortal>
            <DialogOverlay className="dialog-overlay" />
            <DialogContent className="dialog-content">
              <DialogDescription asChild>
                <div>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Select members to remove from the group. The admin cannot be
                    removed.
                  </p>
                  <UserSelectionList
                    mode="remove"
                    selectedUsers={selectedUsersToRemove}
                    onSelectionChange={setSelectedUsersToRemove}
                    usersToDisplay={group.members} // Pass the current group members
                    excludeUserIds={[group.admin._id]} // Disable the admin's ID
                  />
                  <div className="flex justify-end mt-4 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsRemoveDialogOpen(false);
                        setSelectedUsersToRemove([]); // Clear selection on cancel
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleRemoveMembers}
                      disabled={selectedUsersToRemove.length === 0}
                    >
                      Remove ({selectedUsersToRemove.length})
                    </Button>
                  </div>
                </div>
              </DialogDescription>
            </DialogContent>
          </DialogPortal>
        </Dialog>

        {/* Nested Dialog for Leave Group Confirmation */}
        <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
          <DialogPortal>
            <DialogOverlay className="dialog-overlay" />
            <DialogContent className="dialog-content">
              <DialogHeader>
                <div className="flex justify-between items-center pb-2 border-b border-divider mb-4">
                  <DialogTitle className="text-xl font-semibold">
                    Leave Group
                  </DialogTitle>
                  <button
                    onClick={() => setIsLeaveDialogOpen(false)}
                    className="text-icon hover:text-icon-active"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
              </DialogHeader>
              <DialogDescription asChild>
                <div>
                  <p>Are you sure you want to leave this group?</p>
                  <div className="flex justify-end mt-4 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsLeaveDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleLeaveGroup}>
                      Confirm
                    </Button>
                  </div>
                </div>
              </DialogDescription>
            </DialogContent>
          </DialogPortal>
        </Dialog>

        {/* Nested Dialog for Delete Group Confirmation */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogPortal>
            <DialogOverlay className="dialog-overlay" />
            <DialogContent className="dialog-content">
              <DialogHeader>
                <div className="flex justify-between items-center pb-2 border-b border-divider mb-4">
                  <DialogTitle className="text-xl font-semibold">
                    Delete Group
                  </DialogTitle>
                </div>
              </DialogHeader>
              <DialogDescription asChild>
                <div>
                  <p>
                    Are you sure you want to delete this group? This action
                    cannot be undone.
                  </p>
                  <div className="flex justify-end mt-4 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteGroup}>
                      Confirm
                    </Button>
                  </div>
                </div>
              </DialogDescription>
            </DialogContent>
          </DialogPortal>
        </Dialog>

        {/* Profile Dialog */}
        <ProfileDialog
          isOpen={isProfileDialogOpen}
          onClose={() => setIsProfileDialogOpen(false)}
          displayUser={profileToDisplay}
          closeAllDialog={closeAllDialog}
        />
      </Dialog>
    </>
  );
};

export default GroupInfoDialog;
