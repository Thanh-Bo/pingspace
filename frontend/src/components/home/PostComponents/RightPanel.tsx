import { Link } from "react-router-dom";
import RightPanelSkeleton from "./skeletons/RightPanelSkeleton";
import { usePostStore } from "@/store/usePostStore";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useRequestStore } from "@/store/useRequestStore";

const RightPanel = () => {
  const { isFetchingSuggestUser, fetchSuggestedUsers, suggestedUsers } =
    usePostStore();
  const { sendRequest, isSendingRequest, sentRequests, pendingRequests } =
    useRequestStore();
  useEffect(() => {
    fetchSuggestedUsers();
  }, [fetchSuggestedUsers]);

  const handleAddFriend = async (userId: string) => {
    await sendRequest(userId);
  };

  if (suggestedUsers?.length === 0) return <div className="md:w-64 w-0"></div>;

  return (
    <div className="w-full hidden lg:block ">
      <div className="p-4 rounded-md sticky tp-0">
        <p className="font-bold">People you may know</p>
        <div className="flex flex-col gap-4">
          {/* item */}
          {isFetchingSuggestUser && (
            <>
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
            </>
          )}
          {!isFetchingSuggestUser &&
            suggestedUsers?.map((user) => {
              // Check if I have already sent them a request
              const hasSentRequest = sentRequests.some(
                (req) =>
                  req.receiver._id === user._id && req.status === "pending"
              );

              // Check if they have sent me a request
              const hasReceivedRequest = pendingRequests.some(
                (req) => req.sender._id === user._id && req.status === "pending"
              );

              // Skip if request already exists in either direction
              if (hasSentRequest || hasReceivedRequest) return null;
              return (
                <div
                  className="flex items-center justify-between gap-4 "
                  key={user._id}
                >
                  <Link
                    to={`/profile/${user._id}`}
                    className="flex gap-2 items-center"
                  >
                    <Avatar>
                      <AvatarImage src={user.profilePic || "/pingspace.png"} />
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold tracking-tight truncate w-28">
                        {user.fullName}
                      </span>
                      <span className="text-sm text-slate-500">
                        @{user.fullName}
                      </span>
                    </div>
                  </Link>
                  <div>
                    {/* Add Friend Button  */}

                    <Button onClick={() => handleAddFriend(user._id)}>
                      {isSendingRequest ? "Sending" : "Add Friend"}
                    </Button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
export default RightPanel;
