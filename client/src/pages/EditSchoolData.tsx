import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocation } from 'wouter';
import { ArrowLeft, Save, Users, Building2, Droplet, Calculator } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { analytics } from '@/lib/analytics';

export default function EditSchoolData() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // Attendance
    totalStudents: 0,
    presentStudents: 0,
    totalTeachers: 0,
    presentTeachers: 0,
    // Infrastructure
    totalToilets: 0,
    workingToilets: 0,
    brokenToilets: 0,
    isDrinkingWaterAvailable: false,
    // Inventory - Desks
    desksNew: 0,
    desksInUse: 0,
    desksBroken: 0,
    // Inventory - Fans
    fansNew: 0,
    fansInUse: 0,
    fansBroken: 0,
    // Inventory - Chairs
    chairsNew: 0,
    chairsInUse: 0,
    chairsBroken: 0,
    // Inventory - Blackboards
    blackboardsNew: 0,
    blackboardsInUse: 0,
    blackboardsBroken: 0,
    // Inventory - Computers
    computersNew: 0,
    computersInUse: 0,
    computersBroken: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schoolId, setSchoolId] = useState<string>('');

  // Check permissions
  const canEdit = user?.role === 'HEAD_TEACHER' ||
                  user?.role === 'DEO' ||
                  user?.role === 'DDEO' ||
                  user?.role === 'AEO';

  useEffect(() => {
    if (!canEdit) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to edit school data',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    // Load current school data
    if (user?.schoolId) {
      setSchoolId(user.schoolId);
      loadSchoolData(user.schoolId);
    }
  }, [user, canEdit]);

  const loadSchoolData = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/schools/${id}`);
      if (response.ok) {
        const school = await response.json();
        setFormData({
          totalStudents: school.totalStudents || 0,
          presentStudents: school.presentStudents || 0,
          totalTeachers: school.totalTeachers || 0,
          presentTeachers: school.presentTeachers || 0,
          totalToilets: school.totalToilets || 0,
          workingToilets: school.workingToilets || 0,
          brokenToilets: school.brokenToilets || 0,
          isDrinkingWaterAvailable: school.isDrinkingWaterAvailable || false,
          desksNew: school.desksNew || 0,
          desksInUse: school.desksInUse || 0,
          desksBroken: school.desksBroken || 0,
          fansNew: school.fansNew || 0,
          fansInUse: school.fansInUse || 0,
          fansBroken: school.fansBroken || 0,
          chairsNew: school.chairsNew || 0,
          chairsInUse: school.chairsInUse || 0,
          chairsBroken: school.chairsBroken || 0,
          blackboardsNew: school.blackboardsNew || 0,
          blackboardsInUse: school.blackboardsInUse || 0,
          blackboardsBroken: school.blackboardsBroken || 0,
          computersNew: school.computersNew || 0,
          computersInUse: school.computersInUse || 0,
          computersBroken: school.computersBroken || 0,
        });
      }
    } catch (error) {
      console.error('Failed to load school data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate absent counts
    const absentStudents = formData.totalStudents - formData.presentStudents;
    const absentTeachers = formData.totalTeachers - formData.presentTeachers;

    // Auto-calculate broken toilets
    const brokenToilets = formData.totalToilets - formData.workingToilets;

    if (absentStudents < 0 || absentTeachers < 0) {
      toast({
        title: 'Validation Error',
        description: 'Present count cannot exceed total count',
        variant: 'destructive',
      });
      return;
    }

    if (brokenToilets < 0) {
      toast({
        title: 'Validation Error',
        description: 'Working toilets cannot exceed total toilets',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/schools/${schoolId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          absentStudents,
          absentTeachers,
          brokenToilets,
          dataLastUpdated: new Date(),
        }),
      });

      if (response.ok) {
        const fieldsUpdated = [];
        if (formData.totalStudents > 0 || formData.presentStudents > 0) fieldsUpdated.push('attendance');
        if (formData.totalToilets > 0) fieldsUpdated.push('toilets');
        if (formData.isDrinkingWaterAvailable !== undefined) fieldsUpdated.push('water');
        if (formData.desksNew > 0 || formData.desksInUse > 0 || formData.desksBroken > 0) fieldsUpdated.push('desks');
        if (formData.fansNew > 0 || formData.fansInUse > 0 || formData.fansBroken > 0) fieldsUpdated.push('fans');
        if (formData.chairsNew > 0 || formData.chairsInUse > 0 || formData.chairsBroken > 0) fieldsUpdated.push('chairs');
        
        analytics.school.dataUpdated(schoolId, fieldsUpdated);
        
        if (formData.totalStudents > 0) {
          const studentPct = formData.totalStudents > 0 ? Math.round((formData.presentStudents / formData.totalStudents) * 100) : 0;
          const teacherPct = formData.totalTeachers > 0 ? Math.round((formData.presentTeachers / formData.totalTeachers) * 100) : 0;
          analytics.school.attendanceSubmitted(schoolId, studentPct, teacherPct);
        }
        
        toast({
          title: 'Success',
          description: 'School data updated successfully',
        });
        navigate('/dashboard');
      } else {
        throw new Error('Failed to update school data');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update school data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const NumberInput = ({ label, field, icon: Icon }: { label: string; field: string; icon: any }) => (
    <div className="space-y-2">
      <Label htmlFor={field} className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {label}
      </Label>
      <Input
        id={field}
        type="number"
        min="0"
        value={formData[field as keyof typeof formData] as number}
        onChange={(e) => updateField(field, parseInt(e.target.value) || 0)}
        className="w-full"
      />
    </div>
  );

  const InventorySection = ({ title, prefix }: { title: string; prefix: string }) => (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NumberInput label="New" field={`${prefix}New`} icon={Calculator} />
        <NumberInput label="In Use" field={`${prefix}InUse`} icon={Calculator} />
        <NumberInput label="Broken" field={`${prefix}Broken`} icon={Calculator} />
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Total: {(formData[`${prefix}New` as keyof typeof formData] as number) +
                (formData[`${prefix}InUse` as keyof typeof formData] as number) +
                (formData[`${prefix}Broken` as keyof typeof formData] as number)}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Update School Data</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Attendance Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Attendance Tracking
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3 text-blue-700">Student Attendance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NumberInput label="Total Students" field="totalStudents" icon={Users} />
                  <NumberInput label="Present Students" field="presentStudents" icon={Users} />
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-gray-600">Absent: </span>
                  <span className="font-semibold text-red-600">
                    {formData.totalStudents - formData.presentStudents}
                  </span>
                  {formData.totalStudents > 0 && (
                    <span className="ml-2 text-gray-500">
                      ({((formData.presentStudents / formData.totalStudents) * 100).toFixed(1)}% attendance)
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3 text-green-700">Teacher Attendance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NumberInput label="Total Teachers" field="totalTeachers" icon={Users} />
                  <NumberInput label="Present Teachers" field="presentTeachers" icon={Users} />
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-gray-600">Absent: </span>
                  <span className="font-semibold text-red-600">
                    {formData.totalTeachers - formData.presentTeachers}
                  </span>
                  {formData.totalTeachers > 0 && (
                    <span className="ml-2 text-gray-500">
                      ({((formData.presentTeachers / formData.totalTeachers) * 100).toFixed(1)}% attendance)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Infrastructure Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Infrastructure Details
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Toilet Facilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NumberInput label="Total Toilets" field="totalToilets" icon={Building2} />
                  <NumberInput label="Working Toilets" field="workingToilets" icon={Building2} />
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-gray-600">Broken: </span>
                  <span className={`font-semibold ${(formData.totalToilets - formData.workingToilets) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formData.totalToilets - formData.workingToilets}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="water"
                  checked={formData.isDrinkingWaterAvailable}
                  onCheckedChange={(checked) => updateField('isDrinkingWaterAvailable', checked === true)}
                />
                <Label htmlFor="water" className="flex items-center gap-2 cursor-pointer">
                  <Droplet className="w-4 h-4 text-blue-500" />
                  Drinking Water Available
                </Label>
              </div>
            </div>
          </Card>

          {/* Inventory Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Inventory Status
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <InventorySection title="Desks" prefix="desks" />
              <InventorySection title="Fans" prefix="fans" />
              <InventorySection title="Chairs" prefix="chairs" />
              <InventorySection title="Blackboards" prefix="blackboards" />
              <InventorySection title="Computers" prefix="computers" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
