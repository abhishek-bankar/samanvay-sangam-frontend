import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ParsedSupportRow } from "@/features/batches/types";

interface ExcelPreviewTableProps {
  rows: ParsedSupportRow[];
  duplicates: string[];
}

export function ExcelPreviewTable({ rows, duplicates }: ExcelPreviewTableProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        {rows.length} supports found
        {duplicates.length > 0 && (
          <span className="ml-2 text-amber-600">
            ({duplicates.length} duplicates skipped)
          </span>
        )}
      </p>
      <div className="max-h-60 overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Support No.</TableHead>
              <TableHead>Drawing No.</TableHead>
              <TableHead>Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.supportTagId}>
                <TableCell className="font-medium">{row.supportTagId}</TableCell>
                <TableCell>{row.drawingNo}</TableCell>
                <TableCell>{row.level}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
