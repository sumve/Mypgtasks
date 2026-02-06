import { useState, useMemo } from 'react';
import { TopNavbar } from '@/app/components/top-navbar';
import { Sidebar } from '@/app/components/sidebar';
import { TaskKanban } from '@/app/components/task-kanban';
import { TaskTable } from '@/app/components/task-table';
import { TaskModal } from '@/app/components/task-modal';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Plus, Filter } from 'lucide-react';
import type { Task, User, UserRole, TaskStatus } from '@/app/data/mock-data';

type FilterType = 'all' | 'my-tasks' | TaskStatus;

interface DashboardProps {
  currentUser: User;
  users: User[];
  initialTasks: Task[];
  onRoleToggle: (role: UserRole) => void;
}

export function Dashboard({ currentUser, users, initialTasks, onRoleToggle }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Role-based filtering
    if (currentUser.role === 'Staff') {
      filtered = filtered.filter((task) => task.assignedTo === currentUser.id);
    }

    // Sidebar filter
    if (currentFilter === 'my-tasks') {
      filtered = filtered.filter((task) => task.assignedTo === currentUser.id);
    } else if (currentFilter !== 'all') {
      filtered = filtered.filter((task) => task.status === currentFilter);
    }

    // Staff filter (manager only)
    if (staffFilter !== 'all' && currentUser.role === 'Manager') {
      filtered = filtered.filter((task) => task.assignedTo === staffFilter);
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
  }, [tasks, currentUser, currentFilter, staffFilter, searchQuery]);

  const taskCounts = useMemo(() => {
    const userTasks = currentUser.role === 'Staff' 
      ? tasks.filter((t) => t.assignedTo === currentUser.id)
      : tasks;
    
    return {
      all: tasks.length,
      myTasks: tasks.filter((t) => t.assignedTo === currentUser.id).length,
      pending: userTasks.filter((t) => t.status === 'Pending').length,
      inProgress: userTasks.filter((t) => t.status === 'In Progress').length,
      completed: userTasks.filter((t) => t.status === 'Completed').length,
    };
  }, [tasks, currentUser]);

  const workloadSummary = useMemo(() => {
    if (currentUser.role !== 'Manager') return [];
    
    const staffUsers = users.filter((u) => u.role === 'Staff');
    return staffUsers.map((user) => ({
      userId: user.id,
      name: user.name.split(' ')[0],
      count: tasks.filter((t) => t.assignedTo === user.id).length,
    }));
  }, [tasks, users, currentUser]);

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

  const handleNewTask = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <TopNavbar
        currentUser={currentUser}
        onRoleToggle={onRoleToggle}
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
                {currentFilter === 'all' && 'All Tasks'}
                {currentFilter === 'my-tasks' && 'My Tasks'}
                {currentFilter === 'Pending' && 'Pending Tasks'}
                {currentFilter === 'In Progress' && 'In Progress Tasks'}
                {currentFilter === 'Completed' && 'Completed Tasks'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>

            <div className="flex items-center gap-2 md:gap-3 overflow-x-auto">
              {currentUser.role === 'Manager' && (
                <>
                  <div className="flex items-center gap-2">
                    <Filter className="size-4 text-muted-foreground hidden md:block" />
                    <Select value={staffFilter} onValueChange={setStaffFilter}>
                      <SelectTrigger className="w-36 md:w-48">
                        <SelectValue placeholder="Filter by staff" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Staff</SelectItem>
                        {users
                          .filter((u) => u.role === 'Staff')
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {workloadSummary.length > 0 && (
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white border rounded-lg">
                      <span className="text-sm text-muted-foreground">Workload:</span>
                      {workloadSummary.map((item) => (
                        <Badge key={item.userId} variant="secondary">
                          {item.name} {item.count}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Button onClick={handleNewTask} size="sm" className="md:size-default">
                    <Plus className="size-4 md:mr-2" />
                    <span className="hidden md:inline">New Task</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'kanban' | 'table')}>
            <TabsList className="mb-4">
              <TabsTrigger value="kanban" className="text-xs md:text-sm">Board View</TabsTrigger>
              <TabsTrigger value="table" className="text-xs md:text-sm">All Tasks (Table)</TabsTrigger>
            </TabsList>

            <TabsContent value="kanban" className="mt-0">
              <TaskKanban
                tasks={filteredTasks}
                users={users}
                currentUserRole={currentUser.role}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            </TabsContent>

            <TabsContent value="table" className="mt-0">
              <TaskTable
                tasks={filteredTasks}
                users={users}
                currentUserRole={currentUser.role}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(undefined);
        }}
        onSave={handleSaveTask}
        task={editingTask}
        users={users}
        currentUserId={currentUser.id}
      />
    </div>
  );
}