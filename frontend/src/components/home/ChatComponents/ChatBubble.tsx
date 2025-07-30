import { User } from "@/store/useAuthStore";
import { Message, useChatStore } from "@/store/useChatStore";
import { useState } from "react";
import DateIndicator from "./DateIndicator";
import ReactPlayer from "react-player";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
} from "@radix-ui/react-dialog";
import { MessageSeenSvg } from "@/lib/svgs";
// import { Bot } from "lucide-react";
import ChatBubbleAvatar from "./ChatBubbleAvatar";
import { X } from "lucide-react";
type ChatBubbleProps = {
  message: Message;
  me: User;
  previousMessage?: Message;
};

const ChatBubble = ({ message, me, previousMessage }: ChatBubbleProps) => {
  // const {authUser} = useAuthStore();
  const date = new Date(message.createdAt);
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const time = `${hour}:${minute}`;

  const { selectedChat } = useChatStore();

  const isGroup = selectedChat?.isGroup || false;
  const fromMe = message.senderId === me._id;
  const [open, setOpen] = useState(false);

  const isImageMessage = !!message.image;
  const isVideoMessage = !!message.video;
  const renderMessageContent = () => {
    if (isImageMessage) {
      // Use the new flag
      return (
        <ImageMessage message={message} handleClick={() => setOpen(true)} />
      );
    } else if (message.video) {
      return <VideoMessage message={message} />;
    } else {
      return <TextMessage message={message} />;
    }
  };

  if (!fromMe) {
    return (
      <>
        <DateIndicator message={message} previousMessage={previousMessage} />
        <div className="flex gap-1 w-2/3">
          <ChatBubbleAvatar userToDisplay={message.sender as User} />
          <div
            className={`flex flex-col z-20 max-w-fit  relative ${
              !isImageMessage && !isVideoMessage
                ? "px-2 pt-1 rounded-md shadow-md bg-receiver"
                : ""
            }`}
          >
            {isGroup && message?.sender.fullName && (
              <p className="text-xs font-medium mb-1">
                {message.sender.fullName}
              </p>
            )}
            {<OtherMessageIndicator />}
            {renderMessageContent()}
            {open && (
              <ImageDialog
                src={message.image}
                open={open}
                onClose={() => setOpen(false)}
              />
            )}
            <MessageTime time={time} fromMe={fromMe} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DateIndicator message={message} previousMessage={previousMessage} />
      <div className="flex gap-1 w-2/3 ml-auto mb-4">
        <div
          className={`flex z-20 max-w-fit relative ${
            !isImageMessage && !isVideoMessage
              ? "px-2 pt-1 rounded-md shadow-md ml-auto bg-sender"
              : "px-2 pt-1 rounded-md shadow-md ml-auto"
          }`}
        >
          <SelfMessageIndicator />
          {renderMessageContent()}
          {open && (
            <ImageDialog
              src={message.image}
              open={open}
              onClose={() => setOpen(false)}
            />
          )}
          <MessageTime time={time} fromMe={fromMe} />
        </div>
      </div>
    </>
  );
};

export default ChatBubble;

const VideoMessage = ({ message }: { message: Message }) => {
  return (
    <ReactPlayer
      url={message.video}
      width="250px"
      height="250px"
      controls={true}
      light={true}
    />
  );
};

const ImageMessage = ({
  message,
  handleClick,
}: {
  message: Message;
  handleClick: () => void;
}) => {
  return (
    <div className="w-full h-full  m-2 relative ">
      <img
        src={message.image}
        className="cursor-pointer object-cover rounded "
        alt="image"
        onClick={handleClick}
      />
    </div>
  );
};

const ImageDialog = ({
  src,
  onClose,
  open,
}: {
  open: boolean;
  src: string;
  onClose: () => void;
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-40 bg-black/90">
          <DialogContent className="w-full h-full">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 rounded-full
                     bg-gray-800/50 text-white hover:bg-gray-700/70
                     transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close image viewer"
            >
              <X size={24} />
            </button>
            <DialogDescription className="relative w-full h-full flex justify-center border-none">
              <img
                src={src}
                className=" max-w-full max-h-full rounded-lg object-contain"
                alt="image"
              />
            </DialogDescription>
          </DialogContent>
        </DialogOverlay>
      </DialogPortal>
    </Dialog>
  );
};

const MessageTime = ({ time, fromMe }: { time: string; fromMe: boolean }) => {
  return (
    <p className="text-[10px] mt-2 self-end flex gap-1 items-center">
      {time} {fromMe && <MessageSeenSvg />}
    </p>
  );
};

const OtherMessageIndicator = () => (
  <div className="absolute top-0 -left-[4px] w-3 h-3 rounded-bl-full" />
);

const SelfMessageIndicator = () => (
  <div className="absolute bg-green-chat top-0 -right-[3px] w-3 h-3 rounded-br-full overflow-hidden" />
);

const TextMessage = ({ message }: { message: Message }) => {
  const isLink = /^(ftp|http|https):\/\/[^ "]+$/.test(message.text); // [MODIFIED] Use message.text

  return (
    <div>
      {isLink ? (
        <a
          href={message.text}
          target="_blank"
          rel="noopener noreferrer"
          className="mr-2 text-sm font-light text-blue-400 underline"
        >
          {message.text}
        </a>
      ) : (
        <p className="mr-2 text-sm font-light">{message.text}</p>
      )}
    </div>
  );
};
