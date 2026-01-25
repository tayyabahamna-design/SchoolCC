import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, ArrowLeft, HelpCircle, Search, X, Plus } from 'lucide-react';
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
    target: '[data-guide="markaz-input"]',
    title: '4a. مرکز کا نام | Markaz Name',
    message: 'اگر آپ AEO ہیں تو اپنے مرکز کا نام درج کریں۔\nIf you are AEO, enter your Markaz name.',
    placement: 'bottom',
  },
  {
    target: '[data-guide="schools-select"]',
    title: '4b. اسکولز | Schools',
    message: 'اسکول تلاش کریں یا دستی طور پر شامل کریں۔\nSearch for schools or add manually.',
    placement: 'bottom',
  },
  {
    target: '[data-guide="school-select"]',
    title: '4c. اسکول منتخب کریں | Select School',
    message: 'اپنا اسکول تلاش کریں یا دستی طور پر شامل کریں۔\nSearch for your school or add manually.',
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

// All 16 schools in the district with their EMIS numbers
const ALL_SCHOOLS = [
  { name: "GBPS DHOKE ZIARAT", emis: "37330209" },
  { name: "GES JAWA", emis: "37330130" },
  { name: "GGES ANWAR UL ISLAM KAMALABAD", emis: "37330151" },
  { name: "GGES KOTHA KALLAN", emis: "37330561" },
  { name: "GGES PIND HABTAL", emis: "37330612" },
  { name: "GGPS ARAZI SOHAL", emis: "37330172-A" },
  { name: "GGPS CARRIAGE FACTORY", emis: "37330433" },
  { name: "GGPS CHAKRA", emis: "37330227" },
  { name: "GGPS DHOK MUNSHI", emis: "37330322" },
  { name: "GGPS RAIKA MAIRA", emis: "37330627" },
  { name: "GGPS WESTRIDGE 1", emis: "37330598" },
  { name: "GMPS KHABBA BARALA", emis: "37330410" },
  { name: "GPS CHAK DENAL", emis: "37330312" },
  { name: "GPS DHAMIAL", emis: "37330317" },
  { name: "GPS MILLAT ISLAMIA", emis: "37330172" },
  { name: "GPS REHMATABAD", emis: "37330383" }
];

// Searchable School Selector Component
function SchoolSelector({
  selectedSchools,
  onChange,
  label,
  sublabel,
  multiple = true,
}: {
  selectedSchools: Array<{ name: string; emis: string }>;
  onChange: (schools: Array<{ name: string; emis: string }>) => void;
  label: string;
  sublabel?: string;
  multiple?: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualEmis, setManualEmis] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredSchools = ALL_SCHOOLS.filter(school =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.emis.includes(searchQuery)
  );

  const handleSelectSchool = (school: { name: string; emis: string }) => {
    if (multiple) {
      if (!selectedSchools.some(s => s.emis === school.emis)) {
        onChange([...selectedSchools, school]);
      }
    } else {
      onChange([school]);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleRemoveSchool = (emis: string) => {
    onChange(selectedSchools.filter(s => s.emis !== emis));
  };

  const handleAddManual = () => {
    if (manualName.trim()) {
      const newSchool = { name: manualName.trim(), emis: manualEmis.trim() || 'CUSTOM' };
      if (multiple) {
        onChange([...selectedSchools, newSchool]);
      } else {
        onChange([newSchool]);
      }
      setManualName('');
      setManualEmis('');
      setShowManualEntry(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-3" data-guide="school-select">
      <div>
        <Label>{label}</Label>
        {sublabel && <p className="text-sm text-muted-foreground mb-2">{sublabel}</p>}
      </div>

      {/* Search Input */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search school by name or EMIS | اسکول تلاش کریں"
            className="pl-9"
            data-testid="input-school-search"
          />
        </div>

        {/* Dropdown */}
        {showDropdown && searchQuery && (
          <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredSchools.length > 0 ? (
              filteredSchools.map((school) => (
                <button
                  key={school.emis}
                  type="button"
                  onClick={() => handleSelectSchool(school)}
                  className={`w-full text-left px-3 py-2 hover:bg-muted text-sm ${
                    selectedSchools.some(s => s.emis === school.emis) ? 'bg-muted/50' : ''
                  }`}
                >
                  <span className="font-medium">{school.name}</span>
                  <span className="text-muted-foreground ml-2">({school.emis})</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No schools found. Use "Add manually" below.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Schools */}
      {selectedSchools.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSchools.map((school, idx) => (
            <div
              key={`${school.emis}-${idx}`}
              className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm"
            >
              <span>{school.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveSchool(school.emis)}
                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Manual Entry Toggle */}
      {!showManualEntry ? (
        <button
          type="button"
          onClick={() => setShowManualEntry(true)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          <Plus className="w-4 h-4" />
          Add school manually | دستی طور پر اسکول شامل کریں
        </button>
      ) : (
        <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
          <p className="text-sm font-medium">Add School Manually | اسکول دستی طور پر شامل کریں</p>
          <div>
            <Label className="text-xs">School Name | اسکول کا نام</Label>
            <Input
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="Enter school name"
              data-testid="input-manual-school-name"
            />
          </div>
          <div>
            <Label className="text-xs">EMIS Number (optional) | ای ایم آئی ایس نمبر</Label>
            <Input
              value={manualEmis}
              onChange={(e) => setManualEmis(e.target.value)}
              placeholder="Enter EMIS number"
              data-testid="input-manual-school-emis"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAddManual}
              disabled={!manualName.trim()}
            >
              Add | شامل کریں
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setShowManualEntry(false);
                setManualName('');
                setManualEmis('');
              }}
            >
              Cancel | منسوخ
            </Button>
          </div>
        </div>
      )}

      {selectedSchools.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Selected: {selectedSchools.length} school(s) | منتخب: {selectedSchools.length} اسکول
        </p>
      )}
    </div>
  );
}

export default function Signup() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
    schoolName: '',
    schoolEmis: '',
    districtId: 'Rawalpindi',
    markazName: '',
    assignedSchools: [] as string[],
    aeoSchools: [] as Array<{ name: string; emis: string }>,
    teacherSchools: [] as Array<{ name: string; emis: string }>,
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
    if (isSubmittingRef.current) {
      return;
    }
    if (isSubmitting) return;
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
      setIsSubmitting(true);
      isSubmittingRef.current = true;
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('[Signup] Backend response:', data);

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

      const message = data.message || 'Account created successfully!';
      console.log('[Signup] Setting success message:', message);
      setSuccessMessage(message);
      setSuccess(true);
      setTimeout(() => navigate('/'), 4000);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
      analytics.error.formValidationError('signup', ['submission']);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  if (success) {
    // All accounts need approval
    const getApproverInfo = () => {
      if (formData.role === 'TEACHER') {
        return {
          en: 'Head Teacher or AEO',
          ur: 'ہیڈ ٹیچر یا AEO'
        };
      } else if (formData.role === 'HEAD_TEACHER') {
        return {
          en: 'AEO',
          ur: 'AEO'
        };
      } else if (formData.role === 'AEO') {
        return {
          en: 'DEO/DDEO',
          ur: 'DEO/DDEO'
        };
      }
      return { en: 'Administrator', ur: 'ایڈمنسٹریٹر' };
    };
    
    const approver = getApproverInfo();

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-foreground">
            Account Request Submitted!
          </h2>
          <h3 className="text-lg font-medium mb-4 text-muted-foreground" dir="rtl">
            اکاؤنٹ کی درخواست جمع ہو گئی!
          </h3>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <p className="text-amber-700 dark:text-amber-400 font-medium mb-2">
              Awaiting approval from: {approver.en}
            </p>
            <p className="text-amber-700 dark:text-amber-400 font-medium" dir="rtl">
              منظوری کا انتظار: {approver.ur}
            </p>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2 mb-6">
            <p>You cannot login until your account is approved.</p>
            <p dir="rtl">آپ اپنے اکاؤنٹ کی منظوری تک لاگ ان نہیں کر سکتے۔</p>
          </div>
          
          <Button onClick={() => navigate('/')} className="w-full">
            Go to Login | لاگ ان پر جائیں
          </Button>
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
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setFormData({ ...formData, phoneNumber: value });
                  }}
                  placeholder="03001234567"
                  maxLength={11}
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
                    <SelectItem value="AEO">Assistant Education Officer</SelectItem>
                    <SelectItem value="DDEO">Deputy District Education Officer</SelectItem>
                    <SelectItem value="HEAD_TEACHER">Head Teacher</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="TRAINING_MANAGER">Training Manager</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Note: DEO accounts can only be created by system administrators
                </p>
              </div>

              {/* Role-specific fields */}
              {formData.role === 'AEO' && (
                <div className="space-y-4">
                  <div data-guide="markaz-input">
                    <Label>Markaz Name *</Label>
                    <Input
                      value={formData.markazName}
                      onChange={(e) => setFormData({ ...formData, markazName: e.target.value, clusterId: e.target.value })}
                      placeholder="Enter your Markaz name"
                      required
                    />
                  </div>
                  <div data-guide="schools-select">
                    <SchoolSelector
                      selectedSchools={formData.aeoSchools || []}
                      onChange={(schools) => setFormData({ ...formData, aeoSchools: schools })}
                      label="Select Schools to Oversee * | نگرانی کے لیے اسکول منتخب کریں"
                      sublabel="Choose the schools you will be monitoring | وہ اسکول منتخب کریں جن کی آپ نگرانی کریں گے"
                      multiple={true}
                    />
                  </div>
                </div>
              )}

              {(formData.role === 'HEAD_TEACHER' || formData.role === 'TEACHER') && (
                <div data-guide="school-select">
                  <SchoolSelector
                    selectedSchools={formData.teacherSchools || []}
                    onChange={(schools) => setFormData({ ...formData, teacherSchools: schools })}
                    label="Select Your School * | اپنا اسکول منتخب کریں"
                    sublabel="Search or add the school where you work | وہ اسکول تلاش کریں یا شامل کریں جہاں آپ کام کرتے ہیں"
                    multiple={true}
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
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 13);
                      let formatted = '';
                      if (digits.length > 0) formatted = digits.slice(0, 5);
                      if (digits.length > 5) formatted += '-' + digits.slice(5, 12);
                      if (digits.length > 12) formatted += '-' + digits.slice(12, 13);
                      setFormData({ ...formData, cnic: formatted });
                    }}
                    placeholder="12345-1234567-1"
                    maxLength={15}
                  />
                </div>
                <div data-guide="dob-input">
                  <Label>Date of Birth | تاریخ پیدائش</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
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
                    className="cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
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
                disabled={loading || isSubmitting}
                className="w-full"
                data-testid="button-submit"
              >
                {isSubmitting ? 'Signing Up...' : 'Create Account'}
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
