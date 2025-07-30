import { Group, User, UserRoundPlus, UserSearch } from "lucide-react";
import { Input } from "../ui/input";

interface LeftPanelFriendsProps {
  setActiveTab: (tab: "friends" | "groups" | "requests") => void;
  activeTab: "friends" | "groups" | "requests";
  onTabSelect: () => void;
}

const LeftPanelFriends = ({
  activeTab,
  setActiveTab,
  onTabSelect,
}: LeftPanelFriendsProps) => {
  const handleTabClick = (tab: "friends" | "groups" | "requests") => {
    setActiveTab(tab);
    onTabSelect();
  };
  return (
    <div className=" h-[calc(100vh-130px)] bg-container flex flex-col flex-1 border-r  border-divider rounded-l-xl">
      <div className="w-full sticky top-0 bg-container z-10 p-4 ">
        <div className="relative flex items-center">
          <UserSearch
            size={20}
            className="absolute left-3 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 rounded-full bg-background border-input-border text-foreground placeholder:text-muted-foreground focus-visible:ring-transparent focus:outline-none"
          />
        </div>
      </div>

      <nav className="w-full flex flex-col flex-1 overflow-y-auto py-3">
        {/* Friends List */}
        <div
          className={`flex items-center gap-4 p-3 cursor-pointer hover:bg-chat-hover transition-colors duration-200
            ${activeTab === "friends" ? "bg-chat-hover" : ""}`}
          onClick={() => handleTabClick("friends")}
        >
          <User size={20} className="text-icon" />
          <span className="text-foreground font-medium">Friends list</span>
        </div>

        {/* Joined Groups and Communities */}
        <div
          className={`flex items-center gap-4 p-3 cursor-pointer hover:bg-chat-hover transition-colors duration-200
                ${activeTab === "groups" ? "bg-chat-hover" : ""}`}
          onClick={() => handleTabClick("groups")}
        >
          <Group size={20} className="text-icon" /> {/* Icon for Groups */}
          <span className="text-foreground font-medium">
            Joined groups and communities
          </span>
        </div>

        {/* Friend Requests */}
        <div
          className={`flex items-center gap-4 p-3 cursor-pointer hover:bg-chat-hover transition-colors duration-200
                  ${activeTab === "requests" ? "bg-chat-hover" : ""}`}
          onClick={() => handleTabClick("requests")}
        >
          <UserRoundPlus size={20} className="text-icon" />{" "}
          {/* Icon for Friend Requests */}
          <span className="text-foreground font-medium">Friend requests</span>
        </div>
      </nav>
    </div>
  );
};

export default LeftPanelFriends;
