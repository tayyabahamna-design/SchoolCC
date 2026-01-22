import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import type { UserRole } from '@/contexts/auth';
import { analytics } from '@/lib/analytics';
import CompactTooltipGuide, { TooltipStep, useTooltipGuideStatus } from '@/components/CompactTooltipGuide';

const SIGNUP_GUIDE_KEY = 'taleemhub_signup_guide_v2';

const signupGuideSteps: TooltipStep[] = [
  {
    target: '[data-guide="welcome"]',
    title: '👋 خوش آمدید! Welcome!',
    message: 'آئیں اپنا اکاؤنٹ بنائیں۔\nLet\'s create your account step by step.',
    placement: 'bottom',
  },
  {
    target: '[data-guide="name-input"]',
    title: '1. نام | Name',
    message: 'اپنا پورا نام یہاں لکھیں۔\nType your full name here.',
    placement: 'bottom',
  },
  {
    target: '[data-guide="phone-input"]',
    title: '2. فون نمبر | Phone',
    message: 'اپنا فون نمبر درج کریں۔\nEnter your phone number.',
    placement: 'bottom',
  },
  {
    target: '[data-guide="password-input"]',
    title: '3. پاس ورڈ | Password',
    message: 'کم از کم 6 حروف کا پاس ورڈ بنائیں۔\nCreate a password (min 6 characters).',
    placement: 'bottom',
  },
  {
    target: '[data-guide="role-select"]',
    title: '4. کردار | Role',
    message: 'اپنا کردار منتخب کریں۔\nSelect your role.',
    placement: 'bottom',
  },
  {
    target: '[data-guide="father-name"]',
    title: '5. والد کا نام | Father Name',
    message: 'والد کا نام درج کریں (اختیاری)۔\nEnter father name (optional).',
    placement: 'bottom',
  },
  {
    target: '[data-guide="email-input"]',
    title: '6. ای میل | Email',
    message: 'اپنا ای میل درج کریں (اختیاری)۔\nEnter your email (optional).',
    placement: 'bottom',
  },
  {
    target: '[data-guide="cnic-input"]',
    title: '7. شناختی کارڈ | CNIC',
    message: 'اپنا شناختی کارڈ نمبر درج کریں (اختیاری)۔\nEnter CNIC number (optional).',
    placement: 'bottom',
  },
  {
    target: '[data-guide="dob-input"]',
    title: '8. تاریخ پیدائش | Date of Birth',
    message: 'اپنی تاریخ پیدائش منتخب کریں (اختیاری)۔\nSelect your date of birth (optional).',
    placement: 'bottom',
  },
  {
    target: '[data-guide="doj-input"]',
    title: '9. تاریخ شمولیت | Date of Joining',
    message: 'ملازمت کی تاریخ منتخب کریں (اختیاری)۔\nSelect joining date (optional).',
    placement: 'bottom',
  },
  {
    target: '[data-guide="qualification-input"]',
    title: '10. تعلیمی قابلیت | Qualification',
    message: 'اپنی تعلیمی قابلیت درج کریں (اختیاری)۔\nEnter your qualification (optional).',
    placement: 'bottom',
  },
  {
    target: '[data-guide="submit-button"]',
    title: '11. جمع کرائیں! | Submit!',
    message: 'اکاؤنٹ بنانے کے لیے یہاں ٹیپ کریں۔\nTap here to create your account.',
    placement: 'top',
  },
];

// All 16 schools in the district (uppercase)
const ALL_SCHOOLS = [
  "GBPS DHOKE ZIARAT",
  "GES JAWA",
  "GGES ANWAR UL ISLAM KAMALABAD",
  "GGES KOTHA KALLAN",
  "GGES PIND HABTAL",
  "GGPS ARAZI SOHAL",
  "GGPS CARRIAGE FACTORY",
  "GGPS CHAKRA",
  "GGPS DHOK MUNSHI",
  "GGPS RAIKA MAIRA",
  "GGPS WESTRIDGE 1",
  "GMPS KHABBA BARALA",
  "GPS CHAK DENAL",
  "GPS DHAMIAL",
  "GPS MILLAT ISLAMIA",
  "GPS REHMATABAD"
];

export default function Signup() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { hasCompleted, reset: resetGuide } = useTooltipGuideStatus(SIGNUP_GUIDE_KEY);
  const [showGuide, setShowGuide] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Basic info
    name: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: '' as UserRole | '',

    // Profile info
    fatherName: '',
    email: '',
    residentialAddress: '',
    cnic: '',
    dateOfBirth: '',
    dateOfJoining: '',
    qualification: '',

    // Role-specific
    clusterId: '',
    schoolEmis: '',
    districtId: 'Rawalpindi',
    markazName: '',
    assignedSchools: [] as string[],
  });

  // Initialize tooltip guide when page loads
  useEffect(() => {
    if (!hasCompleted) {
      const timer = setTimeout(() => setShowGuide(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasCompleted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.name || !formData.phoneNumber || !formData.role) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    // Password validation for all roles
    if (!formData.password) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    // AEO-specific validation
    if (formData.role === 'AEO') {
      if (!formData.markazName) {
        setError('Please enter your Markaz name');
        setLoading(false);
        return;
      }
      if (formData.assignedSchools.length === 0) {
        setError('Please select at least one school to oversee');
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : data.error;
        throw new Error(errorMsg || 'Signup failed');
      }

      analytics.auth.signedUp(formData.role as UserRole, 'phone', {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        districtId: formData.districtId,
      });
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
      analytics.error.formValidationError('signup', ['submission']);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-foreground">Account Created Successfully!</h2>
          <p className="text-muted-foreground mb-6">
            Your account has been created. You can now log in using your phone number.
          </p>
          <Button onClick={() => navigate('/')} className="w-full">Go to Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-3xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Button>

        <Card className="p-8">
          {/* Persistent Help Button */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => {
                resetGuide();
                setShowGuide(true);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="text-left">Let me help you!</span>
              <span className="text-right" dir="rtl">مدد کے لیے یہاں کلک کریں</span>
            </button>
          </div>

          <div data-guide="welcome">
            <h1 className="text-3xl font-bold mb-6">Create Account | اکاؤنٹ بنائیں</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div data-guide="name-input">
                <Label>Full Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                  data-testid="input-name"
                />
              </div>

              <div data-guide="phone-input">
                <Label>Phone Number *</Label>
                <Input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="03001234567"
                  required
                  data-testid="input-phone"
                />
              </div>

              {/* Password fields - required for all roles */}
              <div data-guide="password-input" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Password * | پاس ورڈ</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 characters"
                    required
                    data-testid="input-password"
                  />
                </div>
                <div>
                  <Label>Confirm Password * | پاس ورڈ دوبارہ</Label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    required
                    data-testid="input-confirm-password"
                  />
                </div>
              </div>

              <div data-guide="role-select">
                <Label>Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                >
                  <SelectTrigger data-testid="select-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEO">District Education Officer</SelectItem>
                    <SelectItem value="DDEO">Deputy DEO</SelectItem>
                    <SelectItem value="AEO">Assistant Education Officer</SelectItem>
                    <SelectItem value="HEAD_TEACHER">Head Teacher</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="TRAINING_MANAGER">Training Manager (Read-only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Role-specific fields */}
              {formData.role === 'AEO' && (
                <div className="space-y-4">
                  <div>
                    <Label>Markaz Name *</Label>
                    <Input
                      value={formData.markazName}
                      onChange={(e) => setFormData({ ...formData, markazName: e.target.value, clusterId: e.target.value })}
                      placeholder="Enter your Markaz name"
                      required
                    />
                  </div>
                  <div>
                    <Label>Select Schools to Oversee *</Label>
                    <p className="text-sm text-muted-foreground mb-2">Choose the schools you will be monitoring</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-lg p-3 bg-muted/30">
                      {ALL_SCHOOLS.map((school) => (
                        <div key={school} className="flex items-center space-x-2">
                          <Checkbox
                            id={school}
                            checked={formData.assignedSchools.includes(school)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  assignedSchools: [...formData.assignedSchools, school]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  assignedSchools: formData.assignedSchools.filter(s => s !== school)
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor={school}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {school}
                          </label>
                        </div>
                      ))}
                    </div>
                    {formData.assignedSchools.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Selected: {formData.assignedSchools.length} school(s)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {(formData.role === 'HEAD_TEACHER' || formData.role === 'TEACHER') && (
                <div>
                  <Label>School EMIS Number *</Label>
                  <Input
                    value={formData.schoolEmis}
                    onChange={(e) => setFormData({ ...formData, schoolEmis: e.target.value })}
                    placeholder="e.g., 37330227"
                    required
                    data-testid="input-emis"
                  />
                </div>
              )}

              {(formData.role === 'DEO' || formData.role === 'DDEO') && (
                <div>
                  <Label>District *</Label>
                  <Input
                    value={formData.districtId}
                    onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                    placeholder="District name"
                    required
                  />
                </div>
              )}
            </div>

            {/* Profile Details */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold">Profile Details | پروفائل کی تفصیلات</h3>

              <div data-guide="father-name">
                <Label>Father Name | والد کا نام</Label>
                <Input
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                />
              </div>

              <div data-guide="email-input">
                <Label>Email | ای میل</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div data-guide="cnic-input">
                  <Label>CNIC | شناختی کارڈ نمبر</Label>
                  <Input
                    value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    placeholder="12345-1234567-1"
                  />
                </div>
                <div data-guide="dob-input">
                  <Label>Date of Birth | تاریخ پیدائش</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div data-guide="doj-input">
                  <Label>Date of Joining | تاریخ شمولیت</Label>
                  <Input
                    type="date"
                    value={formData.dateOfJoining}
                    onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                  />
                </div>
                <div data-guide="qualification-input">
                  <Label>Qualification | تعلیمی قابلیت</Label>
                  <Input
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g., B.Ed, M.A"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div data-guide="submit-button">
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                data-testid="button-submit"
              >
                {loading ? 'Submitting...' : 'Submit Account Request'}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Compact Tooltip Guide - Points directly at form elements, never blocks them */}
      <CompactTooltipGuide
        steps={signupGuideSteps}
        isOpen={showGuide && !hasCompleted}
        onComplete={() => setShowGuide(false)}
        storageKey={SIGNUP_GUIDE_KEY}
      />
    </div>
  );
}
