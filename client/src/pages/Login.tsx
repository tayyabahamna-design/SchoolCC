import { useState } from 'react';
import { useAuth, UserRole } from '@/contexts/auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle, School, Check, Crown, Building2, Users, GraduationCap, UserCheck, BookOpen, Shield, TrendingUp, Eye } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { analytics } from '@/lib/analytics';

const roles: { value: UserRole; label: string; description: string; icon: any }[] = [
  { value: 'CEO', label: 'CEO', description: 'System oversight, all data', icon: Crown },
  { value: 'DEO', label: 'District Education Officer', description: 'Full access, all data', icon: Building2 },
  { value: 'DDEO', label: 'Deputy DEO', description: 'Regional oversight', icon: Users },
  { value: 'AEO', label: 'Assistant Education Officer', description: 'Cluster management', icon: GraduationCap },
  { value: 'HEAD_TEACHER', label: 'Head Teacher', description: 'School management', icon: UserCheck },
  { value: 'TEACHER', label: 'Teacher', description: 'Assign to me', icon: BookOpen },
  { value: 'COACH', label: 'Coach', description: 'Read-only monitoring', icon: Eye },
];

export default function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [loginMode, setLoginMode] = useState<'standard' | 'school'>('standard');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [emisNumber, setEmisNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (loginMode === 'school') {
        // For teachers and headmasters: use Phone only (no password, no EMIS)
        await login(phoneNumber, '' as UserRole, '');
      } else {
        // For admin roles: use Phone + Password
        await login(phoneNumber, '' as UserRole, password);
      }
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = loginMode === 'school'
        ? 'Invalid phone number. Please try again or contact your administrator.'
        : 'Invalid phone number or password. Please try again.';
      setError(errorMessage);
      analytics.auth.loginFailed(errorMessage, loginMode === 'school' ? 'school' : 'admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">

        {/* Left Panel - Branding & Info */}
        <div className="hidden lg:flex flex-col justify-center space-y-8 p-12">
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-32 h-32">
              <img src="/taleemhub-logo.svg" alt="TaleemHub Logo" className="w-full h-full" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                TaleemHub
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Education Command Center for Rawalpindi District
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-lg">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Secure Platform</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your data is protected with enterprise-grade security</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-lg">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Real-time Insights</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monitor performance and make data-driven decisions</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm shadow-lg">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                <Eye className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Field Monitoring</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track activities across all educational institutions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <Card className="p-8 lg:p-10 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-0">
          {/* Mobile Logo - Only shown on small screens */}
          <div className="lg:hidden flex flex-col items-center mb-6">
            <img src="/taleemhub-logo.svg" alt="TaleemHub Logo" className="w-20 h-20 mb-3" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TaleemHub</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Education Command Center</p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 lg:block hidden">Welcome Back</h2>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 lg:hidden">Welcome Back</h2>
            <p className="text-gray-600 dark:text-gray-400">Sign in to continue your monitoring journey</p>
          </div>

          {/* Login Mode Switcher */}
          <div className="flex gap-2 p-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <button
              type="button"
              onClick={() => setLoginMode('standard')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                loginMode === 'standard'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Admin Login
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('school')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                loginMode === 'school'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              School Staff Login
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {loginMode === 'standard' ? (
              <>
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter phone number (e.g., 03000000002)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    data-testid="input-phone"
                    className="w-full h-12 text-base rounded-lg"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="input-password"
                    className="w-full h-12 text-base rounded-lg"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    For CEO, DEO, DDEO, AEO roles
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Phone Number Only for Staff */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    data-testid="input-phone-school"
                    className="w-full h-12 text-base rounded-lg"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    For Teachers and Head Teachers
                  </p>
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={
                loading ||
                !phoneNumber ||
                (loginMode === 'standard' && !password)
              }
              data-testid="button-login"
              className="w-full h-12 text-base font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              {loginMode === 'standard'
                ? 'Default password for admin accounts: admin123'
                : 'Simply enter your registered phone number to log in'
              }
            </p>

            {/* Create Account Link */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Don't have an account? Create Account
              </button>
            </div>

            {/* Powered by Taleemabad */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Powered by <span className="font-semibold text-purple-600 dark:text-purple-400">Taleemabad</span>
              </p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
