import { useState } from 'react';
import { Dashboard } from '@/app/components/dashboard';
import { users, initialTasks } from '@/app/data/mock-data';
import type { User, UserRole } from '@/app/data/mock-data';

export default function App() {
  // Start with a manager user by default
  const [currentRole, setCurrentRole] = useState<UserRole>('Manager');
  const currentUser = users.find((u) => u.role === currentRole) || users[0];

  const handleRoleToggle = (role: UserRole) => {
    setCurrentRole(role);
  };

  return (
    <Dashboard
      currentUser={currentUser}
      users={users}
      initialTasks={initialTasks}
      onRoleToggle={handleRoleToggle}
    />
  );
}