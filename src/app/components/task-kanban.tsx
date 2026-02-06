import { useMemo } from 'react';
import { TaskCard } from '@/app/components/task-card';
import type { Task, User, UserRole, TaskStatus } from '@/app/data/mock-data';

interface TaskKanbanProps {
  tasks: Task[];
  users: User[];
  currentUserRole: UserRole;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export function TaskKanban({
  tasks,
  users,
  currentUserRole,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}: TaskKanbanProps) {
  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: 'Pending', label: 'Pending', color: 'border-gray-300 bg-gray-50' },
    { status: 'In Progress', label: 'In Progress', color: 'border-blue-300 bg-blue-50' },
    { status: 'Completed', label: 'Completed', color: 'border-green-300 bg-green-50' },
  ];

  const tasksByStatus = useMemo(() => {
    return columns.reduce((acc, col) => {
      acc[col.status] = tasks.filter((task) => task.status === col.status);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 h-full">
      {columns.map((column) => (
        <div key={column.status} className="flex flex-col min-h-0">
          <div className={`border-2 rounded-lg p-3 mb-4 ${column.color}`}>
            <h2 className="font-semibold text-sm flex items-center justify-between">
              <span>{column.label}</span>
              <span className="bg-white px-2 py-0.5 rounded-full text-xs">
                {tasksByStatus[column.status]?.length || 0}
              </span>
            </h2>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1 max-h-[500px] md:max-h-[calc(100vh-300px)]">
            {tasksByStatus[column.status]?.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                users={users}
                currentUserRole={currentUserRole}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onStatusChange={onStatusChange}
              />
            ))}
            {(!tasksByStatus[column.status] || tasksByStatus[column.status].length === 0) && (
              <div className="text-center text-sm text-muted-foreground py-8">
                No tasks
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}