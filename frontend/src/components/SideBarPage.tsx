import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  // Bot,
  Contact,
  LogOut,
  MessageCircle,
  Newspaper,
} from "lucide-react";
import ProfileDialog from "./home/ChatComponents/ProfileDialog";
import { useAuthStore } from "@/store/useAuthStore";
import { ThemeProvider } from "./theme-provider";
import { ModeToggle } from "./mode-toggle";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FaUser } from "react-icons/fa";

const SideBarPage = () => {
  const { authUser, logout } = useAuthStore();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { to: "/", icon: <MessageCircle />, label: "Home" },
    { to: "/friends", icon: <Contact />, label: "Friend Lists" },
    { to: "/post", icon: <Newspaper />, label: "Post" },
    {
      to: "/notification",
      icon: <Bell />,
      label: "Notification",
    },
    {
      to: `/profile/${authUser?._id}`,
      icon: <FaUser />,
      label: "Profile",
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 left-0 h-full flex flex-col  ">
        <ul className="flex flex-col gap-3 mt-4 ml-3">
          {/* Profile Dialog */}
          <li>
            <div
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-x-4 cursor-pointer hover:bg-chat-hover p-2 rounded-full transition-all"
            >
              <Avatar>
                <AvatarImage src={authUser?.profilePic || "pingspace.png"} />
                <AvatarFallback>
                  {authUser?.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xl font-medium lg:block hidden">
                {authUser?.fullName}
              </span>
            </div>
            <ProfileDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
          </li>

          {/* Menu Links */}
          {menuItems.map(({ to, icon, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={`flex items-center 
              gap-x-2 lg:gap-x-4   
              hover:bg-chat-hover transition-all rounded-full duration-300 
              py-2 pl-2 pr-2 lg:pl-4 lg:pr-4 text-xl
                  ${
                    isActive(to)
                      ? "text-primary bg-chat-item-selected"
                      : "text-foreground"
                  }`}
              >
                {icon}

                <span className="lg:block hidden">{label}</span>
              </Link>
            </li>
          ))}

          {/* Theme Toggle */}
          <li>
            <div className="flex items-center gap-x-4  pl-2 pr-4 text-xl hover:bg-chat-hover rounded-full transition-all">
              <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <ModeToggle />
              </ThemeProvider>
              <span className="lg:block hidden">Theme</span>
            </div>
          </li>
          <li>
            <div
              className="flex items-center gap-x-4 py-2 pl-4 pr-4  mb-4 cursor-pointer hover:bg-chat-hover rounded-full transition-all"
              onClick={handleLogout}
            >
              <LogOut className="w-6 h-6" />
              <span className="text-xl lg:block hidden">Logout</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SideBarPage;
