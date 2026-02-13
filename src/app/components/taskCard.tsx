import {
  Calendar,
  User,
  Play,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Checkbox } from "@/app/components/ui/checkbox";
import { cn } from "@/app/components/ui/utils";
import type {
  Task,
  User as UserType,
  UserRole,
} from "@/app/data/mock-data";
import { useState, useEffect } from "react";

interface TaskCardProps {
  task: Task;
  users: UserType[];
  currentUserRole: UserRole;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (
    taskId: string,
    status: Task["status"],
  ) => void;
}

const priorityColors = {
  Critical: "bg-purple-100 text-purple-900 border-purple-300",
  High: "bg-red-100 text-red-800 border-red-200",
  Medium: "bg-amber-100 text-amber-800 border-amber-200",
  Low: "bg-green-100 text-green-800 border-green-200",
};

const statusColors = {
  Pending: "bg-gray-100 text-gray-800 border-gray-200",
  "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
  Completed: "bg-green-100 text-green-800 border-green-200",
};

const statusIcons = {
  Pending: Circle,
  "In Progress": Play,
  Completed: CheckCircle2,
};

export function TaskCard({
  task,
  users,
  currentUserRole,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  const assignedUser = users.find(
    (u) => u.id === task.assignedTo,
  );
  const createdByUser = users.find(
    (u) => u.id === task.createdBy,
  );
  const dueDate = new Date(task.dueDate);
  const createdDate = new Date(task.createdAt);
  const isOverdue =
    dueDate < new Date() && task.status !== "Completed";
  const isCompleted = task.status === "Completed";
  const StatusIcon = statusIcons[task.status];

  const [selectedStatus, setSelectedStatus] = useState<
    Task["status"]
  >(task.status);
  const [isChecked, setIsChecked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync selected status with task status
  useEffect(() => {
    setSelectedStatus(task.status);
  }, [task.status]);

  const handleCheckboxChange = (
    checked: boolean | "indeterminate",
  ) => {
    if (checked === true) {
      setIsChecked(true);
      // Only proceed if the status has actually changed
      if (selectedStatus !== task.status) {
        onStatusChange(task.id, selectedStatus);
      }
      // Use setTimeout to allow visual feedback before unchecking
      setTimeout(() => {
        setIsChecked(false);
      }, 300);
    }
  };

  return (
    <div
      className={cn(
        "bg-white border rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-all",
        isCompleted && "opacity-75 bg-neutral-50",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2 md:mb-3">
        <button
          className="flex items-center gap-2 text-left flex-1 hover:text-blue-600 transition-colors group"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="font-medium text-sm flex-1 line-clamp-2">
            {task.title}
          </h3>
          {isExpanded ? (
            <ChevronUp className="size-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
          ) : (
            <ChevronDown className="size-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
          )}
        </button>
      </div>

      {task.propertyId && (
        <p className="text-xs text-muted-foreground mb-2">
          Property: {task.propertyId}
        </p>
      )}

      <div className="space-y-1.5 md:space-y-2 mb-2 md:mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="size-3" />
          <span className="truncate">
            {assignedUser?.name || "Unassigned"}
          </span>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 text-xs",
            isOverdue && "text-red-600",
          )}
        >
          <Calendar className="size-3" />
          <span>
            {dueDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
          {isOverdue && (
            <span className="font-medium">(Overdue)</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-2 md:mb-3">
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            priorityColors[task.priority],
          )}
        >
          {task.priority}
        </Badge>
        <Badge
          variant="outline"
          className={cn(
            "text-xs flex items-center gap-1",
            statusColors[task.status],
          )}
        >
          <StatusIcon className="size-3" />
          <span className="hidden sm:inline">
            {task.status}
          </span>
        </Badge>
      </div>

      {/* Expanded Details Section */}
      {isExpanded && (
        <div className="mb-3 p-3 bg-blue-50/30 rounded-lg space-y-2 border border-blue-100">
          <div className="flex items-start gap-2">
            <span className="font-semibold text-xs text-gray-700 min-w-[80px]">Description:</span>
            <p className="text-xs text-gray-600">{task.description}</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-xs text-gray-700 min-w-[80px]">Requested by:</span>
            <p className="text-xs text-gray-600">{createdByUser?.name || "Unknown"}</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-xs text-gray-700 min-w-[80px]">Created:</span>
            <p className="text-xs text-gray-600">
              {createdDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      )}

      {/* Status Selection with Checkbox */}
      <div className="pt-2 border-t">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Select
              value={selectedStatus}
              onValueChange={(value) =>
                setSelectedStatus(value as Task["status"])
              }
            >
              <SelectTrigger className="h-10 text-sm font-medium border-2 hover:border-blue-400 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="Pending"
                  className="text-sm font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Circle className="size-4 text-gray-500" />
                    <span>Pending</span>
                  </div>
                </SelectItem>
                <SelectItem
                  value="In Progress"
                  className="text-sm font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Play className="size-4 text-blue-500" />
                    <span>In Progress</span>
                  </div>
                </SelectItem>
                <SelectItem
                  value="Completed"
                  className="text-sm font-medium"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-500" />
                    <span>Completed</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Checkbox
              checked={isChecked}
              onCheckedChange={handleCheckboxChange}
              className="size-6 border-2"
              disabled={selectedStatus === task.status}
            />
            <span className="text-[10px] text-muted-foreground">
              Apply
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}