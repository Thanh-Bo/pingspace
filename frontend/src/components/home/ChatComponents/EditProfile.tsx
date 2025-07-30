// src/components/EditProfile.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ChevronLeft } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const EditProfile = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { authUser, updateProfile } = useAuthStore();
  const [openPopover, setOpenPopover] = useState(false);
  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || "",
    bio: authUser?.bio || "",
    gender: authUser?.gender || "",
    dateOfBirth: authUser?.dateOfBirth
      ? new Date(authUser.dateOfBirth)
      : undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToUpdate = {
      fullName: formData.fullName,
      bio: formData.bio,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
    };

    try {
      await updateProfile(dataToUpdate);
      onClose(); // Close the dialog on success
    } catch (error) {
      // Error handling is already in useAuthStore, but good to have a catch here too
      console.error("Failed to update profile:", error);
    }
  };

  const handleGenderChange = (value: string) => {
    setFormData({ ...formData, gender: value });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center text-lg font-semibold">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="mr-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            Edit your personal information
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Display name */}
          <div>
            <Label htmlFor="fullName" className="text-sm font-medium ">
              Display name
            </Label>
            <Input
              id="fullName"
              className="mt-2"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
            />
          </div>
          {/* Bio */}
          <div>
            <Label htmlFor="fullName" className="text-sm font-medium ">
              Bio
            </Label>
            <Input
              id="Bio"
              className="mt-2"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
            />
          </div>

          {/* Personal Information - Gender */}
          <div className="space-y-2">
            <Label className="text-sm font-medium ">Personal information</Label>
            <RadioGroup
              value={formData.gender}
              onValueChange={handleGenderChange}
              className="flex space-x-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Date of Birth */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="date" className="px-1">
              Date of birth
            </Label>
            <Popover
              modal={true}
              open={openPopover}
              onOpenChange={setOpenPopover}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  id="date"
                  className="w-full justify-between font-normal"
                >
                  {formData.dateOfBirth
                    ? formData.dateOfBirth.toLocaleDateString()
                    : "Select Date"}
                  <CalendarIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="  p-0 z-[9999]" align="center">
                <Calendar
                  mode="single"
                  className="w-full"
                  selected={formData.dateOfBirth}
                  captionLayout="dropdown"
                  onSelect={(selectedDate) => {
                    setFormData({ ...formData, dateOfBirth: selectedDate });
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t -mx-4 px-4">
            {" "}
            {/* Adjusted padding/margin */}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="outline">
              Update
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfile;
