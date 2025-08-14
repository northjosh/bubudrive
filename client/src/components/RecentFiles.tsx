import {
  FileText,
  FileImage,
  FileVideo,
  File,
  MoreHorizontal,
  Download,
  Trash,
  Share,
  MoreVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { formatFileSize } from "../utils/fileSize";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

interface RecentFile {
  id: string;
  name: string;
  owner: string;
  lastModified: string;
  size: number;
  type: string;
  folder: string;
}

interface RecentFilesProps {
  files: RecentFile[];
}

function getFileIcon(type: string) {
  const lowerType = type.toLowerCase();
  if (
    lowerType.includes("image") ||
    [".jpg", ".png", ".gif", ".svg"].some((ext) => lowerType.includes(ext))
  ) {
    return <FileImage className="h-4 w-4" />;
  }
  if (
    lowerType.includes("video") ||
    [".mp4", ".avi", ".mov"].some((ext) => lowerType.includes(ext))
  ) {
    return <FileVideo className="h-4 w-4" />;
  }
  if (
    lowerType.includes("text") ||
    [".txt", ".doc", ".pdf"].some((ext) => lowerType.includes(ext))
  ) {
    return <FileText className="h-4 w-4" />;
  }
  return <File className="h-4 w-4" />;
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) return "just now";
  if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
  if (diffInHours < 48) return "yesterday";
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
  return date.toLocaleDateString();
}

export function RecentFiles({ files }: RecentFilesProps) {
  const recentFiles = files.slice(0, 10); // Show last 10 files

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">recent files</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {recentFiles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground px-6">
            <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">no recent files</p>
            <p className="text-xs">files you work with will appear here</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">name</TableHead>
                <TableHead className="w-[15%]">modified by</TableHead>
                <TableHead className="w-[20%]">last modified</TableHead>
                <TableHead className="w-[15%]">location</TableHead>
                <TableHead className="w-[10%] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentFiles.map((file) => (
                <TableRow key={file.id} className="cursor-pointer">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="text-muted-foreground">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground truncate">
                          {file.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {file.owner}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatRelativeTime(file.lastModified)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground truncate">
                      {file.folder}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreVertical className="h-4 w-4" />
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {files.length > 10 && (
          <div className="p-4 border-t border-border text-center">
            <button className="text-xs text-primary hover:text-primary/80 font-medium">
              view all files
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
