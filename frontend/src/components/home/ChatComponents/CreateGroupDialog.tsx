import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
  DialogClose,
} from "@/components/ui/dialog";
import { ImageIcon, X } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useGroupStore } from "@/store/useGroupStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MdGroupAdd } from "react-icons/md";
interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
}
const CreateGroupDialog = ({ isOpen, onClose }: CreateGroupDialogProps) => {
  // State for the selected group image file
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Ref for the hidden image input
  const imgRef = useRef<HTMLInputElement>(null);

  const [renderedImage, setRenderedImage] = useState("");
  // Ref for closing the dialog
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  const { authUser, getAllUser, isAllUserLoading, allUser } = useAuthStore();
  const { setSelectedChat } = useChatStore();

  const { createGroup } = useGroupStore();

  // Effect to render the selected image as a base64 string for preview
  useEffect(() => {
    if (!selectedImage) return setRenderedImage("");

    const reader = new FileReader();
    reader.readAsDataURL(selectedImage);
    reader.onload = (e) => setRenderedImage(e.target?.result as string);
  }, [selectedImage]);
  useEffect(() => {
    getAllUser();
  }, [getAllUser]);
  // Handle image selection and validation
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setSelectedImage(file);
  };
  // Handle create a group
  const handleCreateGroup = async () => {
    // Ensure at least 2 users are selected and a group name is provided
    if (selectedUsers.length <= 1) {
      toast.error("Please select at least 2 users for the group");
      return;
    }
    if (!groupName.trim()) {
      toast.error("Please provider group name");
      return;
    }

    setIsLoading(true);
    let newGroup;
    try {
      await createGroup(groupName, selectedUsers, renderedImage);

      const { groups } = useChatStore.getState();
      newGroup = groups.find((group) => group.groupName === groupName);
      if (!newGroup) {
        toast.error("Failed to create group");
        return;
      }

      // Normalize the new group to match the Chat interface in useChatStore
      newGroup = {
        _id: newGroup?._id || "",
        isGroup: true,
        groupName: newGroup?.groupName || "",
        createdAt: newGroup?.createdAt || new Date().toISOString(),
        lastMessage: null,
        profilePic: "",
        fullName: newGroup?.groupName || "",
        groupImage: newGroup?.groupImage || "",
        members: newGroup?.members || [],
        coverPic: "",
        admin: newGroup?.admin._id,
      };
      // Close the dialog
      dialogCloseRef.current?.click();
      toast.success("Create group successfully!");
      // Reset the form states
      setSelectedUsers([]);
      setGroupName("");
      setSelectedImage(null);
      setSelectedChat(newGroup);
    } catch (error) {
      toast.error("Failed to create group");
      console.log("Error in handleCreateGroup : ", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render  fetching users
  if (!authUser) {
    return (
      <Dialog>
        <DialogTrigger>
          <MdGroupAdd size={20} />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }
  const handleUserSelect = (userId: string) => {
    setSelectedUsers((prevSelected) => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter((id) => id !== userId); // Deselect
      } else {
        return [...prevSelected, userId];
      }
    });
  };
  // Render the dialog for creating a new group
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Trigger to open the dialog */}
      {/* <DialogTrigger>
        <MdGroupAdd size={30} />
      </DialogTrigger> */}
      <DialogContent className="flex flex-col gap-3">
        <DialogHeader>
          <DialogTitle className="my-2 flex justify-center border-b border-divider">
            Create Group
            <DialogClose asChild ref={dialogCloseRef}>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hidden"
              >
                {" "}
                {/* This button is the child */}
                <X size={20} /> {/* The X icon */}
              </Button>
            </DialogClose>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="">
            <div className="flex gap-2 bg-none mb-4">
              <Button
                className="rounded-full size-10 p-0 flex justify-center items-center"
                onClick={() => imgRef.current?.click()}
              >
                <div className="">
                  {renderedImage ? (
                    <img
                      src={renderedImage}
                      alt="user image"
                      className="size-10 rounded-full object-cover"
                    />
                  ) : (
                    <ImageIcon size={32} />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={imgRef}
                    hidden
                    onChange={handleImageChange}
                  />
                </div>
              </Button>
              <Input
                className="border-none"
                placeholder="Group Name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>

            {/* List of users to select for new group */}
            <div className="max-h-60 overflow-auto rounded-md p-2">
              {isAllUserLoading ? (
                <p className="text-center text-muted-foreground">
                  Loading users....
                </p>
              ) : allUser.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No other users found
                </p>
              ) : (
                allUser.map((user) => {
                  const isSelected = selectedUsers.includes(user._id);
                  return (
                    <div
                      key={user._id}
                      className={`flex gap-3 items-center p-2 mb-1 rounded hover:bg-chat-hover cursor-pointer transition-all duration-300 ease-in-out ${
                        isSelected ? "bg-chat-hover" : ""
                      }`}
                      onClick={() => handleUserSelect(user._id)}
                    >
                      {" "}
                      <Avatar className="overflow-visible">
                        <AvatarImage
                          src={user.profilePic || "/pingspace.png"}
                          className="rounded-full object-cover 0"
                        />
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
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-5 flex justify-between">
              <Button variant={"outline"}>
                <DialogClose onClick={onClose}>Close</DialogClose>
              </Button>
              <Button onClick={handleCreateGroup}>
                {isLoading ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;
