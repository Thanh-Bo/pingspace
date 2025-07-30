import { ArrowLeft } from "lucide-react";
import { FriendListDisplay } from "../home/FriendsListComponents/FriendListDisplay";
import { FriendRequestDisplay } from "../home/FriendsListComponents/FriendRequestDisplay";
import GroupListDisplay from "../home/FriendsListComponents/GroupListDisplay";
import { Button } from "../ui/button";
interface RightPanelFriendsProps {
  activeTab: "friends" | "groups" | "requests";
  onBackButtonClick: () => void;
}

const RightPanelFriends = ({
  activeTab,
  onBackButtonClick,
}: RightPanelFriendsProps) => {
  const getHeaderTitle = () => {
    switch (activeTab) {
      case "friends":
        return "Friends list";
      case "groups":
        return "Joined Groups & Communities";
      case "requests":
        return "Friend Requests";
      default:
        return "FriendsList";
    }
  };
  return (
    <div className="h-full flex flex-col bg-container overflow-hidden  ">
      <div className="w-full flex sticky top-0 bg-container z-10 p-4 border-b border-divider">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2 text-foreground hover:bg-chat-hover"
          onClick={onBackButtonClick} // Call the back button handler
          aria-label="Back to lists"
        >
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-xl font-semibold text-foreground flex-grow">
          {getHeaderTitle()}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "friends" && <FriendListDisplay />}
        {activeTab === "groups" && <GroupListDisplay />}
        {activeTab === "requests" && <FriendRequestDisplay />}
      </div>
    </div>
  );
};

export default RightPanelFriends;
