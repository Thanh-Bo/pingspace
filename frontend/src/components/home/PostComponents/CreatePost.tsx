import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { ChangeEvent, useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";

import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { usePostStore } from "@/store/usePostStore";
import { useAuthStore } from "@/store/useAuthStore";
import ImageModal from "./ImageModal";
import { Video } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
const CreatePost = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { authUser } = useAuthStore();

  const imgRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLInputElement | null>(null);

  const { createPost, isCreatingPost } = usePostStore();
  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createPost(text, img, video);
    setText("");
    setImg(null);
    setVideo(null);
  };

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert("Video is too large. Please upload an image smaller than 20MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setVideo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImgChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Please upload an image smaller than 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiClick = (emojiObject: EmojiClickData) => {
    setText((prevText) => prevText + emojiObject.emoji);
  };
  return (
    <div className="flex p-4 items-start gap-4 border-b border-gray-700">
      <div className="">
        <Avatar>
          <AvatarImage
            src={authUser?.profilePic || "/avatar-placeholder.png"}
          />
        </Avatar>
      </div>
      <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
        <Textarea
          className="textarea w-full p-2 text-lg resize-none  border-gray-800"
          placeholder="What is happening?!"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* Image Review */}
        {img && (
          <div className="relative w-72 mx-auto">
            <IoCloseSharp
              className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
              onClick={() => {
                setImg(null);
                if (imgRef.current) imgRef.current.value = "";
              }}
            />
            <img
              src={img}
              className="w-full mx-auto h-72 object-contain rounded"
              onClick={() => setIsModalOpen(true)}
            />
          </div>
        )}

        {/* Video Review */}
        {video && (
          <div className="relative w-72 mx-auto">
            <Video
              className="absolute top-0 right-0bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
              onClick={() => {
                setVideo(null);
                if (videoRef.current) videoRef.current.value = "";
              }}
            />
            <video
              src={video}
              className="w-full mx-auto h-72 object-contain rounded"
              controls
            />
          </div>
        )}

        <ImageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          imgUrl={img}
        />
        <div className="flex justify-between border-t py-2 border-t-gray-700">
          <div className="flex gap-3 items-center">
            {/* Image */}
            <CiImageOn
              className="fill-primary w-6 h-6 cursor-pointer"
              onClick={() => imgRef.current?.click()}
            />
            {/* Video */}
            <Video
              className="fill-primary w-6 h-6 cursor-pointer"
              onClick={() => videoRef.current?.click()}
            />
            {/* Emoji */}
            <BsEmojiSmileFill
              className="w-6 h-6 fill-primary"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            />
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="">
                <div className="flex justify-center bg-white shadow-lg rounded-md p-2">
                  <button
                    className="text-red-500 hover:text-red-700 text-lg font-bold px-2 !important"
                    onClick={() => setShowEmojiPicker(false)}
                  >
                    <span className="text-red-500">✖</span>
                  </button>
                </div>
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/png, image/jpeg, image/gif"
            hidden
            ref={imgRef}
            onChange={handleImgChange}
          />
          <input
            type="file"
            accept="video/mp4, video/webm, video/ogg"
            hidden
            ref={videoRef}
            onChange={handleVideoChange}
          />
          <Button className="btn btn-primary rounded-full btn-sm text-white px-4">
            {isCreatingPost ? "Posting..." : "Post"}
          </Button>
        </div>
      </form>
    </div>
  );
};
export default CreatePost;
