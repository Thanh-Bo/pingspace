// src/components/pages/HomePage.tsx

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import LeftPanelChat from "../leftPanel/LeftPanelChat";
import RightPanelChat from "../rightPanel/RightPanelChat";
import { useChatStore } from "@/store/useChatStore";

const HomePage = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { setRightPanelFullScreenOnMobile } = useAuthStore();

  const { setSelectedChat } = useChatStore();

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setRightPanelFullScreenOnMobile(true);
  };

  // Back to chat list button handler
  const handleBackToChatList = () => {
    setSelectedChatId(null);
    setRightPanelFullScreenOnMobile(false);
    setSelectedChat(null);
  };

  // For mobile view: Ensure sidebar is visible when no chat is selected locally
  useEffect(() => {
    if (selectedChatId === null) {
      setRightPanelFullScreenOnMobile(false);
    }
  }, [selectedChatId, setRightPanelFullScreenOnMobile]);

  return (
    <main className="flex-1 h-full">
      <div className="flex h-[calc(100vh-0px)] max-w-[1700px] mx-auto bg-left-panel">
        <div className="bg-color-background text-color-foreground fixed top-0 left-0 w-full h-36 -z-30" />
        <div
          className={`w-full md:w-1/4 h-full ${
            selectedChatId ? "hidden" : "flex"
          } md:flex flex-col`}
        >
          <LeftPanelChat onChatSelect={handleChatSelect} />
        </div>

        <div
          className={`w-full md:w-3/4 h-full ${
            selectedChatId ? "flex" : "hidden"
          } md:flex flex-col`}
        >
          <RightPanelChat
            selectedChatId={selectedChatId} // This prop will now be correctly set
            onBackButtonClick={handleBackToChatList}
          />
        </div>
      </div>
    </main>
  );
};

export default HomePage;
