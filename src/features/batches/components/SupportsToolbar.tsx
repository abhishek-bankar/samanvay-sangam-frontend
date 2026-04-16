import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SupportsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  assigneeFilter: string;
  onAssigneeFilterChange: (value: string) => void;
  assignees: { email: string; fullName: string }[];
  showAssignActions: boolean;
  showReassignActions: boolean;
  showReassignAll: boolean;
  selectedCount: number;
  totalCount: number;
  onAssign: () => void;
  onAutoAssign: () => void;
  onReassign: () => void;
  onReassignAll: () => void;
}

export function SupportsToolbar({
  search,
  onSearchChange,
  assigneeFilter,
  onAssigneeFilterChange,
  assignees,
  showAssignActions,
  showReassignActions,
  showReassignAll,
  selectedCount,
  totalCount,
  onAssign,
  onAutoAssign,
  onReassign,
  onReassignAll,
}: SupportsToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      <Input
        placeholder="Search by Support Tag ID..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-xs"
      />
      {assignees.length > 0 && (
        <Select value={assigneeFilter} onValueChange={onAssigneeFilterChange}>
          <SelectTrigger className="w-48 cursor-pointer">
            <SelectValue placeholder="All Assignees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">All Assignees</SelectItem>
            {assignees.map((a) => (
              <SelectItem key={a.email} value={a.email} className="cursor-pointer">
                {a.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <div className="ml-auto flex gap-2">
        {showAssignActions && (
          <>
            <Button
              disabled={selectedCount === 0}
              onClick={onAssign}
              className="cursor-pointer"
            >
              Assign ({selectedCount})
            </Button>
            <Button
              variant="outline"
              disabled={totalCount === 0}
              onClick={onAutoAssign}
              className="cursor-pointer"
            >
              Auto Assign
            </Button>
          </>
        )}
        {showReassignActions && selectedCount > 0 && (
          <Button onClick={onReassign} className="cursor-pointer">
            Reassign ({selectedCount})
          </Button>
        )}
        {showReassignAll && (
          <Button variant="outline" onClick={onReassignAll} className="cursor-pointer">
            Reassign All
          </Button>
        )}
      </div>
    </div>
  );
}
