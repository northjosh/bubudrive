import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "../../trpc";
import { FolderView } from "../../components/FolderView";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_layout/folders/$folder")({
  component: RouteComponent,
});

function RouteComponent() {
  const { folder } = Route.useParams();
  const files = trpc.getFilesFromFolder.useQuery({ folderId: folder });

  if (files.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if(files.error){
    return(
      <div class="page-error">
        an error occured. please try again
        <button onClick={() => files.refetch()}>
          retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <FolderView files={files.data || []} folder={folder} />
    </div>
  );
}

