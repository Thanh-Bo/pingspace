import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Pencil, X } from "lucide-react";
import ChatPlaceHolder from "../home/ChatComponents/ChatPlaceHolder";
import MessageContainer from "../home/ChatComponents/MessageContainer";
import MessageInput from "../home/ChatComponents/MessageInput";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore, User } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import GroupMembersDialog from "../home/ChatComponents/GroupMembersDialog";
import toast from "react-hot-toast";
import { useGroupStore } from "@/store/useGroupStore";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import ProfileDialog from "../home/ChatComponents/ProfileDialog";
import GroupInfoDialog from "../home/ChatComponents/GroupInfoDialog";
interface RightPanelChatProps {
  selectedChatId: string | null;
  onBackButtonClick: () => void;
}
const RightPanelChat = ({
  selectedChatId,
  onBackButtonClick,
}: RightPanelChatProps) => {
  const {
    selectedChat,
    setSelectedChat,
    getMessages,
    subscribeFromMessage,
    unsubscribeFromMessage,
  } = useChatStore();
  const { authUser, isCheckingAuth, getUserProfile } = useAuthStore();
  const { updateGroupName, fetchUserGroup, selectedGroup } = useGroupStore();
  // State for group name update dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // Sate to hold the user data to display
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isGroupInfoDialogOpen, setIsGroupInfoDialogOpen] = useState(false);
  const [isGroupMembersDialogOpen, setIsGroupMembersDialogOpen] =
    useState(false);
  // Display user profile
  const [profileToDisplay, setProfileToDisplay] = useState<User | undefined>(
    undefined
  );
  useEffect(() => {
    if (selectedChat && selectedChat._id === selectedChatId) {
      getMessages(selectedChat._id, selectedChat.isGroup);
      subscribeFromMessage();
      if (selectedChat.isGroup) {
        fetchUserGroup(selectedChat._id);
      }
    }
    return () => unsubscribeFromMessage();
  }, [
    getMessages,
    selectedChat,
    subscribeFromMessage,
    selectedChatId,
    unsubscribeFromMessage,
    fetchUserGroup,
  ]);

  if (isCheckingAuth || !authUser || !selectedChat) return <ChatPlaceHolder />;

  const name = selectedChat.isGroup
    ? selectedChat.groupName ?? "Unnamed Group"
    : selectedChat.fullName;

  const handleUpdateGroupName = async () => {
    if (!newGroupName.trim()) {
      toast.error("Group name cannot be empty");
    }
    try {
      await updateGroupName(selectedChat._id, newGroupName);
      setIsEditDialogOpen(false);
      setNewGroupName("");
    } catch (err) {
      console.log("Error updating group name: ", err);
      toast.error("Failed to update group name");
    }
  };

  const handleAvatarClick = async () => {
    if (selectedChat.isGroup) {
      setIsGroupInfoDialogOpen(true);
    } else {
      // Fetch the full user profile data for 1-on-1 chats
      try {
        const fullUserProfile = await getUserProfile(selectedChat._id);
        if (fullUserProfile) {
          setProfileToDisplay(fullUserProfile);
          setIsProfileDialogOpen(true);
        } else {
          toast.error("Failed to load user profile details.");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("An error occurred while loading user profile.");
      }
    }
  };

  const handleSeeMembersClick = async () => {
    // Fetch the latest group data (including members) before opening the dialog
    if (selectedChat) {
      await fetchUserGroup(selectedChat._id);
    }
    setIsGroupMembersDialogOpen(true);
  };

  const closeDialog = async () => {
    setIsProfileDialogOpen(false);
    setIsGroupInfoDialogOpen(false);
    setIsGroupMembersDialogOpen(false);
  };
  return (
    <div className="flex flex-col h-full border-r border-l border-divider">
      {/* sticky top-0 z-50 */}
      <div className="w-full sticky top-0 z-30 ">
        {/* Header */}
        <div className="flex justify-between  bg-container p-3 border-b border-divider ">
          <div className="flex gap-3 items-center">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2 text-foreground hover:bg-chat-hover"
              onClick={onBackButtonClick} // Call the back button handler
              aria-label="Back to chat list"
            >
              <ArrowLeft size={20} />
            </Button>
            {/* Avatar */}
            <Avatar className="cursor-pointer" onClick={handleAvatarClick}>
              <AvatarImage
                src={
                  selectedChat.isGroup
                    ? selectedChat.groupImage || "/pingspace.png"
                    : selectedChat.profilePic || "/pingspace.png"
                }
                className="object-cover"
              />
              <AvatarFallback>
                <div className="animate-pulse bg-gray-tertiary w-full h-full rounded-full" />
              </AvatarFallback>
            </Avatar>
            {/* Name Group */}
            <div className="flex flex-col gap-1">
              <div className="flex gap-3">
                <p>{name}</p>
                {/* Change name group */}
                {selectedChat.isGroup && (
                  <button
                    onClick={() => {
                      setNewGroupName(
                        selectedChat.groupName ?? "Unnamed group"
                      );
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Pencil
                      size={15}
                      className="text-gray-500 hover:text-gray-700"
                    />
                  </button>
                )}
              </div>
              {selectedChat.isGroup && (
                <button
                  className="text-xs text-muted-foreground text-left hover:underline" // Make it look like a link
                  onClick={handleSeeMembersClick} // Opens GroupMembersDialog
                >
                  See members
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-7 mr-5">
            <X
              size={16}
              className="cursor-pointer"
              onClick={() => {
                setSelectedChat(null);
                onBackButtonClick();
              }}
            />
          </div>
        </div>
      </div>
      {/* CHAT MESSAGES */}
      <MessageContainer />

      {/* INPUT */}
      <MessageInput />

      {/* Dialog for Updating Group Name */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogOverlay className="dialog-overlay">
          <DialogContent className="dialog-content max-w-md w-full">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center text-xl ">
                Update Group Name
              </DialogTitle>

              <DialogDescription>
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter new group name"
                  className="mb-4"
                />
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setNewGroupName("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateGroupName}
                    disabled={!newGroupName.trim()}
                  >
                    Confirm
                  </Button>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </DialogOverlay>
      </Dialog>
      <div className="hidden">
        {selectedChat &&
          selectedGroup && ( // Only render if selectedChat and selectedGroup are not null
            <GroupMembersDialog
              isOpen={isGroupMembersDialogOpen}
              onClose={() => setIsGroupMembersDialogOpen(false)}
              group={selectedGroup}
              closeAllDialog={closeDialog}
            />
          )}
      </div>

      <div className="hidden">
        <ProfileDialog
          isOpen={isProfileDialogOpen}
          onClose={() => setIsProfileDialogOpen(false)}
          displayUser={profileToDisplay}
          closeAllDialog={closeDialog}
        />
      </div>
      <div className="hidden">
        {selectedGroup && (
          <GroupInfoDialog
            isOpen={isGroupInfoDialogOpen}
            onClose={() => setIsGroupInfoDialogOpen(false)}
            group={selectedGroup}
            closeAllDialog={closeDialog}
          />
        )}
      </div>
    </div>
  );
};
export default RightPanelChat;
