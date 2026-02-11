import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { MoreHorizontal, Play, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import type { Task, User, UserRole } from '@/app/data/mock-data';

interface TaskTableProps {
  tasks: Task[];
  users: User[];
  currentUserRole: UserRole;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
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

export function TaskTable({
  tasks,
  users,
  currentUserRole,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}: TaskTableProps) {
  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || 'Unknown';
  };

  const handleStartTask = (taskId: string) => {
    onStatusChange(taskId, 'In Progress');
  };

  const handleCompleteTask = (taskId: string) => {
    onStatusChange(taskId, 'Completed');
  };

  return (
    <div className="border rounded-lg bg-white overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Task Name</TableHead>
            <TableHead className="min-w-[120px]">Assigned To</TableHead>
            <TableHead className="min-w-[110px]">Status</TableHead>
            <TableHead className="min-w-[90px]">Priority</TableHead>
            <TableHead className="min-w-[100px]">Due Date</TableHead>
            <TableHead className="min-w-[120px] hidden md:table-cell">Created By</TableHead>
            <TableHead className="text-center w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No tasks found
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => {
              const isCompleted = task.status === 'Completed';
              const isInProgress = task.status === 'In Progress';
              const StatusIcon = statusIcons[task.status];
              
              return (
                <TableRow key={task.id} className={cn(isCompleted && "bg-neutral-50/50")} onClick={() => onEditTask(task)} style={{ cursor: 'pointer' }}>
                  <TableCell className="font-medium">
                    <div>
                      <div>
                        {task.title}
                      </div>
                      {task.propertyId && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {task.propertyId}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{getUserName(task.assignedTo)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="w-fit">
                          <Badge variant="outline" className={cn('text-xs flex items-center gap-1 w-fit whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity', statusColors[task.status])}>
                            <StatusIcon className="size-3" />
                            <span className="hidden sm:inline">{task.status}</span>
                          </Badge>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'Pending'); }}>
                          <Circle className="size-3 mr-2" />
                          Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'In Progress'); }}>
                          <Play className="size-3 mr-2" />
                          In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'Completed'); }}>
                          <CheckCircle2 className="size-3 mr-2" />
                          Completed
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('text-xs', priorityColors[task.priority])}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{getUserName(task.createdBy)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                      {isCompleted ? (
                        <CheckCircle2 className="size-5 text-green-600" />
                      ) : isInProgress ? (
                        <Play className="size-5 text-blue-600" />
                      ) : (
                        <Circle className="size-5 text-gray-400" />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}