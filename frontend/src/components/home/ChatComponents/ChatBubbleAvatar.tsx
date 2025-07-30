import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import ProfileDialog from "./ProfileDialog";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { User } from "@/store/useAuthStore";
type ChatBubbleAvatarProps = {
  userToDisplay: User;
};

const ChatBubbleAvatar = ({ userToDisplay }: ChatBubbleAvatarProps) => {
  const { getUserProfile } = useAuthStore();
  // Profile display
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [profileToDisplay, setIsProfileToDisplay] = useState<
    User | undefined | null
  >(null);

  const handleAvatarClick = async () => {
    if (!userToDisplay || !userToDisplay._id) {
      console.error("User object or ID missing for avatar click.");
      return;
    }
    try {
      const fullUserProfile = await getUserProfile(userToDisplay._id);
      if (fullUserProfile) {
        setIsProfileDialogOpen(true);
        setIsProfileToDisplay(fullUserProfile);
      } else {
        console.warn(
          "Failed to fetch full user profile for : ",
          userToDisplay._id
        );
      }
    } catch (error) {
      console.error("Error in handle Avatar click", error);
    }
  };

  return (
    <div>
      <Avatar className="overflow-visible relative" onClick={handleAvatarClick}>
        <AvatarImage
          src={userToDisplay?.profilePic || "/pingspace.png"}
          className="rounded-full object-cover w-8 h-8"
        />
        <AvatarFallback className="w-8 h-8 ">
          <div className="animate-pulse bg-gray-tertiary rounded-full"></div>
        </AvatarFallback>
      </Avatar>

      <div className="hidden">
        <ProfileDialog
          isOpen={isProfileDialogOpen}
          onClose={() => setIsProfileDialogOpen(false)}
          displayUser={profileToDisplay ?? undefined}
        />
      </div>
    </div>
  );
};
export default ChatBubbleAvatar;
