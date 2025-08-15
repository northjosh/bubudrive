import { createFileRoute } from "@tanstack/react-router";
import { FolderListView } from "@/components/FolderListView";

export const Route = createFileRoute("/_layout/folders/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-6">
      <FolderListView />
    </div>
  );
}
