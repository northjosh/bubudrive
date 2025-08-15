import { Link } from "@tanstack/react-router";
import { FolderIcon, Home, Share2, LogOut } from "lucide-react";

import { trpc } from "@/trpc";
import type { Folder } from "../../../shared/types";

import { Button } from "./ui/button";
import { Avatar } from "./ui/avatar";
import { useAuth } from "../hooks/useAuth";
import BoringAvatar from "boring-avatars";
import { CreateFolderDialog } from "./dialogs/create-folder.dialog";
import { UploadFileDialog } from "./dialogs/upload-file.dialog";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const folders = trpc.getAllFolders.useQuery();

  if (folders.isLoading) {
    return (
      <div className="w-64 bg-sidebar border-r border-sidebar-border flex items-center justify-center p-4">
        <div className="text-sm text-muted-foreground">loading folders...</div>
      </div>
    );
  }

  if (folders.error) {
    return (
      <div className="w-64 bg-sidebar border-r border-sidebar-border flex items-center justify-center p-4">
        <div className="text-sm text-destructive">
          error loading folders: {folders.error.message}
        </div>
      </div>
    );
  }

  const myFolders =
    folders.data?.filter((folder: Folder) => folder.owner !== "shared") || [];
  const sharedFolders =
    folders.data?.filter((folder: Folder) => folder.owner === "shared") || [];

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <Link
          to="/"
          className="flex items-center gap-2 text-sidebar-foreground hover:text-sidebar-primary transition-colors"
        >
          <FolderIcon className="h-6 w-6" />
          <span className="font-semibold text-lg">bubu</span>
          <span className="text-sm opacity-80">drive</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col p-4 space-y-6">
        {/* Main Navigation */}
        <nav className="space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors"
            activeProps={{
              className:
                "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
            }}
          >
            <Home className="h-4 w-4" />
            dashboard
          </Link>
          <Link
            to="/folders"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors"
            activeProps={{
              className:
                "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
            }}
          >
            <FolderIcon className="h-4 w-4" />
            all folders
          </Link>
        </nav>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wide">
            quick actions
          </h3>
          <div className="space-y-2">
            <CreateFolderDialog />
            <UploadFileDialog folders={folders.data || []} />
          </div>
        </div>

        {/* My Folders */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FolderIcon className="h-4 w-4 text-sidebar-foreground/70" />
            <h3 className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wide">
              my folders
            </h3>
            <span className="text-xs text-sidebar-foreground/50">
              ({myFolders.length})
            </span>
          </div>
          <nav className="space-y-1">
            {myFolders.map((f: Folder) => (
              <Link
                key={f.id}
                to="/folders/$folder"
                params={{ folder: f.name }}
                className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors"
                activeProps={{
                  className: "bg-sidebar-accent text-sidebar-accent-foreground",
                }}
              >
                <FolderIcon className="h-4 w-4" />
                <span className="truncate">{f.name}</span>
              </Link>
            ))}
            {myFolders.length === 0 && (
              <div className="px-3 py-2 text-xs text-sidebar-foreground/50">
                no folders yet
              </div>
            )}
          </nav>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-sidebar-foreground/70" />
            <h3 className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wide">
              shared with me
            </h3>
            <span className="text-xs text-sidebar-foreground/50">
              ({sharedFolders.length})
            </span>
          </div>
          <nav className="space-y-1">
            {sharedFolders.map((f: Folder) => (
              <Link
                key={f.id}
                to="/folders/$folder"
                params={{ folder: f.id }}
                className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors"
                activeProps={{
                  className: "bg-sidebar-accent text-sidebar-accent-foreground",
                }}
              >
                <FolderIcon className="h-4 w-4" />
                <span className="truncate">{f.name}</span>
              </Link>
            ))}
            {sharedFolders.length === 0 && (
              <div className="px-3 py-2 text-xs text-sidebar-foreground/50">
                no shared folders
              </div>
            )}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <BoringAvatar
              variant="pixel"
              name={user!.username}
              colors={["red", "white"]}
            />
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.username}
            </div>
          </div>
          <Button
            onClick={logout}
            variant="ghost"
            mode="icon"
            size="sm"
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
