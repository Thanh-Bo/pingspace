import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";
import { Contact, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import EditProfile from "../ChatComponents/EditProfile";
import Posts from "../PostComponents/Posts";
import { usePostStore } from "@/store/usePostStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import FriendList from "./FriendList";
import { useRequestStore } from "@/store/useRequestStore";
import { Chat, useChatStore } from "@/store/useChatStore";

const Profile = () => {
  const { getUserProfile, authUser, updateProfile } = useAuthStore();
  const { userPosts } = usePostStore();

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
    getFriendsList,
  } = useRequestStore();

  const { setSelectedChat } = useChatStore();
  const { id } = useParams();
  const [userData, setUserData] = useState<any>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const coverImgRef = useRef<HTMLInputElement>(null);
  const profileImgRef = useRef<HTMLInputElement>(null);

  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [isUpdatingCoverImg, setIsUpdatingCoverImage] = useState(false);

  const [isOpenDialogFriend, setIsOpenDialogFriend] = useState(false);
  const isOwnProfile = authUser?._id == userData?._id;

  useEffect(() => {
    if (id) {
      (async () => {
        const data = await getUserProfile(id);
        setUserData(data);
      })();
    }
  }, [id, getUserProfile]);

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
    if (authUser && !isOwnProfile) {
      getPendingRequests();
      getSentRequests();
      getFriendsList();
    }
  }, [
    authUser,
    isOwnProfile,
    getPendingRequests,
    getSentRequests,
    getFriendsList,
  ]);

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

  // Navigate to chat

  const navigate = useNavigate();

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

    navigate("/");
  };
  return (
    <>
      <div className="w-full mx-auto ">
        {/* Cover Image */}
        <div className="relative w-full h-48 overflow-hidden">
          <img
            src={userData?.coverPic || "/pingspace.png"}
            className="h-full w-full object-cover"
            alt="cover"
          />
          {isOwnProfile && (
            <div
              className="absolute top-2 right-2 rounded-full p-2 bg-gray-800/80 cursor-pointer hover:bg-gray-700 transition duration-200"
              onClick={() =>
                !isUpdatingCoverImg && coverImgRef.current?.click()
              }
            >
              {isUpdatingCoverImg ? (
                <span className="animate-spin text-white">Updating...</span>
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
          <div className="relative ">
            <Avatar className="size-30 border-4 border-gray-900">
              <AvatarImage src={userData?.profilePic || "/pingspace.png"} />
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
                  <span className="animate-spin text-white">Updating...</span>
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

        <div className="flex justify-between">
          {/* Personal Information */}
          <div className="space-y-2 m-10">
            <h4 className="text-lg font-medium">Personal Information</h4>
            <div className="text-sm grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
              <p>
                <strong>Gender</strong>
              </p>
              <p>{userData?.gender || "Not set"}</p>

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
              {/* Friends */}
              <p>
                <strong>Friends</strong>
              </p>
              <p>{userData?.friends.length}</p>

              {/* Posts */}
              <p>
                <strong>Posts</strong>
              </p>
              <p>{userPosts.length}</p>
            </div>
          </div>
          <div>
            {/* Edit Profile */}
            {isOwnProfile && (
              <div className="mr-4">
                <Button
                  className="w-full border"
                  onClick={handleOpenEditForm}
                  type="button"
                  variant="outline"
                >
                  <Pencil className="size-4" /> Update Profile
                </Button>
              </div>
            )}
            {/* Friends List */}
            {userData?.friends.length !== 0 && (
              <div className="mr-4">
                <Button
                  className="w-full border"
                  onClick={() => setIsOpenDialogFriend(true)}
                  type="button"
                  variant="outline"
                >
                  <Contact />
                  Friend List
                </Button>
              </div>
            )}

            {/* Only display this shit if it's not the current user's profile */}
            {!isOwnProfile && (
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
                {/* Chat */}
                <Button
                  className="flex-1  bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                  onClick={handleChat}
                >
                  Chat
                </Button>
              </div>
            )}
          </div>
        </div>

        {isEditOpen && (
          <EditProfile isOpen={isEditOpen} onClose={handleCloseEdit} />
        )}
        <Posts feedType="User Posts" userId={userData?._id} />

        {/* Dialog Friend */}
        <Dialog open={isOpenDialogFriend} onOpenChange={setIsOpenDialogFriend}>
          <DialogPortal>
            <DialogOverlay className="dialog-overlay" />
            <DialogContent className="dialog-content">
              <DialogHeader>Friend List</DialogHeader>
              <DialogDescription asChild>
                <FriendList
                  friends={userData?.friends || []}
                  onClose={() => setIsOpenDialogFriend(false)}
                />
              </DialogDescription>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </div>
    </>
  );
};
export default Profile;
