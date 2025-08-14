import { AlertCircle, Folder, FileText } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { trpc } from "../../trpc";
import type { Folder as FolderType } from "../../../../server/lib/folder";

interface DeleteFolderDialogProps {
  folder: FolderType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteFolderDialog({
  folder,
  isOpen,
  onClose,
  onSuccess,
}: DeleteFolderDialogProps) {
  const deletefolderMutation = trpc.deleteFolder.useMutation({
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      console.error("Failed to delete folder:", error);
      // You can add toast notification here
    },
  });

  // Get files in this folder to show what will be deleted
  const { data: folderFiles } = trpc.getFilesFromFolder.useQuery(
    { folderId: folder?.id || "" },
    { enabled: !!folder?.id && isOpen }
  );

  const handleDelete = () => {
    if (!folder) return;

    deletefolderMutation.mutate({
      folderId: folder.id,
    });
  };

  if (!folder) return null;

  const fileCount = folderFiles?.length || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Delete folder</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the
                folder and all its contents.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-gray-50 rounded-lg p-4 my-4">
          <div className="flex items-center gap-3 mb-3">
            <Folder className="h-4 w-4 text-blue-500" />
            <div>
              <p className="font-medium text-sm">{folder.name}</p>
              <p className="text-xs text-gray-500">
                {fileCount} {fileCount === 1 ? "file" : "files"} inside
              </p>
            </div>
          </div>

          {fileCount > 0 && (
            <div className="border-t pt-3">
              <p className="text-xs font-medium text-gray-600 mb-2">
                This will also delete:
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FileText className="h-3 w-3" />
                <span>All {fileCount} files in this folder</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={deletefolderMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deletefolderMutation.isPending}
          >
            {deletefolderMutation.isPending ? "Deleting..." : "Delete folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
