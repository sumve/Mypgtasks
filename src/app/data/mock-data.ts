export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type UserRole = 'Manager' | 'Staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // user id
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  createdBy: string; // user id
  propertyId?: string;
  createdAt: string;
}

export const users: User[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya@rufrent.com',
    role: 'Manager',
    avatar: 'PS'
  },
  {
    id: '2',
    name: 'Rahul Kumar',
    email: 'rahul@rufrent.com',
    role: 'Staff',
    avatar: 'RK'
  },
  {
    id: '3',
    name: 'Meena Patel',
    email: 'meena@rufrent.com',
    role: 'Staff',
    avatar: 'MP'
  },
  {
    id: '4',
    name: 'Ajay Singh',
    email: 'ajay@rufrent.com',
    role: 'Staff',
    avatar: 'AS'
  }
];

export const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Emergency water leak – Building B',
    description: 'Urgent! Major water leak on 5th floor needs immediate attention',
    assignedTo: '2',
    priority: 'Critical',
    status: 'Pending',
    dueDate: '2026-02-12',
    createdBy: '1',
    propertyId: 'BLD-B',
    createdAt: '2026-02-12'
  },
  {
    id: '2',
    title: 'Fix sofa pickup – Bandra',
    description: 'Coordinate with tenant for sofa pickup at Bandra West property',
    assignedTo: '2',
    priority: 'High',
    status: 'Pending',
    dueDate: '2026-02-05',
    createdBy: '1',
    propertyId: 'BND-401',
    createdAt: '2026-02-02'
  },
  {
    id: '3',
    title: 'Studio cleaning – Andheri',
    description: 'Deep cleaning required before new tenant move-in',
    assignedTo: '3',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2026-02-04',
    createdBy: '1',
    propertyId: 'AND-204',
    createdAt: '2026-02-01'
  },
  {
    id: '4',
    title: 'AC maintenance check',
    description: 'Routine AC servicing for all units in building A',
    assignedTo: '4',
    priority: 'Medium',
    status: 'In Progress',
    dueDate: '2026-02-07',
    createdBy: '1',
    propertyId: 'BLD-A',
    createdAt: '2026-02-01'
  },
  {
    id: '5',
    title: 'Key handover – Powai',
    description: 'New tenant key handover and property walkthrough',
    assignedTo: '2',
    priority: 'High',
    status: 'Completed',
    dueDate: '2026-02-03',
    createdBy: '1',
    propertyId: 'POW-105',
    createdAt: '2026-01-31'
  },
  {
    id: '6',
    title: 'Plumbing repair – Juhu',
    description: 'Fix leaking tap in kitchen',
    assignedTo: '4',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '2026-02-06',
    createdBy: '1',
    propertyId: 'JUH-302',
    createdAt: '2026-02-02'
  },
  {
    id: '7',
    title: 'Security deposit return',
    description: 'Process security deposit for outgoing tenant',
    assignedTo: '3',
    priority: 'Low',
    status: 'Completed',
    dueDate: '2026-02-02',
    createdBy: '1',
    propertyId: 'BND-201',
    createdAt: '2026-01-30'
  },
  {
    id: '8',
    title: 'Gym equipment inspection',
    description: 'Monthly inspection of community gym equipment',
    assignedTo: '4',
    priority: 'Low',
    status: 'Pending',
    dueDate: '2026-02-08',
    createdBy: '1',
    propertyId: 'GYM-01',
    createdAt: '2026-02-02'
  },
  {
    id: '9',
    title: 'Paint touch-up – Versova',
    description: 'Touch up wall paint in living room and bedroom',
    assignedTo: '2',
    priority: 'Medium',
    status: 'In Progress',
    dueDate: '2026-02-05',
    createdBy: '1',
    propertyId: 'VER-501',
    createdAt: '2026-02-01'
  },
  {
    id: '10',
    title: 'Parking slot reassignment',
    description: 'Update parking assignments for new residents',
    assignedTo: '3',
    priority: 'Low',
    status: 'Pending',
    dueDate: '2026-02-09',
    createdBy: '1',
    propertyId: 'PKG-B',
    createdAt: '2026-02-03'
  },
  {
    id: '11',
    title: 'WiFi router replacement',
    description: 'Replace faulty router in studio apartment',
    assignedTo: '4',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2026-02-04',
    createdBy: '1',
    propertyId: 'AND-308',
    createdAt: '2026-02-02'
  },
  {
    id: '12',
    title: 'Monthly rent collection',
    description: 'Follow up with tenants for February rent payment',
    assignedTo: '2',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2026-02-05',
    createdBy: '1',
    createdAt: '2026-02-01'
  },
  {
    id: '13',
    title: 'Fire extinguisher check',
    description: 'Quarterly fire safety equipment inspection',
    assignedTo: '2',
    priority: 'Medium',
    status: 'Completed',
    dueDate: '2026-02-01',
    createdBy: '1',
    createdAt: '2026-01-29'
  }
];