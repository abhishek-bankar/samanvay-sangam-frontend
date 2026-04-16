import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import type { Support } from "@/features/batches/types";

const STATUS_COLORS: Record<string, string> = {
  New: "bg-gray-100 text-gray-700",
  "Ready to Assign": "bg-purple-100 text-purple-700",
  "In Progress": "bg-blue-100 text-blue-700",
  "Under Review": "bg-indigo-100 text-indigo-700",
  Approved: "bg-emerald-100 text-emerald-700",
  "Needs Rework": "bg-red-100 text-red-700",
  "Client Returned": "bg-rose-100 text-rose-700",
  "With Client": "bg-cyan-100 text-cyan-700",
  Completed: "bg-green-100 text-green-700",
};

interface SupportTableProps {
  supports: Support[];
  showCheckboxes: boolean;
  selected: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  userNameMap?: Map<string, string>;
}

export function SupportTable({ supports, showCheckboxes, selected, onSelectionChange, userNameMap }: SupportTableProps) {
  const allChecked = supports.length > 0 && supports.every((s) => selected.has(s.name));

  function toggleAll() {
    if (allChecked) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(supports.map((s) => s.name)));
    }
  }

  function toggleOne(name: string) {
    const next = new Set(selected);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    onSelectionChange(next);
  }

  if (supports.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">No supports found.</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {showCheckboxes && (
              <TableHead className="w-10">
                <Checkbox checked={allChecked} onCheckedChange={toggleAll} className="cursor-pointer" />
              </TableHead>
            )}
            <TableHead>Support Tag ID</TableHead>
            <TableHead>Drawing No</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {supports.map((s) => (
            <TableRow key={s.name}>
              {showCheckboxes && (
                <TableCell>
                  <Checkbox
                    checked={selected.has(s.name)}
                    onCheckedChange={() => toggleOne(s.name)}
                    className="cursor-pointer"
                  />
                </TableCell>
              )}
              <TableCell className="font-medium">{s.supportTagId}</TableCell>
              <TableCell>{s.drawingNo}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[s.status] ?? "bg-gray-100 text-gray-700"}`}>
                  {s.status}
                </span>
              </TableCell>
              <TableCell>{(userNameMap?.get(s.assignedTo) ?? s.assignedTo) || "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
