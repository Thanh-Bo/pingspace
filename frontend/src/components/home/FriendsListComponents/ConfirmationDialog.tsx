import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "No",
  isConfirming = false,
  confirmVariant = "destructive",
}: ConfirmationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 z-40 bg-black/80">
        <DialogContent className="w-80  bg-container p-6 rounded-lg shadow-lg mx-auto my-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-semibold text-center">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground text-center mt-2">
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-5">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-full border-input-border text-foreground hover:bg-chat-hover"
              disabled={isConfirming}
            >
              {cancelText}
            </Button>
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              className="flex-1 rounded-full text-white"
              disabled={isConfirming}
            >
              {isConfirming ? "...." : confirmText}
            </Button>
          </div>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
};

export default ConfirmationDialog;
