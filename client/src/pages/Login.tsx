import { useState, useEffect } from 'react';
import { useAuth, UserRole } from '@/contexts/auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle, School, Check, Crown, Building2, Users, GraduationCap, UserCheck, BookOpen, Shield, TrendingUp, Eye, Download } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { analytics } from '@/lib/analytics';
import PersistentHelpBanner, { HelpStep, useHelpBannerStatus, PersistentHelpButton } from '@/components/PersistentHelpBanner';
import FloatingHelpButton from '@/components/FloatingHelpButton';

const roles: { value: UserRole; label: string; description: string; icon: any }[] = [
  { value: 'CEO', label: 'CEO', description: 'System oversight, all data', icon: Crown },
  { value: 'DEO', label: 'District Education Officer', description: 'Full access, all data', icon: Building2 },
  { value: 'DDEO', label: 'Deputy DEO', description: 'Regional oversight', icon: Users },
  { value: 'AEO', label: 'Assistant Education Officer', description: 'Cluster management', icon: GraduationCap },
  { value: 'HEAD_TEACHER', label: 'Head Teacher', description: 'School management', icon: UserCheck },
  { value: 'TEACHER', label: 'Teacher', description: 'Assign to me', icon: BookOpen },
  { value: 'TRAINING_MANAGER', label: 'Training Manager', description: 'Read-only monitoring', icon: Eye },
];

const LOGIN_HELP_KEY = 'taleemhub_login_help';

const loginHelpSteps: HelpStep[] = [
  {
    title: 'Welcome to TaleemHub! 🎓',
    content: 'Your education command center for Rawalpindi District. Let\'s get you started!\n\nتعلیم ہب میں خوش آمدید! راولپنڈی ضلع کے لیے آپ کا تعلیمی کمانڈ سینٹر۔ آئیں شروع کریں!',
  },
  {
    title: 'New User? Create Account',
    content: 'AEOs, Teachers and Head Teachers can create accounts instantly. Just tap "Create Account" at the bottom of the login form.\n\nAEOs، اساتذہ اور ہیڈ ٹیچرز فوری طور پر اکاؤنٹ بنا سکتے ہیں۔ لاگ ان فارم کے نیچے "Create Account" پر ٹیپ کریں۔',
    action: 'Look for "Create Account" link | "Create Account" لنک تلاش کریں',
  },
  {
    title: 'Login with Phone & Password',
    content: 'All users login with phone number and password for security.\n\nتمام صارفین فون نمبر اور پاس ورڈ سے لاگ ان کرتے ہیں۔',
    action: 'Enter your phone number and password | اپنا فون نمبر اور پاس ورڈ درج کریں',
  },
];

export default function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [emisNumber, setEmisNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { hasCompletedHelp, isViewingGuide, openGuide, closeGuide } = useHelpBannerStatus(LOGIN_HELP_KEY);
  const [showHelp, setShowHelp] = useState(false);
  const [helpMinimized, setHelpMinimized] = useState(false);

  useEffect(() => {
    if (!hasCompletedHelp) {
      const timer = setTimeout(() => setShowHelp(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedHelp]);

  // Track help banner minimize state
  useEffect(() => {
    const checkMinimized = () => {
      const isMinimized = localStorage.getItem(`${LOGIN_HELP_KEY}-minimized`) === 'true';
      setHelpMinimized(isMinimized);
    };

    checkMinimized();
    const interval = setInterval(checkMinimized, 500);
    return () => clearInterval(interval);
  }, []);

  const handleGuideComplete = () => {
    setShowHelp(false);
    closeGuide();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // All users now use Phone + Password
      await login(phoneNumber, '' as UserRole, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid phone number or password. Please try again.');
      analytics.auth.loginFailed('Invalid credentials', 'admin');
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
            <div className="inline-flex items-center justify-center w-44 h-44">
              <img src="/taleemhub-logo.png" alt="TaleemHub Logo" className="w-full h-full rounded-2xl mix-blend-multiply dark:mix-blend-normal dark:opacity-95" />
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
          {/* Inline PWA Install Banner */}
          <div className="mb-6 flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-4 py-3">
            <div className="flex-shrink-0">
              <div className="rounded-full bg-white/20 p-2">
                <Download className="h-5 w-5" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-left">Install TaleemHub</p>
              <p className="text-xs opacity-90 text-right" dir="rtl">تعلیم ہب انسٹال کریں</p>
            </div>
            <Button
              onClick={() => {
                const event = (window as any).deferredPrompt;
                if (event) {
                  event.prompt();
                  event.userChoice.then(() => {
                    (window as any).deferredPrompt = null;
                  });
                } else {
                  alert('To install: tap your browser menu and select "Add to Home Screen" or "Install App"');
                }
              }}
              size="sm"
              className="bg-white text-blue-600 hover:bg-white/90 font-semibold px-3 py-2 h-auto text-xs"
            >
              Install انسٹال
            </Button>
          </div>

          {/* Mobile Logo - Only shown on small screens */}
          <div className="lg:hidden flex flex-col items-center mb-6">
            <img src="/taleemhub-logo.png" alt="TaleemHub Logo" className="w-28 h-28 mb-3 rounded-xl mix-blend-multiply dark:mix-blend-normal dark:opacity-95" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TaleemHub</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Education Command Center</p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 lg:block hidden">Welcome Back</h2>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 lg:hidden">Welcome Back</h2>
            <p className="text-gray-600 dark:text-gray-400">Sign in to continue your education journey</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Phone Number | فون نمبر
              </label>
              <Input
                type="tel"
                placeholder="Enter phone number (e.g., 03001234567)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                data-testid="input-phone"
                className="w-full h-12 text-base rounded-lg"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Password | پاس ورڈ
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
                className="w-full h-12 text-base rounded-lg"
              />
            </div>

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
              disabled={loading || !phoneNumber || !password}
              data-testid="button-login"
              className="w-full h-12 text-base font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              {loading ? 'Signing In...' : 'Sign In | لاگ ان'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            {/* Create Account Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                data-testid="button-create-account"
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

      {/* Persistent Help Banner - Anchored to bottom */}
      <PersistentHelpBanner
        steps={loginHelpSteps}
        isOpen={(showHelp && !hasCompletedHelp) || isViewingGuide}
        onComplete={handleGuideComplete}
        storageKey={LOGIN_HELP_KEY}
        position="bottom"
        allowMinimize={true}
      />

      {/* Floating Help Button - shown when minimized */}
      <FloatingHelpButton
        show={showHelp && !hasCompletedHelp && helpMinimized && !isViewingGuide}
        onClick={() => {
          localStorage.removeItem(`${LOGIN_HELP_KEY}-minimized`);
          setHelpMinimized(false);
        }}
        position="bottom-right"
      />

      {/* Persistent Help Button - shown after completion */}
      {hasCompletedHelp && !isViewingGuide && (
        <PersistentHelpButton onClick={openGuide} position="bottom" />
      )}
    </div>
  );
}
