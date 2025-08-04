import { createFileRoute } from '@tanstack/react-router'
import { trpc } from '../../trpc';
import { FolderView } from '../../components/FolderView';

export const Route = createFileRoute('/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  const files = trpc.getAllFiles.useQuery();
  if (files.isLoading) {
    return <div>Loading...</div>
  }
  if (files.error) {
    return <div>Error: {files.error.message}</div>
  }
  return (
    <div> 
      <FolderView files={files.data || []} folder="all files" />
    </div>
  )
} 
