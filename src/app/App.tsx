import { Dashboard } from '@/app/components/dashboard';
import { users, initialTasks } from '@/app/data/mock-data';

export default function App() {
  // Use a staff user by default (Rahul Kumar)
  const currentUser = users.find((u) => u.role === 'Staff') || users[1];

  return (
    <Dashboard
      currentUser={currentUser}
      users={users}
      initialTasks={initialTasks}
    />
  );
}