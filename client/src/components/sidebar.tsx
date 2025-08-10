import { Link } from "@tanstack/react-router";
import { FolderIcon, Plus, Users, Upload } from "lucide-react";
import { Dialog } from "./dialog";
import { useSignal } from "@preact/signals";
import { trpc } from "../trpc";
import { queryClient } from "../main";
import type { Folder } from "../../../server/lib/db";
import { useUploadFile } from "../hooks/useFile";
import { formatFileSize } from "../utils/fileSize";

export default function Sidebar() {
  const isDialogOpen = useSignal(false);
  const isFileDialogOpen = useSignal(false);
  const openDialog = () => (isDialogOpen.value = true);
  const closeDialog = () => (isDialogOpen.value = false);
  const openFileDialog = () => (isFileDialogOpen.value = true);
  const closeFileDialog = () => (isFileDialogOpen.value = false);
  const input = useSignal("");
  const selectedFolder = useSignal("");
  const selectedFiles = useSignal<File[]>([]);

  const folders = trpc.getAllFolders.useQuery();
  const fileMutation = useUploadFile();

  const mutation = trpc.createFolder.useMutation({
    mutationKey: ["create-folder"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["getAllFolders"]] });
    },
  });

  if (folders.isLoading) {
    return (
      <div className="sidebar-loading">
        <div className="loading-spinner"></div>
        <span>loading folders...</span>
      </div>
    );
  }

  if (folders.error) {
    return (
      <div className="sidebar-error">
        <span>error loading folders: {folders.error.message}</span>
      </div>
    );
  }

  const myFolders =
    folders.data?.filter((folder: Folder) => folder.owner !== "shared") || [];
  const sharedFolders =
    folders.data?.filter((folder: Folder) => folder.owner === "shared") || [];

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles.value || !selectedFolder.value) return;

    try {
      fileMutation.mutate({
        foldername: selectedFolder.value,
        files: selectedFiles.value,
      });
      closeFileDialog();
      selectedFiles.value = [];
      selectedFolder.value = "";
    } catch (error) {
      console.error("File upload failed:", error);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <div className="action-buttons">
          <button className="new-folder-button" onClick={openDialog}>
            <Plus size={16} />
            <span>new folder</span>
          </button>
          <button className="new-file-button" onClick={openFileDialog}>
            <Upload size={16} />
            <span>add file</span>
          </button>
        </div>

        <div className="sidebar-section">
          <div className="section-header">
            <FolderIcon size={16} />
            <span className="section-title">my folders</span>
            <span className="folder-count">({myFolders.length})</span>
          </div>
          <div className="folder-list">
            {myFolders.map((f: Folder) => (
              <Link
                key={f.id}
                to="/folders/$folder"
                params={{ folder: f.name }}
                className="folder-link"
                activeProps={{
                  class: "active-folder-link",
                }}
              >
                <FolderIcon size={16} />
                <span className="folder-name">{f.name}</span>
              </Link>
            ))}
            {myFolders.length === 0 && (
              <div className="empty-state">
                <span>no folders yet</span>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-section">
          <div className="section-header">
            <Users size={16} />
            <span className="section-title">shared</span>
            <span className="folder-count">({sharedFolders.length})</span>
          </div>
          <div className="folder-list">
            {sharedFolders.map((f: Folder) => (
              <Link
                key={f.id}
                to="/folders/$folder"
                params={{ folder: f.name }}
                className="folder-link"
                activeProps={{
                  class: "active-folder-link",
                }}
              >
                <FolderIcon size={16} />
                <span className="folder-name">{f.name}</span>
              </Link>
            ))}
            {sharedFolders.length === 0 && (
              <div className="empty-state">
                <span>no shared folders</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <Dialog
        onClose={closeDialog}
        isOpen={isDialogOpen.value}
        title="add folder"
      >
        <div>
          <form
            onSubmit={(e: React.FormEvent) => {
              e.preventDefault();
              mutation.mutate({ foldername: input.value });
              closeDialog();
              input.value = "";
            }}
            className="folder-dialog"
          >
            <label htmlFor="name">folder name</label>
            <input
              type="text"
              id="name"
              value={input.value}
              onChange={(e) => (input.value = e.currentTarget.value)}
              className="text-input"
              placeholder="enter folder name..."
              required
            />
            <button type="submit" className="submit-button">
              add folder
            </button>
          </form>
        </div>
      </Dialog>
      <Dialog
        onClose={closeFileDialog}
        isOpen={isFileDialogOpen.value}
        title="add files"
      >
        <div>
          <form onSubmit={handleFileUpload} className="file-dialog">
            <div className="form-group">
              <label htmlFor="folder-select">select folder</label>
              <select
                id="folder-select"
                value={selectedFolder.value}
                onChange={(e) => (selectedFolder.value = e.currentTarget.value)}
                className="select-input"
                required
              >
                <option value="">choose a folder...</option>
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

            <div className="form-group">
              <label htmlFor="file-input">select file</label>
              <input
                type="file"
                id="file-input"
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  selectedFiles.value = file ? [file] : [];
                }}
                className="file-input"
                required
              />
              {selectedFiles.value.length > 0 && (
                <div className="file-info">
                  <span className="file-name">
                    {selectedFiles.value[0].name}
                  </span>
                  <span className="file-size">
                    ({formatFileSize(selectedFiles.value[0].size)})
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={fileMutation.isPending}
            >
              {fileMutation.isPending ? "uploading..." : "upload file"}
            </button>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
