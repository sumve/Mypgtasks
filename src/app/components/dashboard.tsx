import { useState, useMemo, useEffect } from 'react';
import { TopNavbar } from '@/app/components/top-navbar';
import { Sidebar } from '@/app/components/sidebar';
import { TaskKanban } from '@/app/components/task-kanban';
import { TaskTable } from '@/app/components/task-table';
import { TaskModal } from '@/app/components/task-modal';
import type { Task, User, TaskStatus } from '@/app/data/mock-data';

type FilterType = 'all' | 'my-tasks' | TaskStatus;

interface DashboardProps {
  currentUser: User;
  users: User[];
  initialTasks: Task[];
}

export function Dashboard({ currentUser, users, initialTasks }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Update view mode when screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredTasks = useMemo(() => {
    // Staff can only see their own tasks
    let filtered = tasks.filter((task) => task.assignedTo === currentUser.id);

    // Sidebar filter
    if (currentFilter !== 'all' && currentFilter !== 'my-tasks') {
      filtered = filtered.filter((task) => task.status === currentFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.propertyId?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [tasks, currentUser, currentFilter, searchQuery]);

  const taskCounts = useMemo(() => {
    const userTasks = tasks.filter((t) => t.assignedTo === currentUser.id);
    
    return {
      all: userTasks.length,
      myTasks: userTasks.length,
      pending: userTasks.filter((t) => t.status === 'Pending').length,
      inProgress: userTasks.filter((t) => t.status === 'In Progress').length,
      completed: userTasks.filter((t) => t.status === 'Completed').length,
    };
  }, [tasks, currentUser]);

  const handleSaveTask = (taskData: Partial<Task>) => {
    if (editingTask) {
      // Update existing task
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? { ...t, ...taskData } : t))
      );
    } else {
      // Create new task
      const newTask: Task = {
        id: String(Date.now()),
        title: taskData.title || '',
        description: taskData.description || '',
        assignedTo: taskData.assignedTo || '',
        priority: taskData.priority || 'Medium',
        status: taskData.status || 'Pending',
        dueDate: taskData.dueDate || '',
        createdBy: taskData.createdBy || currentUser.id,
        propertyId: taskData.propertyId,
        createdAt: taskData.createdAt || new Date().toISOString().split('T')[0],
      };
      setTasks((prev) => [newTask, ...prev]);
    }
    setEditingTask(undefined);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <TopNavbar
        currentUser={currentUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onMenuClick={() => setIsMobileSidebarOpen(true)}
      />

      <div className="flex">
        <Sidebar
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          userRole={currentUser.role}
          taskCounts={taskCounts}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-3 md:p-6">
          <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold mb-1">
                {currentFilter === 'all' && 'My Tasks'}
                {currentFilter === 'my-tasks' && 'My Tasks'}
                {currentFilter === 'Pending' && 'Pending Tasks'}
                {currentFilter === 'In Progress' && 'In Progress Tasks'}
                {currentFilter === 'Completed' && 'Completed Tasks'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
          </div>

          {/* Mobile: Show Board View only */}
          {!isDesktop && (
            <TaskKanban
              tasks={filteredTasks}
              users={users}
              currentUserRole={currentUser.role}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          )}

          {/* Desktop: Show Table View only */}
          {isDesktop && (
            <TaskTable
              tasks={filteredTasks}
              users={users}
              currentUserRole={currentUser.role}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          )}
        </main>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(undefined);
        }}
        onSave={() => {}} // Staff can't create/edit tasks
        task={editingTask}
        users={users}
        currentUserId={currentUser.id}
      />
    </div>
  );
}