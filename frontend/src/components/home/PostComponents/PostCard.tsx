import { FaRegComment } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { ChangeEvent, useState } from "react";
import { Link } from "react-router-dom";
import type { Post } from "@/store/usePostStore";
import { usePostStore } from "@/store/usePostStore";
import { useAuthStore } from "@/store/useAuthStore";
import LoadingSpinner from "./LoadingSpinner";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp } from "lucide-react";

interface PostCardProps {
  post: Post;
  onImageClick: (imgUrl: string) => void;
}
const PostCard = ({ post, onImageClick }: PostCardProps) => {
  const {
    deletePost,
    commentOnPost,
    likeUnlikePost,
    isDeletingPost,
    isCommentingPost,
    isLikingPost,
  } = usePostStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);

  const [comment, setComment] = useState("");
  const postOwner = post.user;
  const { authUser } = useAuthStore();
  if (authUser === null) {
    return;
  }
  const isMyPost = authUser?._id === post.user._id;
  const isLiked = post.likes.includes(authUser._id);

  const handleDeletePost = () => {
    deletePost(post._id);
  };

  const handlePostComment = (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    commentOnPost(post._id, comment);
    setComment("");
  };

  const handleLikePost = () => {
    likeUnlikePost(post._id);
  };
  const formattedDate = formatDate(Date.parse(post.createdAt));

  return (
    <>
      <div className="flex gap-2 items-start p-4 border-b border-gray-700">
        {/* Avatar */}
        <div className="avatar">
          <Link
            to={`/profile/${postOwner._id}`}
            className="w-8 rounded-full overflow-hidden"
          >
            <Avatar className=" ">
              <AvatarImage
                src={postOwner.profilePic || "/avatar-placeholder.png"}
              />
            </Avatar>
          </Link>
        </div>

        <div className="flex flex-col flex-1">
          <div className="flex gap-2 items-center">
            {/* Full name , username , time */}
            <Link to={`/profile/${postOwner._id}`} className="font-bold">
              {postOwner.fullName}
            </Link>
            <span className="text-gray-700 flex gap-1 text-sm">
              <span className="  ">{formattedDate}</span>
            </span>
            {/* Delete */}
            {isMyPost && (
              <span className="flex justify-end flex-1">
                {!isDeletingPost && (
                  <FaTrash
                    className="cursor-pointer hover:text-red-500"
                    onClick={() => setDeleteDialogOpen(true)}
                  />
                )}
                {isDeletingPost && <LoadingSpinner size="lg" />}
              </span>
            )}
          </div>
          {/* Text and image post */}
          <div className="flex flex-col gap-3 overflow-hidden">
            <span>{post.text}</span>
            {post.img && (
              <img
                src={post.img || ""}
                className="h-80 object-contain rounded-lg border border-gray-700"
                onClick={() => onImageClick(post.img || "")}
                alt=""
              />
            )}
            {post.video && (
              <video
                src={post.video || ""}
                className="h-80 object-contain rounded-lg border border-gray-700"
                controls
                muted
              />
            )}
          </div>
          <div className="flex justify-between mt-3">
            <div className="flex gap-4 items-center w-2/3 justify-between">
              {/* Like */}
              <div
                className="flex gap-1 items-center group cursor-pointer"
                onClick={handleLikePost}
              >
                {isLikingPost && <LoadingSpinner size="sm" />}
                {!isLiked && !isLikingPost && (
                  <ThumbsUp className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                )}
                {isLiked && !isLikingPost && (
                  <ThumbsUp className="w-4 h-4 cursor-pointer text-pink-500 " />
                )}

                <span
                  className={`text-sm text-slate-500 group-hover:text-pink-500 ${
                    isLiked ? "text-pink-500" : ""
                  }`}
                >
                  {post.likes.length}
                </span>
              </div>
              {/* Comment */}
              <div
                className="flex gap-1 items-center cursor-pointer group"
                onClick={() => setCommentsDialogOpen(true)}
              >
                <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {post.comments.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Post Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Post?</DialogTitle>
              <p>Do you want to delete this post?</p>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeletePost}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Comment Dialog   */}
        <Dialog open={commentsDialogOpen} onOpenChange={setCommentsDialogOpen}>
          <DialogContent className="max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Comments</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              {post.comments.length === 0 && (
                <p className="text-sm text-slate-500">
                  No comments yet 🤔 Be the first one 😉
                </p>
              )}
              {post.comments.map((comment) => (
                <div key={comment._id} className="flex gap-2 items-start">
                  <Link to={`/profile/${comment.user._id}`}>
                    <Avatar>
                      <AvatarImage
                        src={comment.user.profilePic || "/pingspace.png"}
                      />
                    </Avatar>
                  </Link>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <Link to={`/profile/${comment.user._id}`}>
                        <span className="font-bold">
                          {comment.user.fullName}
                        </span>
                      </Link>
                      <span className="text-gray-700 flex gap-1 text-sm">
                        <span className="  ">
                          {formatDate(Date.parse(comment.createdAt))}
                        </span>
                      </span>
                    </div>
                    <div className="text-sm">{comment.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <form
              className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
              onSubmit={handlePostComment}
            >
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button type="submit" disabled={isCommentingPost}>
                {isCommentingPost ? "Posting..." : "Post"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};
export default PostCard;
