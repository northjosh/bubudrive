import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Folder,
  FolderOpen,
  MoreVertical,
  Plus,
  Share2,
  Trash2,
  Grid3X3,
  List,
} from "lucide-react";
import { trpc } from "@/trpc";
import type { Folder as FolderType } from "../../../shared/types";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useContextMenu } from "@/hooks/ui/use-context-menu";
import { DeleteFolderDialog } from "./dialogs/delete-folder.dialog";
import { ShareDialog } from "./dialogs/share.dialog";
import { CreateFolderDialog } from "./dialogs/create-folder.dialog";

type ViewMode = "grid" | "list";

interface FolderListViewProps {
  className?: string;
}

export function FolderListView({ className = "" }: FolderListViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [deleteFolder, setDeleteFolder] = useState<FolderType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [shareFolder, setShareFolder] = useState<FolderType | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const { contextMenu, showContextMenu, hideContextMenu, menuRef } =
    useContextMenu();

  const folders = trpc.getAllFolders.useQuery();

  const handleDelete = (folder: FolderType) => {
    setDeleteFolder(folder);
    setIsDeleteDialogOpen(true);
    hideContextMenu();
  };

  const handleShare = (folder: FolderType) => {
    setShareFolder(folder);
    setIsShareDialogOpen(true);
    hideContextMenu();
  };

  const handleSuccess = () => {
    folders.refetch();
  };

  if (folders.isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading folders...</p>
        </div>
      </div>
    );
  }

  if (folders.error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="text-destructive mb-2">Error loading folders</div>
          <p className="text-sm text-muted-foreground">
            {folders.error.message}
          </p>
          <Button
            onClick={() => folders.refetch()}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const folderData = folders.data || [];
  const myFolders = folderData.filter(
    (folder: FolderType) => folder.owner !== "shared"
  );
  const sharedFolders = folderData.filter(
    (folder: FolderType) => folder.owner === "shared"
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Folders</h1>
          <p className="text-muted-foreground">
            Manage your folders and shared spaces
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New Folder
          </Button>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Folder className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-medium">My Folders</h2>
          <span className="text-sm text-muted-foreground">
            ({myFolders.length})
          </span>
        </div>

        {myFolders.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No folders yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first folder to get started
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Folder
            </Button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                : "space-y-2"
            }
          >
            {myFolders.map((folder: FolderType) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                viewMode={viewMode}
                onContextMenu={(e) => showContextMenu(e, folder)}
                onDelete={() => handleDelete(folder)}
                onShare={() => handleShare(folder)}
              />
            ))}
          </div>
        )}
      </div>

      {sharedFolders.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-medium">Shared with me</h2>
            <span className="text-sm text-muted-foreground">
              ({sharedFolders.length})
            </span>
          </div>

          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                : "space-y-2"
            }
          >
            {sharedFolders.map((folder: FolderType) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                viewMode={viewMode}
                onContextMenu={(e) => showContextMenu(e, folder)}
                onDelete={() => handleDelete(folder)}
                onShare={() => handleShare(folder)}
                isShared
              />
            ))}
          </div>
        </div>
      )}

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
            onClick={() => handleShare(contextMenu.data as FolderType)}
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
            onClick={() => handleDelete(contextMenu.data as FolderType)}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      <DeleteFolderDialog
        folder={deleteFolder}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeleteFolder(null);
        }}
        onSuccess={handleSuccess}
      />

      {shareFolder && (
        <ShareDialog
          entity={shareFolder}
          isOpen={isShareDialogOpen}
          onClose={() => {
            setIsShareDialogOpen(false);
            setDeleteFolder(null);
          }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

interface FolderCardProps {
  folder: FolderType;
  viewMode: ViewMode;
  onContextMenu: (e: React.MouseEvent<HTMLElement>) => void;
  onDelete: () => void;
  onShare: () => void;
  isShared?: boolean;
}

function FolderCard({
  folder,
  viewMode,
  onContextMenu,
  onDelete,
  onShare,
  isShared = false,
}: FolderCardProps) {
  if (viewMode === "grid") {
    return (
      <div
        className="group relative p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        onContextMenu={onContextMenu}
        style={{ userSelect: "none" }}
      >
        <Link
          to="/folders/$folder"
          params={{ folder: folder.name }}
          className="block"
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <Folder
                className={`h-12 w-12 ${
                  isShared ? "text-blue-500" : "text-primary"
                }`}
              />
              {isShared && (
                <Share2 className="h-4 w-4 absolute -top-1 -right-1 text-blue-500" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-sm truncate w-full">
                {folder.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isShared ? "Shared folder" : "My folder"}
              </p>
            </div>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onShare}>
              <Share2 className="h-4 w-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
      onContextMenu={onContextMenu}
      style={{ userSelect: "none" }}
    >
      <Link
        to="/folders/$folder"
        params={{ folder: folder.name }}
        className="flex items-center gap-3 flex-1"
      >
        <div className="relative">
          <Folder
            className={`h-8 w-8 ${isShared ? "text-blue-500" : "text-primary"}`}
          />
          {isShared && (
            <Share2 className="h-3 w-3 absolute -top-1 -right-1 text-blue-500" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-sm">{folder.name}</h3>
          <p className="text-xs text-muted-foreground">
            {isShared ? "Shared folder" : "My folder"}
          </p>
        </div>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onShare}>
            <Share2 className="h-4 w-4" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
