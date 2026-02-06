import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Building2 } from 'lucide-react';
import type { UserRole } from '@/app/data/mock-data';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <Building2 className="size-8 text-blue-600" />
              <span className="text-3xl font-semibold tracking-tight">Rufrent</span>
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">Task Management Portal</CardTitle>
            <CardDescription className="mt-2">
              Choose how you want to access the system
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Button
              onClick={() => onLogin('Manager')}
              className="w-full h-14 text-base"
              size="lg"
            >
              Login as Manager
            </Button>
            <Button
              onClick={() => onLogin('Staff')}
              variant="outline"
              className="w-full h-14 text-base"
              size="lg"
            >
              Login as Staff
            </Button>
          </div>

          <div className="space-y-4 pt-2 border-t">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground">Manager:</span>
                <span>Manage all team tasks and assignments</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium text-foreground">Staff:</span>
                <span>View and update only assigned tasks</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password (optional)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
