import { useRequestStore } from "@/store/useRequestStore";
import FriendRequestItem from "./FriendRequestItem";
import { useEffect } from "react";

export const FriendRequestDisplay = () => {
  const {
    getPendingRequests,
    getSentRequests,
    pendingRequests,
    sentRequests,
    isLoadingSentRequests,
    isLoadingPendingRequests,
  } = useRequestStore();

  useEffect(() => {
    getPendingRequests();
    getSentRequests();
  }, [getPendingRequests, getSentRequests]);

  const showLoading =
    (isLoadingSentRequests && sentRequests.length === 0) ||
    (isLoadingPendingRequests && pendingRequests.length === 0);

  if (showLoading) {
    return (
      <p className="text-center text-muted-foreground p-4">
        Loading requests...
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {pendingRequests.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-lg font-semibold text-foreground">
            Request received ({pendingRequests?.length})
          </p>
          {pendingRequests.map((request) => (
            <FriendRequestItem
              key={request._id}
              request={request}
              type="received"
            />
          ))}
        </div>
      )}

      {sentRequests.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-lg font-semibold text-foreground">
            Request sent ({sentRequests?.length})
          </p>
          {sentRequests.map((request) => (
            <FriendRequestItem
              key={request._id}
              request={request}
              type="sent"
            />
          ))}
        </div>
      )}

      {pendingRequests.length === 0 && sentRequests.length === 0 && (
        <p className="text-center text-muted-foreground p-4">
          No friends requests
        </p>
      )}
    </div>
  );
};
