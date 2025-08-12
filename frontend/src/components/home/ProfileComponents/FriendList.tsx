import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User } from "@/store/useAuthStore";
import { Link } from "react-router-dom";

interface FriendListProps {
  friends: User[];
  onClose?: () => void;
}
const FriendList = ({ friends, onClose }: FriendListProps) => {
  return (
    <div className="w-full max-w-sm overflow-y-auto">
      <div className="p-4">
        {friends.map((friend, index) => (
          <div key={friend._id}>
            <Link
              to={`/profile/${friend._id}`}
              className="flex items-center gap-2 hover:bg-accent p-2 "
              onClick={onClose}
            >
              <Avatar>
                <AvatarImage
                  src={friend.profilePic || "/pingspace.png"}
                  alt={friend.fullName}
                />
              </Avatar>
              <span className="text-sm">{friend.fullName}</span>
            </Link>
            {index !== friends.length - 1 && <Separator className="my-2" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendList;
