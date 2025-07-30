import ChatBubble from "./ChatBubble";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useRef } from "react";

const MessageContainer = () => {
  const { selectedChat, messages, isMessagesLoading } = useChatStore();
  const { authUser } = useAuthStore();
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages]);

  if (!selectedChat || !authUser) return null;
  return (
    <div className="relative p-3 flex-1 overflow-auto h-full bg-background">
      <div className="mx-12 flex flex-col gap-3 h-full">
        {isMessagesLoading ? (
          <p>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet</p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg._id}
              ref={idx === messages.length - 1 ? lastMessageRef : null}
            >
              <ChatBubble
                message={msg}
                me={authUser}
                previousMessage={idx > 0 ? messages[idx - 1] : undefined}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default MessageContainer;
