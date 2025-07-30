import { Link, useLocation } from "react-router-dom";
import { Contact, LogOut, MessageCircle } from "lucide-react";
import ProfileDialog from "./home/ChatComponents/ProfileDialog";
import { useAuthStore } from "@/store/useAuthStore";
import { ThemeProvider } from "./theme-provider";
import { ModeToggle } from "./mode-toggle";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const SideBarPage = () => {
  const { authUser } = useAuthStore();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { logout } = useAuthStore();
  const handleLogout = () => {
    logout();
  };
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="">
      <div className="sticky top-0 left-0 h-full flex flex-col w-full">
        {" "}
        <ul className="flex flex-col gap-3 mt-4 justify-center items-center ml-3">
          <li className="flex justify-center md:justify-start">
            <div
              onClick={() => setIsOpen(true)}
              className="cursor-pointer hover:bg-chat-hover p-2 rounded-full transition-all"
            >
              <Avatar>
                <AvatarImage src={authUser?.profilePic || "pingspace.png"} />
                <AvatarFallback>
                  {authUser?.fullName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <ProfileDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
          </li>

          {/* Home/Chat Link */}
          <li className="flex justify-center md:justify-start">
            <Link
              to="/"
              className={`flex gap-3 items-center hover:bg-chat-hover transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer
                ${
                  isActive("/")
                    ? "bg-chat-item-selected text-primary"
                    : "text-foreground"
                }`}
            >
              <MessageCircle className="w-6 h-6" />{" "}
              {/* Changed icon to MessageCircle for chat */}
            </Link>
          </li>

          {/* Friends List Link */}
          <li className="flex justify-center md:justify-start">
            <Link
              to="/friends"
              className={`flex gap-3 items-center hover:bg-chat-hover transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer
                ${
                  isActive("/friends")
                    ? "bg-chat-item-selected text-primary"
                    : "text-foreground"
                }`}
            >
              <Contact className="w-6 h-6" />
            </Link>
          </li>
          <li className="flex justify-center md:justify-start">
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <ModeToggle />
            </ThemeProvider>
          </li>
        </ul>
        <div className="flex justify-center mt-auto mb-4">
          <LogOut className="w-6 h-6 cursor-pointer" onClick={handleLogout} />
        </div>
      </div>
    </div>
  );
};

export default SideBarPage;
