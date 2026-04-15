import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExcelPreviewTable } from "@/features/batches/components/ExcelPreviewTable";
import type { ParsedSupportRow } from "@/features/batches/types";

function getFileName(filePath: string): string {
  return filePath.split("\\").pop() ?? filePath.split("/").pop() ?? filePath;
}

interface BatchFormViewProps {
  batchName: string;
  onBatchNameChange: (value: string) => void;
  modelPath: string | null;
  onPickModel: () => void;
  excelPath: string | null;
  onPickExcel: () => void;
  excelError: string | null;
  parsedRows: ParsedSupportRow[];
  duplicates: string[];
  error: string | null;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
}

export function BatchFormView({
  batchName,
  onBatchNameChange,
  modelPath,
  onPickModel,
  excelPath,
  onPickExcel,
  excelError,
  parsedRows,
  duplicates,
  error,
  onSubmit,
}: BatchFormViewProps) {
  const canSubmit = !!batchName && !!modelPath && !!excelPath && parsedRows.length > 0 && !excelError;

  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create New Batch</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="batchName">Batch Name</Label>
              <Input
                id="batchName"
                value={batchName}
                onChange={(e) => onBatchNameChange(e.target.value)}
                placeholder="e.g. BATCH-001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Navisworks Model</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={onPickModel}>
                  Pick File
                </Button>
                <span className="truncate text-sm text-muted-foreground">
                  {modelPath ? getFileName(modelPath) : "No file selected"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Support Excel</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={onPickExcel}>
                  Pick File
                </Button>
                <span className="truncate text-sm text-muted-foreground">
                  {excelPath ? getFileName(excelPath) : "No file selected"}
                </span>
              </div>
              {excelError && <p className="text-sm text-destructive">{excelError}</p>}
            </div>

            {parsedRows.length > 0 && (
              <ExcelPreviewTable rows={parsedRows} duplicates={duplicates} />
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={!canSubmit}>
              Create Batch & Import {parsedRows.length} Supports
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
