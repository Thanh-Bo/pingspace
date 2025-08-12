import {
  Navigate,
  Route,
  Routes,
  // useLocation,
  // useNavigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { SignupPage } from "./components/pages/SignupPage";
import { LoginPage } from "./components/pages/LoginPage";
import HomePage from "./components/pages/HomePage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import FriendPage from "./components/pages/FriendPage";
import SideBarPage from "./components/SideBarPage";
// import { useChatStore } from "./store/useChatStore";
import PostPage from "./components/pages/PostPage";
import NotificationPage from "./components/pages/NotificationPage";
import ChatBoxPage from "./components/pages/ChatBoxPage";
import ProfilePage from "./components/pages/ProfilePage";
function App() {
  const {
    authUser,
    isCheckingAuth,
    checkAuth,
    isRightPanelFullScreenOnMobile,
  } = useAuthStore();
  // const { selectedChat, setSelectedChat } = useChatStore();
  // const navigate = useNavigate();
  // const location = useLocation();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // useEffect(() => {
  //   if (selectedChat && location.pathname !== "/") {
  //     navigate("/");
  //   }
  // }, [selectedChat, location.pathname, navigate]);

  // useEffect(() => {
  //   if (location.pathname === "/friends") {
  //     setSelectedChat(null);
  //   }
  // }, [location.pathname, setSelectedChat]);
  if (isCheckingAuth && !authUser) {
    return <h1>Loading...</h1>;
  }

  return (
    <main className="flex h-screen overflow-hidden bg-container ">
      {authUser && (
        <div
          className={`w-50 flex-shrink-0 h-full    border border-l border-t border-b  flex justify-center pr-3
          ${isRightPanelFullScreenOnMobile ? "hidden" : "flex"} 
         md:flex  `}
        >
          <SideBarPage />
        </div>
      )}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {" "}
        {/* flex-col for vertical content on pages */}
        <div className="max-w-[1700px] mx-auto w-full h-full flex flex-col">
          {" "}
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
