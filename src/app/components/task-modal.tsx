import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import type { Task, User, Priority, TaskStatus } from '@/app/data/mock-data';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  task?: Task;
  users: User[];
  currentUserId: string;
  isStaffView?: boolean;
}

export function TaskModal({ isOpen, onClose, onSave, task, users, currentUserId, isStaffView = false }: TaskModalProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium' as Priority,
    status: 'Pending' as TaskStatus,
    dueDate: '',
    propertyId: '',
  });

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'Medium',
        status: 'Pending',
        dueDate: '',
        propertyId: '',
      });
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      createdBy: task?.createdBy || currentUserId,
      createdAt: task?.createdAt || new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  const staffUsers = users.filter((u) => u.role === 'Staff');
  const currentUserName = users.find((u) => u.id === currentUserId)?.name || 'Unknown';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {isStaffView ? 'Update task status and description.' : (task ? 'Update task details below.' : 'Fill in the details to create a new task.')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {!isStaffView && (
              <div className="space-y-2">
                <Label htmlFor="title">Task Name *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Fix sofa pickup – Bandra"
                  required
                />
              </div>
            )}

            {isStaffView && (
              <div className="space-y-2">
                <Label>Task Name</Label>
                <div className="text-sm font-medium p-3 bg-gray-50 rounded-md border">
                  {formData.title}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description{!isStaffView && ' *'}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Task details..."
                rows={3}
              />
            </div>

            {!isStaffView ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assign To *</Label>
                  <Select
                    value={formData.assignedTo}
                    onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
                    required
                  >
                    <SelectTrigger id="assignedTo">
                      <SelectValue placeholder="Select staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority *</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as Priority })}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Assigned To</Label>
                <div className="text-sm font-medium p-3 bg-gray-50 rounded-md border">
                  {currentUserName}
                </div>
              </div>
            )}

            {!isStaffView ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {!isStaffView && (
              <>
                {isStaffView && (
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <div className="text-sm font-medium p-3 bg-gray-50 rounded-md border">
                      {formData.priority}
                    </div>
                  </div>
                )}

                {isStaffView && (
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <div className="text-sm font-medium p-3 bg-gray-50 rounded-md border">
                      {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      }) : 'Not set'}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="propertyId">Property or Order ID</Label>
                  <Input
                    id="propertyId"
                    value={formData.propertyId}
                    onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                    placeholder="e.g., BND-401"
                  />
                </div>
              </>
            )}

            {isStaffView && (
              <>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <div className="text-sm font-medium p-3 bg-gray-50 rounded-md border">
                    {formData.priority}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <div className="text-sm font-medium p-3 bg-gray-50 rounded-md border">
                    {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    }) : 'Not set'}
                  </div>
                </div>

                {formData.propertyId && (
                  <div className="space-y-2">
                    <Label>Property or Order ID</Label>
                    <div className="text-sm font-medium p-3 bg-gray-50 rounded-md border">
                      {formData.propertyId}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}