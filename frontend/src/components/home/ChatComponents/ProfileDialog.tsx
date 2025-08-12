import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import EditProfile from "./EditProfile";
import toast from "react-hot-toast";
import { Pencil } from "lucide-react";
import { Chat, useChatStore, User } from "@/store/useChatStore";
import { useRequestStore } from "@/store/useRequestStore";
import { Link, useNavigate } from "react-router-dom";

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;

  displayUser?: User;
  closeAllDialog?: () => void;
}

const ProfileDialog = ({
  isOpen,
  onClose,
  displayUser,
  closeAllDialog,
}: ProfileDialogProps) => {
  const { setSelectedChat } = useChatStore();
  const { authUser, updateProfile } = useAuthStore();
  // const {selectedChat} = useChatStore();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const coverImgRef = useRef<HTMLInputElement>(null);
  const profileImgRef = useRef<HTMLInputElement>(null);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [isUpdatingCoverImg, setIsUpdatingCoverImage] = useState(false);
  // If displayUser prop is provided , use that .
  const userData = displayUser || authUser;
  // Check if this is my profile or not
  const isOwnProfile = authUser?._id === userData?._id;

  const {
    sendRequest,

    cancelRequest,
    // To check if they are friends
    getPendingRequests, // To check incoming requests
    getSentRequests, // To check outgoing requests
    friendsList,
    pendingRequests,
    sentRequests,
    removeFriend,
    isSendingRequest, // Use these for button loading states
    isRemovingFriend,
    isCancellingRequest,
  } = useRequestStore();

  const navigate = useNavigate();
  // Determine relationship status
  // Are we already fiends
  const isFriend = isOwnProfile
    ? false
    : friendsList.some((friend) => friend._id === userData?._id);

  // Did i send them a friend  request
  const hasSentRequest = isOwnProfile
    ? false
    : // some is array method. It checks if at least one element is satisfy
      sentRequests.some(
        (req) => req.receiver._id === userData?._id && req.status === "pending"
      );

  // Did they send me a friend request
  const hasReceivedRequest = isOwnProfile
    ? false
    : pendingRequests.some(
        (req) => req.sender._id === userData?._id && req.status === "pending"
      );

  useEffect(() => {
    if (isOpen && authUser && !isOwnProfile) {
      getPendingRequests();
      getSentRequests();
    }
  }, [isOpen, authUser, isOwnProfile, getPendingRequests, getSentRequests]);

  // Edit profile
  const handleOpenEditForm = () => {
    if (!isOwnProfile) {
      toast.error("You can only edit your own profile information");
    }
    setIsEditOpen(true); // Open the edit form for other fields
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
  };

  // Add friends
  const handleAddFriend = async () => {
    if (userData?._id) {
      await sendRequest(userData._id);
    } else {
      toast.error("No pending request found from this user");
    }
  };

  // Cancel Request
  const handleCancelRequest = async () => {
    const request = sentRequests.find(
      (req) => req.receiver._id === userData?._id && req.status === "pending"
    );
    if (request) {
      await cancelRequest(request._id);
    } else {
      toast.error("No sent request found to this user");
    }
  };

  // Remove friends
  const handleRemoveFriend = async () => {
    if (isFriend && userData?._id) {
      await removeFriend(userData._id);
    }
  };
  // Navigate chat
  const handleChat = async () => {
    const navigateChat: Chat = {
      _id: userData?._id || "",
      isGroup: false,
      groupName: undefined,
      createdAt: userData?.createdAt || "",
      lastMessage: null, // Assuming no last message initially
      coverPic: userData?.coverPic || "",
      profilePic: userData?.profilePic || "",
      fullName: userData?.fullName || "Unknown",
      groupImage: null, // Assuming no group image for individual chat
      admin: "", // Assuming no admin for individual chat
      members: [], // Assuming no members for individual chat
      email: userData?.email,
      bio: undefined,
      dateOfBirth: userData?.dateOfBirth?.toString(),
      gender: undefined,

      isOnline: undefined,
    };
    setSelectedChat(navigateChat);
    onClose();
    if (closeAllDialog) {
      closeAllDialog();
    }
    navigate("/");
  };

  if (!userData) {
    return null;
  }

  // Change avatar and cover image
  const handleImageChange = async (
    e: ChangeEvent<HTMLInputElement>,
    imageType: "profilePic" | "coverPic"
  ) => {
    if (!isOwnProfile) {
      toast.error("You can only can your own profile image");
    }
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      // 5Mb limit
      toast.error("Image size must be less than 5MB");
      return;
    }
    if (imageType === "profilePic") {
      setIsUpdatingAvatar(true);
    }
    if (imageType === "coverPic") {
      setIsUpdatingCoverImage(true);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const based64Image = reader.result as string;
      try {
        await updateProfile({ [imageType]: based64Image });
        toast.success(
          `${
            imageType === "profilePic" ? "Profile picture" : "Cover image"
          } updated successfully`
        );
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error updating ${imageType} : `, error.message);
          toast.error(`Failed to update ${imageType}.`);
        } else {
          console.error(`Error updating ${imageType} : `, error);
          toast.error(`Failed to update ${imageType}.`);
        }
      } finally {
        if (imageType === "profilePic") {
          setIsUpdatingAvatar(false);
        }
        if (imageType === "coverPic") {
          setIsUpdatingCoverImage(false);
        }
        e.target.value = ""; // Clear the input so same file can be selected again
      }
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      toast.error("Failed to read image file.");
      setIsUpdatingCoverImage(false);
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="max-w-md p-0 ">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center text-xl font-semibold px-4 pt-4">
            <span>Profile</span>
          </DialogTitle>
          <DialogDescription className="text-left">
            <div className="relative">
              {/* Cover Image */}
              <div className="relative w-full h-48 overflow-hidden">
                <img
                  src={userData?.coverPic || "pingspace.png"}
                  className="h-full w-full object-cover"
                  alt="cover image"
                />
                {isOwnProfile && (
                  <div
                    className="absolute top-2 right-2 rounded-full p-2 bg-gray-800/80 cursor-pointer hover:bg-gray-700 transition duration-200"
                    onClick={() =>
                      !isUpdatingCoverImg && coverImgRef.current?.click()
                    }
                  >
                    {isUpdatingCoverImg ? (
                      <span className="animate-spin text-white">
                        Updating...
                      </span> // Simple spinner
                    ) : (
                      <Pencil className="size-5 text-white" />
                    )}
                  </div>
                )}

                <input
                  type="file"
                  hidden
                  ref={coverImgRef}
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "coverPic")}
                />
              </div>

              {/* Profile Image */}
              <div className="relative -mt-12 ml-4 flex items-end">
                <div className="relative">
                  <Avatar className="size-24 border-4 border-gray-900">
                    <AvatarImage
                      src={userData?.profilePic || "pingspace.png"}
                    />
                    <AvatarFallback>
                      {userData?.fullName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isOwnProfile && (
                    <div
                      className="absolute bottom-2 right-2 rounded-full p-2 bg-gray-800/80 cursor-pointer hover:bg-gray-700 transition duration-200"
                      onClick={() =>
                        !isUpdatingAvatar && profileImgRef.current?.click()
                      }
                    >
                      {isUpdatingAvatar ? (
                        <span className="animate-spin text-white">
                          Updating...
                        </span> // Simple spinner
                      ) : (
                        <Pencil className="size-5 text-white" />
                      )}
                    </div>
                  )}

                  <input
                    type="file"
                    hidden
                    ref={profileImgRef}
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "profilePic")}
                  />
                </div>
                <h3 className="text-lg font-semibold ml-4 mb-3">
                  {userData?.fullName || "Unknown"}
                </h3>
              </div>
            </div>

            {/* Only display this shit if it's not the current user's profile */}
            {!isOwnProfile && userData._id && (
              <div className="flex justify-center gap-4 px-4  border-gray-700 m-3">
                {/* Add friend */}
                {!isFriend && !hasSentRequest && !hasReceivedRequest && (
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                    onClick={handleAddFriend}
                    disabled={isSendingRequest}
                  >
                    {isSendingRequest ? "Sending..." : "Add Friend"}
                  </Button>
                )}
                {/* Cancel Add Friend */}
                {!isFriend && hasSentRequest && (
                  <Button
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full"
                    onClick={handleCancelRequest}
                    disabled={isCancellingRequest}
                  >
                    {isCancellingRequest ? "Cancelling..." : "Cancel Request"}
                  </Button>
                )}
                {/* Remove Friend */}
                {isFriend && (
                  <Button
                    className="flex-1  hover:bg-red-700 bg-red-600 text-white font-bold py-2 px-4 rounded-full"
                    onClick={handleRemoveFriend}
                    disabled={isRemovingFriend}
                  >
                    {isSendingRequest ? "Removing..." : "Remove Friend"}
                  </Button>
                )}
                {/* Chat   */}
                <Button
                  className="flex-1  bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                  onClick={handleChat}
                >
                  Chat
                </Button>
              </div>
            )}
            {/* Personal Information */}
            <div className="space-y-2 m-4 px-4">
              <h4 className="text-lg font-medium">Personal Information</h4>
              <div className="text-sm grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                <p>
                  <strong>Gender</strong>
                </p>
                <p>
                  {userData?.gender
                    ? userData.gender.charAt(0).toUpperCase() +
                      userData.gender.slice(1).toLowerCase()
                    : "Not set"}
                </p>
                <p>
                  <strong>Bio</strong>
                </p>
                <p>{userData?.bio || "Not set"}</p>
                <p>
                  <strong>Birthday</strong>
                </p>
                <p>
                  {userData?.dateOfBirth
                    ? new Date(userData.dateOfBirth).toLocaleDateString("en-GB")
                    : "Not set"}
                </p>
                <Link
                  className="font-bold text-sm"
                  to={`/profile/${userData._id}`}
                  onClick={closeAllDialog || onClose}
                >
                  See full profile
                </Link>
              </div>
            </div>

            {/* Update Button */}
            {isOwnProfile && (
              <div className="px-4 py-4 flex items-center justify-center">
                <Button
                  className="w-1/3 border "
                  onClick={handleOpenEditForm}
                  type="button"
                  variant="outline"
                >
                  <Pencil className="size-4" />
                  Update Profile
                </Button>
              </div>
            )}

            {isEditOpen && (
              <EditProfile isOpen={isEditOpen} onClose={handleCloseEdit} />
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
