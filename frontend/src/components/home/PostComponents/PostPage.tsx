import { useState } from "react";
import CreatePost from "./CreatePost";
import Posts from "./Posts";
import { useAuthStore } from "@/store/useAuthStore";

const PostPage = () => {
  const [feedType, setFeedType] = useState("All Posts");
  const { authUser } = useAuthStore();
  return (
    <>
      <div className=" flex flex-col  w-full  mr-auto border-r border-gray-700 min-h-screen">
        <div className=" overflow-y-auto">
          {/* Header */}
          {/* Header */}
          <div className="flex w-full border-b border-gray-700">
            {["All Posts", "Posts Liked", "Friends"].map((tab) => (
              <div
                key={tab}
                className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
                onClick={() => setFeedType(tab)}
              >
                {tab}
                {feedType === tab && (
                  <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary"></div>
                )}
              </div>
            ))}
          </div>

          {/*  CREATE POST INPUT */}
          <CreatePost />

          {/* POSTS */}
          <Posts feedType={feedType} userId={authUser?._id} />
        </div>
      </div>
    </>
  );
};
export default PostPage;
