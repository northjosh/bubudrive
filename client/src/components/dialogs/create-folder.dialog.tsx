import { queryClient } from "@/main";
import { trpc } from "@/trpc";
import { useSignal } from "@preact/signals";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Plus, X } from "lucide-react";
import { useState } from "preact/hooks";

export function CreateFolderDialog() {
  const input = useSignal("");
  const [open, setOpen] = useState(false);
  const mutation = trpc.createFolder.useMutation({
    mutationKey: ["create-folder"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["getAllFolders"]] });
      setOpen(false); 
      input.value = ""; 
    },
  });

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        new folder
      </Button>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-full max-w-lg">
        <div className="bg-background border border-border rounded-lg shadow-lg p-6">

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Add Folder</h2>
            <Button
              variant="ghost"
              mode="icon"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate({ folderId: input.value });
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Folder name
              </label>
              <Input
                type="text"
                id="name"
                value={input.value}
                onChange={(e) => (input.value = e.currentTarget.value)}
                placeholder="Enter folder name..."
                required
                autoFocus
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Creating..." : "Create Folder"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
