import { formatFileSize } from "@/utils/fileSize";
import { useSignal } from "@preact/signals";
import { Button } from "../ui/button";
import { Upload, X } from "lucide-react";
import { useState } from "preact/hooks";
import { useUploadFile } from "@/hooks/useFile";
import type { Folder } from "../../../../server/lib/folder";

interface UploadFileDialogProps {
  folders: Folder[];
}

export function UploadFileDialog({ folders }: UploadFileDialogProps) {
  const selectedFolder = useSignal("");
  const selectedFiles = useSignal<File[]>([]);
  const [open, setOpen] = useState(false);
  const fileMutation = useUploadFile();

  const myFolders = folders.filter(
    (folder: Folder) => folder.owner !== "shared"
  );
  const sharedFolders = folders.filter(
    (folder: Folder) => folder.owner === "shared"
  );

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles.value.length || !selectedFolder.value) return;

    try {
      fileMutation.mutate({
        foldername: selectedFolder.value,
        files: selectedFiles.value,
      });

      // Reset form and close dialog
      setOpen(false);
      selectedFiles.value = [];
      selectedFolder.value = "";
    } catch (error) {
      console.error("File upload failed:", error);
    }
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        variant="primary"
        size="sm"
        className="w-full justify-start"
      >
        <Upload className="h-4 w-4" />
        upload file
      </Button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-full max-w-lg">
        <div className="bg-background border border-border rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upload Files</h2>
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

          {/* Form */}
          <form onSubmit={handleFileUpload} className="space-y-4">
            {/* Folder Selection */}
            <div className="space-y-2">
              <label
                htmlFor="folder-select"
                className="text-sm font-medium text-foreground"
              >
                Select folder
              </label>
              <select
                id="folder-select"
                value={selectedFolder.value}
                onChange={(e) => (selectedFolder.value = e.currentTarget.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-ring outline-none"
                required
              >
                <option value="">Choose a folder...</option>
                {myFolders.map((f: Folder) => (
                  <option key={f.id} value={f.name}>
                    {f.name}
                  </option>
                ))}
                {sharedFolders.map((f: Folder) => (
                  <option key={f.id} value={f.name}>
                    {f.name} (shared)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="file-input"
                className="text-sm font-medium text-foreground"
              >
                Select files
              </label>
              <input
                type="file"
                id="file-input"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.currentTarget.files || []);
                  selectedFiles.value = files;
                }}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground file:mr-2 file:py-1 file:px-2 file:border-0 file:text-sm file:font-medium file:bg-muted file:text-muted-foreground hover:file:bg-muted/80"
                required
              />

        h
              {selectedFiles.value.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedFiles.value.map((file, index) => (
                    <div key={index} className="p-2 bg-muted rounded-md">
                      <div className="text-sm font-medium text-foreground">
                        {file.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                disabled={fileMutation.isPending || !selectedFiles.value.length}
              >
                {fileMutation.isPending
                  ? "Uploading..."
                  : `Upload ${selectedFiles.value.length} file${
                      selectedFiles.value.length !== 1 ? "s" : ""
                    }`}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
