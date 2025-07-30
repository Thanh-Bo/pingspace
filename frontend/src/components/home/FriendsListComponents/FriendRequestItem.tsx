import { Button } from "@/components/ui/button";
import { useRequestStore } from "@/store/useRequestStore";
import { Request } from "@/store/useRequestStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import toast from "react-hot-toast";
import ConfirmationDialog from "./ConfirmationDialog";
import { User } from "@/store/useChatStore";
import ProfileDialog from "../ChatComponents/ProfileDialog";

interface FriendRequestItemProps {
  request: Request;
  type: "sent" | "received";
}
const FriendRequestItem = ({ request, type }: FriendRequestItemProps) => {
  const {
    acceptRequest,
    rejectRequest,
    cancelRequest,
    isAcceptingRequest,
    isRejectingRequest,
    isCancellingRequest,
  } = useRequestStore();
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [userToDisplayInProfile, setUserToDisplayInProfile] =
    useState<User | null>(null);

  const displayUser = type === "sent" ? request.receiver : request.sender;

  // Cancel Request
  const handleCancel = async () => {
    if (!request._id) {
      toast.error("Request ID missing for cancellation");
      return;
    }
    await cancelRequest(request._id);
    setIsConfirmCancelOpen(false);
  };
  // Accept Request
  const handleAccept = async () => {
    if (!request._id) {
      toast.error("Request ID missing for acceptance");
    }
    await acceptRequest(request._id);
  };

  // Reject Request
  const handleReject = async () => {
    if (!request._id) {
      toast.error("Request ID missing for rejection");
    }
    rejectRequest(request._id);
  };
  return (
    <div className="flex flex-col gap-3 p-4 border-b border-divider last:border-b-0 bg-secondary rounded-lg my-2 mx-4 hover:bg-chat-hover">
      <div className="flex items-center justify-between ">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => {
            setUserToDisplayInProfile(displayUser);
            setShowProfileDialog(true);
          }}
        >
          <Avatar className="size-12">
            <AvatarImage src={displayUser?.profilePic || "/pingspace.png"} />
            <AvatarFallback>
              {displayUser?.fullName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <p className="font-semibold text-lg text-foreground">
              {displayUser?.fullName || "Unknown User"}
            </p>
            <p className="text-sm text-muted-foreground">
              {type === "sent" ? "Sent a request" : "Want to be friend"}
              <span className="ml-2 text-xs">
                {request.createdAt
                  ? new Date(request.createdAt).toLocaleDateString("en-GB")
                  : ""}
              </span>
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex gap-2 mt-2">
          {type === "sent" && (
            <>
              <Button
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full"
                onClick={() => setIsConfirmCancelOpen(true)}
                disabled={isCancellingRequest}
              >
                {isCancellingRequest ? "Cancelling..." : "Cancel Request"}
              </Button>
              <ConfirmationDialog
                isOpen={isConfirmCancelOpen}
                onClose={() => setIsConfirmCancelOpen(false)}
                onConfirm={handleCancel}
                title="Cancel request"
                description={`Are you sure you want to cancel the friend request to ${
                  displayUser?.fullName || "Unknown"
                }`}
                confirmText="Delete"
                confirmVariant="destructive"
                isConfirming={isCancellingRequest}
              />
            </>
          )}

          {type === "received" && (
            <>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-full"
                onClick={handleAccept}
                disabled={isCancellingRequest}
              >
                {isAcceptingRequest ? "Accepting..." : "Accept"}
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-8 00 text-white font-bold py-2 px-4 rounded-full"
                onClick={handleReject}
                disabled={isRejectingRequest}
              >
                {isRejectingRequest ? "Rejecting..." : "Reject"}
              </Button>
            </>
          )}
        </div>
      </div>
      {/* Profile Dialog */}
      {userToDisplayInProfile && (
        <ProfileDialog
          isOpen={showProfileDialog}
          onClose={() => setShowProfileDialog(false)}
          displayUser={userToDisplayInProfile}
        />
      )}
    </div>
  );
};

export default FriendRequestItem;
