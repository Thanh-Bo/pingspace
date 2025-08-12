import { Link } from "react-router-dom";

import { FaTrash } from "react-icons/fa";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useEffect } from "react";
import LoadingSpinner from "../PostComponents/LoadingSpinner";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { MessageCircleMore, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const Notification = () => {
  const {
    isFetchingNotification,
    isDeletingNotification,
    isDeletingAllNotification,
    notifications,
    fetchNotifications,
    deleteAllNotifications,
    deleteNotificationById,
  } = useNotificationStore();
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const formatNotificationTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return `at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return `on ${date.toLocaleDateString("en-GB")}`; // e.g., 15/04/2025
    }
  };

  return (
    <>
      <div className="flex-1 border-l border-r border-gray-700 min-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h1 className="font-bold">Notifications</h1>
          {notifications.length !== 0 && (
            <Button
              onClick={deleteAllNotifications}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete All
            </Button>
          )}
        </div>

        {/* Show spinner while deleting all */}
        {(isDeletingAllNotification || isDeletingNotification) && (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* No notifications */}
        {!isFetchingNotification && notifications?.length === 0 && (
          <div className="text-center p-4 font-bold">No notifications 🤔</div>
        )}

        {/* Loading notifications */}
        {isFetchingNotification && (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {notifications.map((notification) => (
          <div className="border-b border-gray-700" key={notification._id}>
            <div className="flex gap-2 p-4 justify-between">
              <div className="flex  gap-2">
                {notification.type === "like" && <ThumbsUp className="" />}
                {notification.type === "comment" && (
                  <MessageCircleMore className="" />
                )}
                <div className="flex">
                  <Avatar className="">
                    <Link to={`/profile/${notification.from._id}`}>
                      <AvatarImage
                        src={notification.from.profilePic || "/pingspace.png"}
                      />
                    </Link>
                  </Avatar>
                  <div className="flex gap-1 ml-2">
                    <Link
                      className="font-bold"
                      to={`/profile/${notification.from._id}`}
                    >
                      {notification.from.fullName}
                    </Link>{" "}
                    {notification.type === "like"
                      ? "liked your post "
                      : "commented your post "}
                    {formatNotificationTime(notification.createdAt)}.
                  </div>
                </div>
              </div>

              <span className="flex justify-end ">
                <FaTrash
                  className="cursor-pointer hover:text-red-500 size-7"
                  onClick={() => deleteNotificationById(notification._id)}
                />
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
export default Notification;
