import { useChatStore } from "@/store/useChatStore";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; 
import { ImageIcon, Plus, Video} from "lucide-react";
import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast";
import { Button } from "../../ui/button";
import ReactPlayer from "react-player";

const MediaDropdown = () => {
    const imageInput = useRef<HTMLInputElement>(null);
    const videoInput = useRef<HTMLInputElement>(null);

    const [selectedImage , setSelectedImage] = useState<File | null>(null);
    const [selectedVideo , setSelectedVideo] = useState<File | null >(null); 

    const [isLoading , setIsLoading] = useState(false);
    // We'll use sendMessage to sende media messages and 
    // selectedChat to know the chat context
    const {sendMessage , selectedChat} = useChatStore();
    
    // Hanle image file selection and preview
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        if (!file.type.startsWith('image/')){
            toast.error("Please select an image file");
            return ;
        };
        setSelectedImage(file);
    };
    // Handle video file selection and preview
    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        if (!file.type.startsWith('video/')){
            toast.error("Please select an video file");
            return ;
        };
        setSelectedVideo(file);
    };
    // // Clear the selected image and reset the file input
    // const removeImage = () => {
    //     setSelectedImage(null);
    //     if(imageInput.current) imageInput.current.value = "";
    // };
    // // Clear the selected video and reset the file input
    // const removeVideo = () => {
    //     setSelectedVideo(null);
    //     if(videoInput.current) videoInput.current.value = "";
    // };

    // Handle sending the image as a  base 64 string 
    const handleSendImage = async () => {
        if (!selectedImage || !selectedChat) return ; 
        setIsLoading(true);
        try {
            // Convert image to base64
            const reader = new FileReader();
            reader.readAsDataURL(selectedImage);
            reader.onloadend =  async () => {
                const base64String = reader.result as string ; 
                // Send image as  a string message 
                await sendMessage({
                    image : base64String , 
                });
                setSelectedImage(null);
                toast.success("Image sent successfully");
                setIsLoading(false);
            };
            reader.onerror = () => {
                throw new Error("Failed to read image file");
            }

        }
        catch(error){
            toast.error("Failed to sent image");
            console.error('Image send error' ,error);
            setIsLoading(false);
        }
    }

    // Handle sending the video as a  base 64 string 
    const handleSendVideo = async () => {
        if (!selectedVideo|| !selectedChat) return ; 
        setIsLoading(true);
        try {
            // Convert image to base64
            const reader = new FileReader();
            reader.readAsDataURL(selectedVideo);
            reader.onloadend =  async () => {
                const base64String = reader.result as string ; 
                // Send image as  a string message 
                await sendMessage({
                    video : base64String , 
                });
                setSelectedVideo(null);
                toast.success("Video sent successfully");
                setIsLoading(false);
            };
            reader.onerror = () => {
                throw new Error("Failed to read video file");
            }

        }
        catch(error){
            toast.error("Failed to sent video");
            console.error('Video send error' ,error);
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <input 
                type='file'
                ref={imageInput}
                accept='image/*'
                onChange={handleImageChange}
                hidden
            />
            <input 
                type='file'
                ref={videoInput}
                accept='video/mp4'
                onChange={handleVideoChange}
                hidden
            />

            {selectedImage && (
                <MediaImageDialog
                    isOpen={selectedImage !== null}
                    onClose={() => setSelectedImage(null)}
                    selectedImage= {selectedImage}
                    isLoading={isLoading}
                    handleSendImage={handleSendImage}
                />
            )}
            {selectedVideo && (
                <MediaVideoDialog
                    isOpen={selectedVideo !== null}
                    onClose={() => setSelectedVideo(null)}
                    selectedVideo = {selectedVideo}
                    isLoading={isLoading}
                    handleSendVideo={handleSendVideo}
                />
            )}

            <DropdownMenu>
				<DropdownMenuTrigger>
					<Plus className='text-gray-600 dark:text-gray-400' />
				</DropdownMenuTrigger>

				<DropdownMenuContent>
					<DropdownMenuItem onClick={() => imageInput.current!.click()}>
						<ImageIcon size={18} className='mr-1' /> Photo
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => videoInput.current!.click()}>
						<Video size={20} className='mr-1' />
						Video
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
        </>
    )
};

// Define the MediaImageDialog component
type MediaImageDialogProps = {
    isOpen : boolean ; // Whether the dialog is open
    onClose : () => void ; // Function to close the dialog
    selectedImage : File ; // The selected image file
    isLoading : boolean ;
    handleSendImage: () => void ; // Function to send the image
}

const MediaImageDialog = ({ isOpen , onClose , selectedImage , isLoading ,handleSendImage} : MediaImageDialogProps) => {
    // Set up state for rendering the image review
    const [renderedImage , setRenderedImage] = useState<string | null >(null);
    // Convert the image file to a URL
    useEffect(() => {
        if (!selectedImage) return ;
        const reader = new FileReader();
        reader.onload = (e) => setRenderedImage(e.target?.result as string );
        reader.readAsDataURL(selectedImage);

    }, [selectedImage]);

    // Render the dialog with the image preview and send button 
    return (
        <Dialog 
            open={isOpen}
            onOpenChange={(isOpen) => {
                if (!isOpen) onClose();
            }}
        >
            <DialogContent>
                <VisuallyHidden>
					<DialogTitle>Preview Image</DialogTitle>
				</VisuallyHidden>
                <DialogDescription className="flex flex-col gap-10 justify-center items-center">
                    {renderedImage && <img src={renderedImage}  width={300} height={300} alt='selected image' />}

                    <Button className="w-full" 
                            disabled={isLoading} 
                            onClick={handleSendImage}
                    >
                        {isLoading ? "Sending..." : "Send"}
                    </Button>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    )
};
// Renders a dialog for previewing a video before sending
type MediaVideoDialogProps = {
    isOpen : boolean ; 
    onClose : () => void ; 
    selectedVideo : File ; 
    isLoading : boolean ; 
    handleSendVideo : () => void ;
}

const MediaVideoDialog = ({ isOpen , onClose , selectedVideo , isLoading , handleSendVideo} : MediaVideoDialogProps) => {
    // Convert video file to a URL for previewing
    const renderedVideo = URL.createObjectURL(new Blob([selectedVideo], {type : "video/mp4"}));
    // Render the dialog with the video preview and send button
    return (
        <Dialog 
            open={isOpen}
            onOpenChange={(isOpen) => {
                if (!isOpen) onClose();
            }}
        >
            <DialogContent>
             <VisuallyHidden>
					<DialogTitle>Preview Video</DialogTitle>
				</VisuallyHidden>
                <DialogDescription>Video</DialogDescription>
                <div className="w-full">
                    {renderedVideo && <ReactPlayer url={renderedVideo} controls width='100%' /> }

                </div>
                <Button 
                    className="w-full" 
                    disabled={isLoading} 
                    onClick={handleSendVideo}
                >
                    {isLoading ? "Sending..." : "Send"} 
                </Button>
            </DialogContent>
        </Dialog>
    )
}
export default MediaDropdown;