import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "../../trpc";
import { DashboardWelcome } from "@/components/DashboardWelcome";
import { QuickActions } from "@/components/QuickActions";
import { StorageStatus } from "@/components/StorageStatus";
import { QuickAccess } from "@/components/QuickAccess";
import { RecentFiles } from "@/components/RecentFiles";
import { useSignal } from "@preact/signals";
import { ProgressCircle } from "@/components/ui/progress";

export const Route = createFileRoute("/_layout/")({
  component: RouteComponent,
});

function RouteComponent() {
  const files = trpc.getAllFiles.useQuery();
  const isFileDialogOpen = useSignal(false);
  const isFolderDialogOpen = useSignal(false);

  const openFileDialog = () => (isFileDialogOpen.value = true);
  const openFolderDialog = () => (isFolderDialogOpen.value = true);

  if (files.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground flex flex-col items-center gap-2">
          <ProgressCircle value={25} size={32} className="animate-spin" />
          <span class="text-xs text-muted-foreground">loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (files.error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-destructive">error: {files.error.message}</div>
      </div>
    );
  }

  const mockStarredFiles =
    files.data?.slice(0, 4).map((file) => ({
      id: file.id?.toString() || Math.random().toString(),
      name: file.name,
      type: file.name.split(".").pop() || "unknown",
      lastModified: new Date(file.lastModified).toISOString(),
      starred: true,
    })) || [];

  const recentFiles =
    files.data?.map((file) => ({
      id: file.id?.toString() || Math.random().toString(),
      name: file.name,
      owner: file.owner,
      lastModified: new Date(file.lastModified).toISOString(),
      size: file.size,
      type: file.name.split(".").pop() || "unknown",
      folder: "my files",
    })) || [];

  const totalStorage = 50 * 1024 * 1024 * 1024; // 50GB in bytes
  const usedStorage =
    files.data?.reduce((total, file) => total + file.size, 0) || 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <DashboardWelcome />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QuickActions
          />
        </div>
        <div className="lg:col-span-1">
          <StorageStatus
            usedStorage={usedStorage}
            totalStorage={totalStorage}
          />
        </div>

        <div className="lg:col-span-1">
          <QuickAccess starredFiles={mockStarredFiles} />
        </div>
      </div>

      <div className="w-full">
        <RecentFiles files={recentFiles} />
      </div>
    </div>
  );
}
