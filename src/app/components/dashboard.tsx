import { useState, useMemo, useEffect } from 'react';
import { TopNavbar } from '@/app/components/topNavbar';
import { Sidebar } from '@/app/components/sidebar';
import { TaskKanban } from '@/app/components/taskKanban';
import { TaskTable } from '@/app/components/taskTable';
import { ProfileModal } from '@/app/components/profileModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Input } from '@/app/components/ui/input';
import { Search, X } from 'lucide-react';
import type { Task, User, TaskStatus, Priority } from '@/app/data/mock-data';

type FilterType = 'all' | 'my-tasks' | TaskStatus;

interface DashboardProps {
  currentUser: User;
  users: User[];
  initialTasks: Task[];
}

export function Dashboard({ currentUser, users, initialTasks }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState<FilterType>('my-tasks');
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  
  // Mobile status filters - multi-select (applied filters)
  const [mobileStatusFilters, setMobileStatusFilters] = useState<TaskStatus[]>([]);
  const [mobilePriorityFilters, setMobilePriorityFilters] = useState<Priority[]>([]);
  const [mobileDueDateFilter, setMobileDueDateFilter] = useState<string>(''); // 'overdue', 'today', 'week', ''
  
  // Temporary filter state (for popover)
  const [tempStatusFilters, setTempStatusFilters] = useState<TaskStatus[]>([]);
  const [tempPriorityFilters, setTempPriorityFilters] = useState<Priority[]>([]);
  const [tempDueDateFilter, setTempDueDateFilter] = useState<string>('');
  
  // Popover open state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Profile modal state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Checkbox flash state for visual feedback
  const [showCheckboxFlash, setShowCheckboxFlash] = useState(false);

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

    // Desktop sidebar filter
    if (isDesktop && currentFilter !== 'all' && currentFilter !== 'my-tasks') {
      filtered = filtered.filter((task) => task.status === currentFilter);
    }
    
    // Mobile multi-select status filter
    if (!isDesktop && mobileStatusFilters.length > 0) {
      filtered = filtered.filter((task) => mobileStatusFilters.includes(task.status));
    }

    // Mobile priority filter
    if (!isDesktop && mobilePriorityFilters.length > 0) {
      filtered = filtered.filter((task) => mobilePriorityFilters.includes(task.priority));
    }

    // Mobile due date filter
    if (!isDesktop && mobileDueDateFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        
        if (mobileDueDateFilter === 'overdue') {
          return taskDate < today && task.status !== 'Completed';
        } else if (mobileDueDateFilter === 'today') {
          return taskDate.getTime() === today.getTime();
        } else if (mobileDueDateFilter === 'week') {
          const weekFromNow = new Date(today);
          weekFromNow.setDate(today.getDate() + 7);
          return taskDate >= today && taskDate <= weekFromNow;
        }
        return true;
      });
    }

    // Universal search filter - searches across all fields
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((task) => {
        // Get user names for assigned to and created by
        const assignedToUser = users.find(u => u.id === task.assignedTo);
        const createdByUser = users.find(u => u.id === task.createdBy);
        
        // Format date for search
        const formattedDate = new Date(task.dueDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        
        return (
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.propertyId?.toLowerCase().includes(query) ||
          task.priority.toLowerCase().includes(query) ||
          task.status.toLowerCase().includes(query) ||
          assignedToUser?.name.toLowerCase().includes(query) ||
          createdByUser?.name.toLowerCase().includes(query) ||
          formattedDate.toLowerCase().includes(query) ||
          task.dueDate.includes(query)
        );
      });
    }

    // Sort by status order: Pending → In Progress → Completed
    // Within each status, sort by priority: Critical → High → Medium → Low
    const statusOrder: Record<TaskStatus, number> = {
      'Pending': 1,
      'In Progress': 2,
      'Completed': 3,
    };
    
    const priorityOrder: Record<Priority, number> = {
      'Critical': 1,
      'High': 2,
      'Medium': 3,
      'Low': 4,
    };
    
    filtered.sort((a, b) => {
      // First sort by status
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      
      // Then sort by priority within the same status
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return filtered;
  }, [tasks, currentUser, currentFilter, searchQuery, isDesktop, mobileStatusFilters, mobilePriorityFilters, mobileDueDateFilter, users]);

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

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  const handleStatusFilterToggle = (status: TaskStatus) => {
    setTempStatusFilters((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const handlePriorityFilterToggle = (priority: Priority) => {
    setTempPriorityFilters((prev) => {
      if (prev.includes(priority)) {
        return prev.filter((p) => p !== priority);
      } else {
        return [...prev, priority];
      }
    });
  };

  const applyMobileFilters = () => {
    // Show visual feedback
    setShowCheckboxFlash(true);
    
    // Apply filters after a brief moment
    setTimeout(() => {
      setMobileStatusFilters(tempStatusFilters);
      setMobilePriorityFilters(tempPriorityFilters);
      setMobileDueDateFilter(tempDueDateFilter);
      setIsFilterOpen(false);
      
      // Reset flash after popover closes
      setTimeout(() => {
        setShowCheckboxFlash(false);
      }, 300);
    }, 200);
  };

  const cancelMobileFilters = () => {
    setTempStatusFilters(mobileStatusFilters);
    setTempPriorityFilters(mobilePriorityFilters);
    setTempDueDateFilter(mobileDueDateFilter);
    setIsFilterOpen(false);
  };

  const handleFilterOpen = (open: boolean) => {
    if (open) {
      // Sync temp filters with current filters when opening
      setTempStatusFilters(mobileStatusFilters);
      setTempPriorityFilters(mobilePriorityFilters);
      setTempDueDateFilter(mobileDueDateFilter);
    }
    setIsFilterOpen(open);
  };

  const removeStatusFilter = (status: TaskStatus) => {
    setMobileStatusFilters((prev) => prev.filter((s) => s !== status));
  };

  const removePriorityFilter = (priority: Priority) => {
    setMobilePriorityFilters((prev) => prev.filter((p) => p !== priority));
  };

  const removeDueDateFilter = () => {
    setMobileDueDateFilter('');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <TopNavbar
        currentUser={currentUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onProfileClick={() => setIsProfileOpen(true)}
      />

      <div className="flex">
        {/* Desktop Sidebar - only visible on large screens */}
        {isDesktop && (
          <Sidebar
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            userRole={currentUser.role}
            taskCounts={taskCounts}
          />
        )}

        <main className="flex-1 p-3 md:p-6">
          {/* Mobile Header with Search - only visible on mobile */}
          {!isDesktop && (
            <div className="mb-4">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h1 className="text-xl font-semibold mb-1">My Tasks</h1>
                  <p className="text-sm text-muted-foreground">
                    {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                  </p>
                </div>
                
                {/* Mobile Universal Search Bar */}
                <div className="relative flex-shrink-0 w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-8 pr-8 h-9 text-sm rounded-full border-gray-300 bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="size-3.5 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Desktop heading */}
          {isDesktop && (
            <div className="mb-4 md:mb-6">
              <div className="flex items-center justify-between gap-4 mb-4">
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
                
                {/* Universal Search Bar */}
                <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3">
                  <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search tasks, priority, dates, names..."
                      className="pl-9 h-10 rounded-full border-gray-300"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {/* Clear Search */}
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1 h-10"
                    >
                      <X className="size-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mobile: Show Board View only */}
          {!isDesktop && (
            <TaskKanban
              tasks={filteredTasks}
              users={users}
              currentUserRole={currentUser.role}
              onStatusChange={handleStatusChange}
              isMobileListView={true}
            />
          )}

          {/* Desktop: Show Table View only */}
          {isDesktop && (
            <TaskTable
              tasks={filteredTasks}
              users={users}
              currentUserRole={currentUser.role}
              onStatusChange={handleStatusChange}
            />
          )}
        </main>
      </div>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
      />
    </div>
  );
}