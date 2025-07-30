import { useEffect, useState } from "react";
import LeftPanelFriends from "../leftPanel/LeftPanelFriends";
import RightPanelFriends from "../rightPanel/RightPanelFriends";
import { useAuthStore } from "@/store/useAuthStore";

const FriendPage = () => {
  const [activeTab, setActiveTab] = useState<"friends" | "groups" | "requests">(
    "friends"
  );
  // 'tabs' means LeftPanelFriends (with tabs) is visible
  // 'content' means RightPanelFriends (with list content) is visible
  const [activeSubPanel, setActiveSubPanel] = useState<"tabs" | "content">(
    "tabs"
  );

  const {setRightPanelFullScreenOnMobile} = useAuthStore();


  const handleTabSelected = () => {
    setActiveSubPanel("content");
    setRightPanelFullScreenOnMobile(true);
  };

  const handleBackToTabs = () => {
    setActiveSubPanel("tabs");
    setRightPanelFullScreenOnMobile(false);
  };

   // Reset full screen state when component unmounts or activeSubPanel changes to 'tabs'
  useEffect(() => {
    // When mounting or switching back to tabs, ensure sidebar is visible (false)
    if (activeSubPanel === 'tabs') {
      setRightPanelFullScreenOnMobile(false);
    }
   
  }, [activeSubPanel, setRightPanelFullScreenOnMobile]);

  return (
    <div className="flex flex-1 h-full ">
      {/* Use flex-1 and h-full to fill parent */}
      <div
        className={`w-full md:w-1/4 h-full ${
          activeSubPanel === "content" ? "hidden" : "flex"
        } md:flex flex-col`}
      >
        <LeftPanelFriends
          setActiveTab={setActiveTab}
          activeTab={activeTab}
          onTabSelect={handleTabSelected}
        />
      </div>
      <div
        className={`w-full md:w-3/4 h-full ${
          activeSubPanel === "content" ? "flex" : "hidden"
        } md:flex flex-col`}
      >
        <RightPanelFriends
          activeTab={activeTab}
          onBackButtonClick={handleBackToTabs}
        />
      </div>
    </div>
  );
};

export default FriendPage;
