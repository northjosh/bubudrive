import { Download, MoreVertical, Share, Trash } from "lucide-react";
import type { File } from "../../../shared/types";
import { formatFileSize } from "../utils/fileSize";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useContextMenu } from "@/hooks/ui/use-context-menu";
import { DeleteFileDialog } from "./dialogs/delete-file.dialog";
import { useState } from "react";
import { queryClient } from "@/main";

export function FolderView({
  folder,
  files,
}: {
  folder: string;
  files: File[];
}) {
  const { contextMenu, showContextMenu, hideContextMenu, menuRef } =
    useContextMenu();

  const [deleteFile, setDeleteFile] = useState<File | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDownload = (file: File) => {
    window.open(`http://localhost:9000/${folder}/${file.name}`, "_blank");
    hideContextMenu();
  };

  const handleDelete = (file: File) => {
    setDeleteFile(file);
    setIsDeleteDialogOpen(true);
    hideContextMenu();
  };

  const handleShare = (file: File) => {
    console.log("Share file:", file);
    hideContextMenu();
  };

  const handleDeleteSuccess = () => {
    queryClient.invalidateQueries({queryKey: ["getAllFiles", "getFilesFromFolder"]})
  };
  return (
    <div>
      <div class="file-container">
        <div class="file-container-header">
          <h1 class="file-container-title">{folder}</h1>
        </div>
        <table class="file-table">
          <thead>
            <tr>
              <th scope="col">name</th>
              <th scope="col">owner</th>
              <th scope="col">last modified</th>
              <th scope="col">size</th>
              <th scope="col">
                <span class="sr-only">actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {files.length > 0 ? (
              files.map((file: File) => {
                return (
                  <tr
                    onContextMenu={(e) => showContextMenu(e, file)}
                    style={{ userSelect: "none" }}
                  >
                    <td class="file-name-cell">
                      <svg
                        class="file-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                      <a
                        href={`http://localhost:9000/${folder}/${file.name}`}
                        download
                        class="file-name-link"
                      >
                        {file.name}
                      </a>
                    </td>
                    <td>{file.owner}</td>
                    <td>{file.lastModified}</td>
                    <td>{formatFileSize(file.size)}</td>
                    <td class="actions-cell">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Trash className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="w-4 h-4" />
                            Share
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <span class="no-files">
                  no files found. you can start by adding some files.
                </span>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {contextMenu.isVisible && (
        <div
          ref={menuRef}
          className="fixed bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50"
          style={{
            left: contextMenu.position.x,
            top: contextMenu.position.y,
          }}
        >
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
            onClick={() => handleDownload(contextMenu.data as File)}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
            onClick={() => handleShare(contextMenu.data as File)}
          >
            <Share className="w-4 h-4" />
            Share
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
            onClick={() => handleDelete(contextMenu.data as File)}
          >
            <Trash className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      {/* Delete File Dialog */}
      <DeleteFileDialog
        file={deleteFile}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeleteFile(null);
        }}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
