import { HardDrive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { formatFileSize } from "../utils/fileSize";

interface StorageStatusProps {
  usedStorage: number; // in bytes
  totalStorage: number; // in bytes
}

export function StorageStatus({
  usedStorage,
  totalStorage,
}: StorageStatusProps) {
  const usagePercentage = Math.round((usedStorage / totalStorage) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <HardDrive className="h-4 w-4" />
          storage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Progress
            value={usagePercentage}
            className="h-2"
            indicatorClassName={
              usagePercentage > 90
                ? "bg-destructive"
                : usagePercentage > 75
                ? "bg-warning"
                : "bg-primary"
            }
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{usagePercentage}% used</span>
            <span>
              {formatFileSize(usedStorage)} / {formatFileSize(totalStorage)}
            </span>
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {formatFileSize(totalStorage - usedStorage)}
          </div>
          <div className="text-xs text-muted-foreground">available space</div>
        </div>
      </CardContent>
    </Card>
  );
}
