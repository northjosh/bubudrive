import { AlertCircle, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/trpc";
import type { File } from "../../../../shared/types";
import { toast } from "sonner";

interface DeleteFileDialogProps {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteFileDialog({
  file,
  isOpen,
  onClose,
  onSuccess,
}: DeleteFileDialogProps) {
  const deleteFilesMutation = trpc.deleteFiles.useMutation({
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error("Failed to delete file");
    },
  });

  const handleDelete = () => {
    if (!file) return;

    deleteFilesMutation.mutate({
      fileIds: [file.id],
    });
  };

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Delete file</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the
                file.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-gray-50 rounded-lg p-4 my-4">
          <div className="flex items-center gap-3">
            <Trash2 className="h-4 w-4 text-gray-500" />
            <div>
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={deleteFilesMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteFilesMutation.isPending}
          >
            {deleteFilesMutation.isPending ? "Deleting..." : "Delete file"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
