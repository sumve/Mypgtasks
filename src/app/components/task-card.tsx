import { MoreVertical, Calendar, User, Play, CheckCircle2, Circle } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { cn } from '@/app/components/ui/utils';
import type { Task, User as UserType, UserRole } from '@/app/data/mock-data';

interface TaskCardProps {
  task: Task;
  users: UserType[];
  currentUserRole: UserRole;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

const priorityColors = {
  High: 'bg-red-100 text-red-800 border-red-200',
  Medium: 'bg-amber-100 text-amber-800 border-amber-200',
  Low: 'bg-green-100 text-green-800 border-green-200',
};

const statusColors = {
  Pending: 'bg-gray-100 text-gray-800 border-gray-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  Completed: 'bg-green-100 text-green-800 border-green-200',
};

const statusIcons = {
  Pending: Circle,
  'In Progress': Play,
  Completed: CheckCircle2,
};

export function TaskCard({ task, users, currentUserRole, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const assignedUser = users.find((u) => u.id === task.assignedTo);
  const dueDate = new Date(task.dueDate);
  const isOverdue = dueDate < new Date() && task.status !== 'Completed';
  const isCompleted = task.status === 'Completed';
  const StatusIcon = statusIcons[task.status];

  const handleStartTask = () => {
    onStatusChange(task.id, 'In Progress');
  };

  const handleCompleteTask = () => {
    onStatusChange(task.id, 'Completed');
  };

  return (
    <div className={cn(
      "bg-white border rounded-lg p-3 md:p-4 shadow-sm hover:shadow-md transition-all",
      isCompleted && "opacity-75 bg-neutral-50"
    )}>
      <div className="flex items-start justify-between gap-2 mb-2 md:mb-3">
        <h3 className={cn(
          "font-medium text-sm flex-1 line-clamp-2",
          isCompleted && "line-through text-muted-foreground"
        )}>
          {task.title}
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7 md:size-8 -mr-1 md:-mr-2 -mt-1 md:-mt-2">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>
            {currentUserRole === 'Manager' && (
              <>
                <DropdownMenuItem onClick={() => onEdit(task)}>Reassign</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-red-600">
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {task.propertyId && (
        <p className="text-xs text-muted-foreground mb-2">Property: {task.propertyId}</p>
      )}

      <div className="space-y-1.5 md:space-y-2 mb-2 md:mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="size-3" />
          <span className="truncate">{assignedUser?.name || 'Unassigned'}</span>
        </div>
        <div className={cn('flex items-center gap-2 text-xs', isOverdue && 'text-red-600')}>
          <Calendar className="size-3" />
          <span>{dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          {isOverdue && <span className="font-medium">(Overdue)</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-2 md:mb-3">
        <Badge variant="outline" className={cn('text-xs', priorityColors[task.priority])}>
          {task.priority}
        </Badge>
        <Badge variant="outline" className={cn('text-xs flex items-center gap-1', statusColors[task.status])}>
          <StatusIcon className="size-3" />
          <span className="hidden sm:inline">{task.status}</span>
        </Badge>
      </div>

      {/* Status Action Buttons */}
      {!isCompleted && (
        <div className="pt-2 border-t">
          {task.status === 'Pending' ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs md:text-sm" 
              onClick={handleStartTask}
            >
              <Play className="size-3 mr-1" />
              Start Task
            </Button>
          ) : task.status === 'In Progress' ? (
            <Button 
              variant="default" 
              size="sm" 
              className="w-full bg-green-600 hover:bg-green-700 text-xs md:text-sm" 
              onClick={handleCompleteTask}
            >
              <CheckCircle2 className="size-3 mr-1" />
              Mark as Completed
            </Button>
          ) : null}
        </div>
      )}

      {isCompleted && (
        <div className="pt-2 border-t flex items-center justify-center gap-2 text-green-700">
          <CheckCircle2 className="size-4" />
          <span className="text-xs md:text-sm font-medium">Completed</span>
        </div>
      )}
    </div>
  );
}