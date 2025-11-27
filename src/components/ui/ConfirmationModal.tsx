import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  title: string;
  description: string;
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: "default" | "destructive";
  icon?: "warning" | "info" | "success" | "error";
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmationModal({
  open,
  title,
  description,
  cancelText = "Cancel",
  confirmText = "Confirm",
  confirmVariant = "default",
  icon = "warning",
  onCancel,
  onConfirm,
  isLoading = false,
}: ConfirmationModalProps) {
  const iconClasses = {
    warning: "text-amber-500",
    info: "text-blue-500",
    success: "text-emerald-500",
    error: "text-red-500",
  };

  return (
    <AlertDialog open={open} onOpenChange={(state) => !state && onCancel()}>
      <AlertDialogContent className="w-[90vw] max-w-md rounded-lg animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 animate-in slide-in-from-left-4 fade-in-0 duration-300 delay-75">
            <div className="animate-pulse">
              <AlertTriangle className={`h-6 w-6 ${iconClasses[icon]} animate-in zoom-in-50 duration-500`} />
            </div>
            <AlertDialogTitle className="animate-in slide-in-from-right-2 fade-in-0 duration-300 delay-100">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="mt-2 text-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-150">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3 justify-end pt-4 animate-in slide-in-from-bottom-3 fade-in-0 duration-300 delay-200">
          <AlertDialogCancel onClick={onCancel} disabled={isLoading} className="transition-all hover:scale-105 active:scale-95">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={
              confirmVariant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all hover:scale-105 active:scale-95"
                : "transition-all hover:scale-105 active:scale-95"
            }
          >
            {isLoading ? "Loading..." : confirmText}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
