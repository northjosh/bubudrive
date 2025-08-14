import { Star, FileText, FileImage, FileVideo, File } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

interface QuickAccessFile {
  id: string;
  name: string;
  type: string;
  lastModified: string;
  starred?: boolean;
}

interface QuickAccessProps {
  starredFiles: QuickAccessFile[];
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
  if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
  if (diffInHours < 48) return "yesterday";
  return `${Math.floor(diffInHours / 24)}d ago`;
}

export function QuickAccess({ starredFiles }: QuickAccessProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Star className="h-4 w-4" />
          quick access
        </CardTitle>
      </CardHeader>
      <CardContent>
        {starredFiles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">no starred files yet</p>
            <p className="text-xs">star files to see them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {starredFiles.slice(0, 4).map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <div className="text-muted-foreground">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {file.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatRelativeTime(file.lastModified)}
                  </div>
                </div>
                {file.starred && (
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}

        {starredFiles.length > 4 && (
          <div className="mt-4 pt-3 border-t border-border">
            <button className="text-xs text-primary hover:text-primary/80 font-medium">
              view all starred files
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
