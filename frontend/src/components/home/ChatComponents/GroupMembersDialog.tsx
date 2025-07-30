import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Crown } from "lucide-react";
import { useState } from "react";

import ProfileDialog from "./ProfileDialog";
import { User } from "@/store/useChatStore";
interface Group {
  _id: string;
  admin: User;
  members: User[];
  groupName?: string;
  groupImage?: string | null;
}
interface GroupMembersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  closeAllDialog?: () => void;
}
const GroupMembersDialog = ({
  isOpen,
  onClose,
  group,
  closeAllDialog,
}: GroupMembersDialogProps) => {
  // Profile Dialog
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [profileToDisplay, setProfileToDisplay] = useState<User | undefined>(
    undefined
  );
  // Avatar User member click
  const handleAvatarClick = (user: User) => {
    setProfileToDisplay(user);
    setIsProfileDialogOpen(true);
  };
  if (!group || !group.members) {
    // You might render a loading state, an error message, or nothing at all
    // if this dialog should only open when a valid group is available.
    console.warn("GroupMembersDialog received an invalid group prop:", group);
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="my-2 flex justify-between">
              Current Members
            </DialogTitle>

            <DialogDescription>
              <div className="flex flex-col gap-3  w-full overflow-auto h-100">
                {group.members && group.members.length > 0 ? (
                  group.members.map((user) => (
                    <div
                      key={user._id}
                      className={`flex gap-3 items-center p-2 rounded hover:bg-chat-hover cursor-pointer`}
                      onClick={() => handleAvatarClick(user)}
                    >
                      <Avatar className="overflow-visible">
                        <AvatarImage
                          src={user.profilePic || "/pingspace.png"}
                          className="rounded-full object-cover"
                        />{" "}
                        {/* Use a default image path */}
                        <AvatarFallback>
                          <div className="animate-pulse bg-gray-tertiary w-full h-full rounded-full"></div>
                        </AvatarFallback>
                      </Avatar>

                      <div className="w-full ">
                        <div className="flex items-center gap-2">
                          <h3 className="text-md font-medium">
                            {user.fullName}
                          </h3>
                          {/* Check if user._id matches the admin's _id */}
                          {group.admin._id === user._id && (
                            <Crown size={16} className="text-yellow-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No members found.</p>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <div className="hidden">
        <ProfileDialog
          isOpen={isProfileDialogOpen}
          onClose={() => setIsProfileDialogOpen(false)}
          displayUser={profileToDisplay}
          closeAllDialog={closeAllDialog}
        />
      </div>
    </>
  );
};
export default GroupMembersDialog;
