import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BatchDoneViewProps {
  batchName: string;
  createdCount: number;
  duplicates: string[];
}

export function BatchDoneView({ batchName, createdCount, duplicates }: BatchDoneViewProps) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Batch Created Successfully</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm"><span className="font-medium">Batch:</span> {batchName}</p>
          <p className="text-sm"><span className="font-medium">Supports created:</span> {createdCount}</p>
          {duplicates.length > 0 && (
            <p className="text-sm text-amber-600">
              {duplicates.length} duplicate IDs skipped: {duplicates.join(", ")}
            </p>
          )}
          <Button className="w-full" onClick={() => navigate("/batches")}>
            Go to Batch List
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
