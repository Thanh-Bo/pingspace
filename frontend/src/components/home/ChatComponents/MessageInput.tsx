import { Laugh, Send, X } from "lucide-react";
import { Input } from "../../ui/input";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../ui/button";
import { useChatStore } from "@/store/useChatStore";
import MediaDropdown from "./MediaDropdown";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
const MessageInput = () => {
  const [text, setText] = useState("");
  const { sendMessage } = useChatStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await sendMessage({
        text: text.trim(),
      });
      setText("");
    } catch (error) {
      console.log("Failed to send message : ", error);
    }
  };
  // Handle emoji selection
  const handleEmojiClick = (emojiObject: EmojiClickData) => {
    setText((prevText) => prevText + emojiObject.emoji);
  };

  // Close the emoji picker when user click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);
  return (
    <div className="bg-gray-primary p-2 flex gap-4 items-center border-t  border-divider ">
      <div className="relative flex gap-2 ml-2">
        {/* EMOJI PICKER WILL GO HERE */}
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 dark:text-gray-400"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          aria-label="Open emoji picker"
        >
          <Laugh />
        </Button>
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-12 left-0 z-50 w-80"
          >
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              {/* Optional Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-gray-600 dark:text-gray-400"
                onClick={() => setShowEmojiPicker(false)}
                aria-label="Close emoji picker"
              >
                <X size={16} />
              </Button>
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          </div>
        )}
        <MediaDropdown />
      </div>
      <form onSubmit={handleSendMessage} className="w-full flex gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Type a message"
            className="py-2 text-sm w-full rounded-lg shadow-sm bg-gray-tertiary focus-visible:ring-transparent"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="mr-4 flex items-center gap-3">
          <Button
            type="submit"
            size={"sm"}
            className="bg-transparent text-foreground hover:bg-transparent"
          >
            <Send />
          </Button>
        </div>
      </form>
    </div>
  );
};
export default MessageInput;
