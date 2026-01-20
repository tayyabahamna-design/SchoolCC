import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import type { UserRole } from '@/contexts/auth';
import { analytics } from '@/lib/analytics';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // For teachers and headmasters, password is optional (auto-generated)
    const isStaffRole = formData.role === 'TEACHER' || formData.role === 'HEAD_TEACHER';

    // Validation
    if (!formData.name || !formData.phoneNumber || !formData.role) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    // Password validation only for non-staff roles
    if (!isStaffRole) {
      if (!formData.password) {
        setError('Password is required for admin accounts');
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
    } else {
      // Auto-generate a dummy password for staff (won't be used for login)
      if (!formData.password) {
        formData.password = `STAFF_${Math.random().toString(36).substring(2, 15)}`;
      }
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
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground mb-6">
            Submit your request for DEO approval
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div>
                <Label>Full Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <Label>Phone Number *</Label>
                <Input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="03001234567"
                  required
                />
              </div>

              {/* Password fields - only for non-staff roles */}
              {formData.role && formData.role !== 'TEACHER' && formData.role !== 'HEAD_TEACHER' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Password *</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min 6 characters"
                      required
                    />
                  </div>
                  <div>
                    <Label>Confirm Password *</Label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Info for staff roles */}
              {(formData.role === 'TEACHER' || formData.role === 'HEAD_TEACHER') && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Teachers and Head Teachers:</strong> You can log in using only your phone number. No password is required.
                  </p>
                </div>
              )}

              <div>
                <Label>Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                >
                  <SelectTrigger>
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

            {/* Additional Profile Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold">Additional Information (Optional)</h3>

              <div>
                <Label>Father Name</Label>
                <Input
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <Label>Residential Address</Label>
                <Input
                  value={formData.residentialAddress}
                  onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>CNIC</Label>
                  <Input
                    value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    placeholder="12345-1234567-1"
                  />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date of Joining</Label>
                  <Input
                    type="date"
                    value={formData.dateOfJoining}
                    onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Qualification</Label>
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Submitting...' : 'Submit Account Request'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
