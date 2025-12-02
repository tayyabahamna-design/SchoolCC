import { useState } from 'react';
import { useAuth, UserRole } from '@/contexts/auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const roles: { value: UserRole; label: string; description: string }[] = [
  { value: 'DEO', label: 'District Education Officer', description: 'Full access, all data' },
  { value: 'DDEO', label: 'Deputy DEO', description: 'Regional oversight' },
  { value: 'AEO', label: 'Area Education Officer', description: 'Cluster management' },
  { value: 'HEAD_TEACHER', label: 'Head Teacher', description: 'School management' },
  { value: 'TEACHER', label: 'Teacher', description: 'Assign to me' },
];

export default function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [selectedRole, setSelectedRole] = useState<UserRole>('TEACHER');
  const [password, setPassword] = useState('demo');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(phoneNumber, selectedRole, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 mb-4">
            <div className="text-2xl font-bold text-primary">🏫</div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">SchoolHub</h1>
          <p className="text-muted-foreground">Education Field Monitoring System</p>
        </div>

        <Card className="p-6 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number
              </label>
              <Input
                type="tel"
                placeholder="10-digit number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                data-testid="input-phone"
                className="w-full"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Select Your Role
              </label>
              <div className="space-y-2">
                {roles.map((role) => (
                  <label
                    key={role.value}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedRole === role.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/30'
                    }`}
                    data-testid={`radio-role-${role.value}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={selectedRole === role.value}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="w-4 h-4"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-foreground">{role.label}</div>
                      <div className="text-xs text-muted-foreground">{role.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">Demo: Any 4+ character password</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || phoneNumber.length < 10}
              data-testid="button-login"
              className="w-full"
              size="lg"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Demo credentials pre-filled • Password: any 4+ characters
        </p>
      </div>
    </div>
  );
}
