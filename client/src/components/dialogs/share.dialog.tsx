import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type {
  Folder as FolderType,
  File as FileType,
} from "../../../../shared/types";
import { trpc } from "@/trpc";
import MultipleSelector, { type Option } from "../ui/multiselect";
import { useState } from "preact/hooks";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface ShareDialogProps {
  entity: FolderType | FileType;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ShareDialog({ entity, isOpen, onClose }: ShareDialogProps) {
  const shareFolderMutation = trpc.shareFolder.useMutation({
    onSuccess: () => {
      toast.success("File shared");
      onClose();
    },
  });
  const shareFileMutation = trpc.shareFile.useMutation({
    onSuccess: () => {
      toast.success("File shared");
      onClose();
    },
  });
  const { data: allUsers } = trpc.fetchUsers.useQuery();
  const [users, setUsers] = useState<string[]>([]);

  const userOptions: Option[] =
    allUsers?.map((u) => ({
      label: u.username,
      value: u.id,
    })) || [];

  const handleShare = () => {
    if (entity.type === "folder") {
      shareFolderMutation.mutate({
        folderId: entity.id,
        targetUserIds: users,
        access: "read",
      });
    } else {
      shareFileMutation.mutate({
        fileId: entity.id,
        targetUserIds: users,
        access: "read",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share {entity.name} </DialogTitle>
        </DialogHeader>
        <div className="*:not-first:mt-2">
          <Label>share with: </Label>
          <MultipleSelector
            commandProps={{
              label: "select users",
            }}
            // onSearch={async (value) => {
            //   const res = trpc.searchUsers.useQuery({ query: value });
            //   return (
            //     res.data?.map((user: { username: string; id: string }) => ({
            //       label: user.username,
            //       value: user.id,
            //     })) || []
            //   );
            // }}
            onChange={(options) => {
              const opts = options.map((opt) => opt.value);
              setUsers(opts);
            }}
            options={userOptions}
            placeholder="start typing to search for users"
            hidePlaceholderWhenSelected
            selectFirstItem={false}
            emptyIndicator={
              <p className="text-center text-sm">No results found</p>
            }
          />
        </div>
        <Button
          onClick={handleShare}
          disabled={
            shareFileMutation.isPending || shareFolderMutation.isPending
          }
        >
          share
        </Button>
      </DialogContent>
    </Dialog>
  );
}
