import { useEffect, useState } from "react";
import { usePostStore } from "@/store/usePostStore";
import PostSkeleton from "./skeletons/PostSkeleton";
import PostCard from "./PostCard";
import ImageModal from "./ImageModal";

interface PostsProps {
  feedType: string;
  userId?: string;
}
const Posts = ({ feedType, userId }: PostsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const {
    posts,
    likedPosts,
    userPosts,
    allFriendPost,
    isFetchingAllPosts,
    fetchAllPosts,
    fetchLikedPosts,
    fetchAllFriendPost,
    isFetchingAllFriendPost,
    isFetchingLikedPosts,
    fetchUserPosts,
    isFetchingUserPosts,
  } = usePostStore();

  useEffect(() => {
    if (feedType === "All Posts") {
      fetchAllPosts();
    } else if (feedType === "Posts Liked" && userId) {
      fetchLikedPosts(userId);
    } else if (feedType === "Friends") {
      fetchAllFriendPost();
    } else if (feedType === "User Posts" && userId) {
      fetchUserPosts(userId);
    }
  }, [
    feedType,
    userId,
    fetchAllPosts,
    fetchLikedPosts,
    fetchAllFriendPost,
    fetchUserPosts,
  ]);
  const handleImageClick = (imgUrl: string) => {
    setIsModalOpen(true);
    setSelectedImage(imgUrl);
  };

  const isLoading =
    (feedType === "All Posts" && isFetchingAllPosts) ||
    (feedType === "Posts Liked" && isFetchingLikedPosts) ||
    (feedType === "Friends" && isFetchingAllFriendPost) ||
    (feedType === "User Posts" && isFetchingUserPosts);

  const currentPosts =
    feedType === "All Posts"
      ? posts
      : feedType === "Posts Liked"
      ? likedPosts
      : feedType === "Friends"
      ? allFriendPost
      : userPosts; // for "User Posts"

  return (
    <>
      {isLoading && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && currentPosts?.length === 0 && (
        <p className="text-center my-4 text-gray-500">
          {feedType === "User Posts"
            ? "This user hasn’t posted anything yet."
            : "No posts found."}
        </p>
      )}

      {!isLoading && currentPosts && (
        <div>
          {currentPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onImageClick={handleImageClick}
            />
          ))}
        </div>
      )}

      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imgUrl={selectedImage}
      />
    </>
  );
};
export default Posts;
