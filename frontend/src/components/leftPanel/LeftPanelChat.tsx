import { Search } from "lucide-react";
import { Input } from "../ui/input";
import ChatItems from "../home/ChatComponents/ChatItems";
import { Chat, useChatStore } from "@/store/useChatStore";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import CreateGroupDialog from "../home/ChatComponents/CreateGroupDialog";
import { MdGroupAdd } from "react-icons/md";

// Left panel chat
interface LeftPanelChatProps {
  onChatSelect: (chatId: string) => void;
}
const LeftPanelChat = ({ onChatSelect }: LeftPanelChatProps) => {
  const {
    getChats,
    chats,
    isUsersLoading,
    isGroupsLoading,
    setSelectedChat,
    fetchGroups,
  } = useChatStore();
  const { authUser, isCheckingAuth } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (authUser) {
      getChats();
      fetchGroups();
    }
  }, [getChats, authUser, fetchGroups]);

  if (isCheckingAuth || !authUser) {
    return <div>Loading authentication...</div>;
  }

  // Return value to home page
  const handleChatItemClick = (chat: Chat) => {
    // This shit is navigate to value and connect to right panel
    setSelectedChat(chat);
    onChatSelect(chat._id);
  };
  return (
    <div className=" h-[calc(100vh-65px)] ">
      <div className="sticky top-0 bg-container z-10">
        {/* Header */}
        {/* <div className="flex justify-between bg-gray-primary p-3 items-center ">
          <div className="flex items-center gap-3">
            <>
              <CreateGroupDialog />
            </>
          </div>
        </div> */}

        <div className="p-4 flex items-center gap-3 ">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
            <Input
              type="text"
              placeholder="Search or start a new chat"
              className="pl-10 py-2 text-sm w-full rounded shadow-sm bg-container focus-visible:ring-transparent"
            />
          </div>
          <div className="" onClick={() => setIsOpen(true)}>
            <MdGroupAdd size={30} />
          </div>
          <CreateGroupDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex flex-col items-center overflow-auto h-full bg-container">
        {isUsersLoading || isGroupsLoading ? (
          <p>Loading chats...</p>
        ) : chats.length > 0 ? (
          chats.map((chat) => (
            <ChatItems
              key={chat._id}
              chat={chat}
              authUser={authUser}
              onClick={() => handleChatItemClick(chat)}
            />
          ))
        ) : (
          <div>
            <p className="text-center text-gray-500 text-sm mt-3">
              No conversations yet
            </p>
            <p className="text-center text-gray-500 text-sm mt-3">
              We understand {"you're"} an introvert, but {"you've"} got to start
              somewhere 😊
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftPanelChat;
