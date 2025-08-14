
import { Card, CardContent } from "./ui/card";
import FileUpload from "./FileUpload";

export function QuickActions() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground mb-4">
            upload files
          </h3>
          <FileUpload />
        </div>
      </CardContent>
    </Card>
  );
}
