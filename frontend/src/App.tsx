import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { SignupPage } from "./components/pages/SignupPage";
import { LoginPage } from "./components/pages/LoginPage";
import HomePage from "./components/pages/HomePage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import FriendPage from "./components/pages/FriendPage";
import SideBarPage from "./components/SideBarPage";
import PostPage from "./components/pages/PostPage";
import NotificationPage from "./components/pages/NotificationPage";
import ChatBoxPage from "./components/pages/ChatBoxPage";
import ProfilePage from "./components/pages/ProfilePage";
import { Button } from "./components/ui/button";
import { ArrowLeft } from "lucide-react";
function App() {
  const {
    authUser,
    isCheckingAuth,
    checkAuth,
    isRightPanelFullScreenOnMobile,
  } = useAuthStore();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return <h1>Loading...</h1>;
  }
  // Pages that should hide the sidebar on < 1024px
  const fullWidthPages = ["/post", "/notification"];
  const isProfilePage = location.pathname.startsWith("/profile/");
  const isFullWidth =
    fullWidthPages.includes(location.pathname) || isProfilePage;

  let backLabel = "Back";
  if (location.pathname === "/post") backLabel = "Post";
  else if (location.pathname === "/notification") backLabel = "Notification";
  else if (isProfilePage) backLabel = "Profile";

  return (
    <main className="flex h-screen overflow-hidden bg-container ">
      {authUser && (
        <div
          className={` w-15 lg:w-50 flex-shrink-0 h-full    border border-l border-t border-b  flex justify-center pr-3
          ${isRightPanelFullScreenOnMobile ? "hidden" : "flex"} 
         md:flex  
          ${isFullWidth ? "hidden " : "flex"} `}
        >
          <SideBarPage />
        </div>
      )}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {" "}
        {/* flex-col for vertical content on pages */}
        <div className="max-w-[1700px] mx-auto w-full h-full flex flex-col">
          {/* Back button only on full-width mobile view */}
          {isFullWidth && (
            <div className="md:hidden flex items-center p-3 border-b border-border">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden mr-2 text-foreground hover:bg-chat-hover"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={20} />
              </Button>
              <span className="font-medium md:hidden">{backLabel}</span>
            </div>
          )}
          {/* New wrapper for max-width */}
          <Routes>
            <Route
              path="/signup"
              element={!authUser ? <SignupPage /> : <Navigate to="/" />}
            />
            <Route
              path="/login"
              element={!authUser ? <LoginPage /> : <Navigate to="/" />}
            />
            <Route
              path="/"
              element={authUser ? <HomePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/friends"
              element={authUser ? <FriendPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/post"
              element={authUser ? <PostPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/notification"
              element={
                authUser ? <NotificationPage /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/profile/:id"
              element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/chatBox"
              element={authUser ? <ChatBoxPage /> : <Navigate to="/login" />}
            />
          </Routes>
        </div>
      </div>

      <Toaster />
    </main>
  );
}

export default App;
