import { MessageSeenSvg } from "@/lib/svgs";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { ImageIcon, Users, VideoIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Chat, Message, useChatStore } from "@/store/useChatStore";
import { User } from "@/store/useAuthStore";

interface ChatItemsProps {
  chat: Chat;
  authUser: User;
  onClick?: () => void;
}

const ChatItems = ({ chat, authUser, onClick }: ChatItemsProps) => {
  const { selectedChat } = useChatStore();
  // Determine message type for display (basic heuristic, improve if API provides explicit type)
  const lastMessage = chat.lastMessage as Message | null;
  const lastMessageType = lastMessage?.image
    ? "image"
    : lastMessage?.video
    ? "video"
    : "text";

  const isSelected = selectedChat?._id === chat._id;
  const itemClass = `flex gap-2 items-center p-3  hover:bg-chat-hover cursor-pointer w-full h-25 ${
    isSelected ? "bg-sender" : ""
  }`;
  return (
    <>
      <div className={itemClass} onClick={onClick}>
        <Avatar className="border  overflow-visible relative">
          <AvatarImage
            src={
              chat.isGroup
                ? chat.groupImage || "/pingspace.png"
                : chat.profilePic || "pingspace.png"
            }
            className="object-cover rounded-full"
          />
          <AvatarFallback>
            <div className="animate-pulse bg-gray-tertiary w-full h-full rounded-full"></div>
          </AvatarFallback>
        </Avatar>
        <div className="w-full">
          <div className="flex items-center">
            <h3 className="text-xs lg:text-sm font-medium">
              {chat.isGroup ? chat.groupName ?? "Unnamed Group" : chat.fullName}
            </h3>
            <span className="text-[10px] lg:text-xs text-gray-500 ml-auto">
              {formatDate(
                lastMessage?.createdAt
                  ? Date.parse(lastMessage.createdAt)
                  : Date.parse(chat.createdAt)
              )}
            </span>
          </div>
          <p className="text-[12px] mt-1 text-gray-500 flex items-center gap-1">
            {lastMessage?.senderId === authUser._id && <MessageSeenSvg />}
            {chat.isGroup && <Users size={16} />}
            {!lastMessage && "Say Hi!"}
            {lastMessage &&
            lastMessageType === "text" &&
            lastMessage.text?.length > 30 ? (
              <span className="text-xs">
                {lastMessage.text.slice(0, 30)}...
              </span>
            ) : lastMessage && lastMessageType === "text" ? (
              <span className="text-xs">{lastMessage.text}</span>
            ) : lastMessageType === "image" ? (
              <ImageIcon size={16} />
            ) : lastMessageType === "video" ? (
              <VideoIcon size={16} />
            ) : null}
          </p>
        </div>
      </div>
      <hr className="h-[1px] mx-10 bg-gray-primary" />
    </>
  );
};

export default ChatItems;
