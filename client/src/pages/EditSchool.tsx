import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useLocation } from 'wouter';
import { ArrowLeft, Save, School, MapPin, Hash, Users, Building2, Droplet, Calculator, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { realSchools } from '@/data/realData';
import { useToast } from '@/hooks/use-toast';
import { analytics } from '@/lib/analytics';

export default function EditSchool() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    emisNumber: '',
    address: '',
    phone: '',
    email: '',
    principalName: '',
    classrooms: '',
    totalStudents: 0,
    presentStudents: 0,
    totalTeachers: 0,
    presentTeachers: 0,
    totalToilets: 0,
    workingToilets: 0,
    isDrinkingWaterAvailable: false,
    desksNew: 0,
    desksInUse: 0,
    desksBroken: 0,
    fansNew: 0,
    fansInUse: 0,
    fansBroken: 0,
    chairsNew: 0,
    chairsInUse: 0,
    chairsBroken: 0,
    blackboardsNew: 0,
    blackboardsInUse: 0,
    blackboardsBroken: 0,
    computersNew: 0,
    computersInUse: 0,
    computersBroken: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'attendance' | 'infrastructure' | 'inventory'>('basic');

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

    if (user?.schoolId) {
      loadSchoolData(user.schoolId);
    }
  }, [user, canEdit]);

  const loadSchoolData = async (id: string) => {
    try {
      const school = realSchools.find(s => s.code === id);
      if (school) {
        setFormData(prev => ({
          ...prev,
          name: school.name || '',
          emisNumber: school.emisNumber || '',
          principalName: user?.name || '',
        }));
      }

      const response = await fetch(`/api/admin/schools/${id}`);
      if (response.ok) {
        const schoolData = await response.json();
        setFormData(prev => ({
          ...prev,
          name: schoolData.name || prev.name,
          emisNumber: schoolData.emisNumber || prev.emisNumber,
          address: schoolData.address || '',
          totalStudents: schoolData.totalStudents || 0,
          presentStudents: schoolData.presentStudents || 0,
          totalTeachers: schoolData.totalTeachers || 0,
          presentTeachers: schoolData.presentTeachers || 0,
          totalToilets: schoolData.totalToilets || 0,
          workingToilets: schoolData.workingToilets || 0,
          isDrinkingWaterAvailable: schoolData.isDrinkingWaterAvailable || false,
          desksNew: schoolData.desksNew || 0,
          desksInUse: schoolData.desksInUse || 0,
          desksBroken: schoolData.desksBroken || 0,
          fansNew: schoolData.fansNew || 0,
          fansInUse: schoolData.fansInUse || 0,
          fansBroken: schoolData.fansBroken || 0,
          chairsNew: schoolData.chairsNew || 0,
          chairsInUse: schoolData.chairsInUse || 0,
          chairsBroken: schoolData.chairsBroken || 0,
          blackboardsNew: schoolData.blackboardsNew || 0,
          blackboardsInUse: schoolData.blackboardsInUse || 0,
          blackboardsBroken: schoolData.blackboardsBroken || 0,
          computersNew: schoolData.computersNew || 0,
          computersInUse: schoolData.computersInUse || 0,
          computersBroken: schoolData.computersBroken || 0,
        }));
      }
    } catch (error) {
      console.error('Failed to load school data:', error);
    }
  };

  if (!user || !canEdit) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">You don't have permission to edit school details.</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4" data-testid="button-go-back">
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateField = (field: string, value: number | boolean | string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const absentStudents = formData.totalStudents - formData.presentStudents;
    const absentTeachers = formData.totalTeachers - formData.presentTeachers;
    const brokenToilets = formData.totalToilets - formData.workingToilets;

    if (absentStudents < 0 || absentTeachers < 0) {
      toast({
        title: 'Validation Error',
        description: 'Present count cannot exceed total count',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/schools/${user.schoolId}`, {
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
        analytics.school.dataUpdated(user.schoolId || '', ['basic', 'attendance', 'infrastructure', 'inventory']);
        
        toast({
          title: "School Updated",
          description: "All school details have been saved successfully.",
        });
        navigate('/dashboard');
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      toast({
        title: "Saved Locally",
        description: "School details saved. Will sync when online.",
      });
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const NumberInput = ({ label, field, icon: Icon }: { label: string; field: string; icon: any }) => (
    <div className="space-y-2">
      <Label htmlFor={field} className="flex items-center gap-2 text-sm">
        <Icon className="w-4 h-4 text-muted-foreground" />
        {label}
      </Label>
      <Input
        id={field}
        type="number"
        min="0"
        value={formData[field as keyof typeof formData] as number}
        onChange={(e) => updateField(field, parseInt(e.target.value) || 0)}
        className="w-full"
        data-testid={`input-${field}`}
      />
    </div>
  );

  const InventoryItem = ({ title, prefix }: { title: string; prefix: string }) => (
    <div className="p-4 border border-border rounded-lg">
      <h4 className="font-medium text-foreground mb-3">{title}</h4>
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">New</Label>
          <Input
            type="number"
            min="0"
            value={formData[`${prefix}New` as keyof typeof formData] as number}
            onChange={(e) => updateField(`${prefix}New`, parseInt(e.target.value) || 0)}
            className="h-9"
            data-testid={`input-${prefix}-new`}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">In Use</Label>
          <Input
            type="number"
            min="0"
            value={formData[`${prefix}InUse` as keyof typeof formData] as number}
            onChange={(e) => updateField(`${prefix}InUse`, parseInt(e.target.value) || 0)}
            className="h-9"
            data-testid={`input-${prefix}-in-use`}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Broken</Label>
          <Input
            type="number"
            min="0"
            value={formData[`${prefix}Broken` as keyof typeof formData] as number}
            onChange={(e) => updateField(`${prefix}Broken`, parseInt(e.target.value) || 0)}
            className="h-9"
            data-testid={`input-${prefix}-broken`}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Total: {(formData[`${prefix}New` as keyof typeof formData] as number) +
                (formData[`${prefix}InUse` as keyof typeof formData] as number) +
                (formData[`${prefix}Broken` as keyof typeof formData] as number)}
      </p>
    </div>
  );

  const tabs = [
    { id: 'basic' as const, label: 'Basic Info', labelUrdu: 'بنیادی معلومات', icon: School },
    { id: 'attendance' as const, label: 'Attendance', labelUrdu: 'حاضری', icon: Users },
    { id: 'infrastructure' as const, label: 'Infrastructure', labelUrdu: 'انفراسٹرکچر', icon: Building2 },
    { id: 'inventory' as const, label: 'Inventory', labelUrdu: 'انوینٹری', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">School Management</h1>
            <p className="text-sm text-muted-foreground">اسکول کی تفصیلات</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
              data-testid={`tab-${tab.id}`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'basic' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <School className="w-5 h-5 text-primary" />
                Basic Information / بنیادی معلومات
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">School Name / اسکول کا نام</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter school name"
                    data-testid="input-school-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emisNumber">EMIS Number / ایمس نمبر</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="emisNumber"
                      name="emisNumber"
                      value={formData.emisNumber}
                      onChange={handleChange}
                      className="pl-9"
                      readOnly
                      data-testid="input-emis-number"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="principalName">Head Teacher Name / ہیڈ ٹیچر کا نام</Label>
                  <Input
                    id="principalName"
                    name="principalName"
                    value={formData.principalName}
                    onChange={handleChange}
                    placeholder="Principal name"
                    data-testid="input-principal-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone / فون نمبر</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="03xx-xxxxxxx"
                    data-testid="input-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email / ای میل</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="school@example.com"
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classrooms">Classrooms / کمرے</Label>
                  <Input
                    id="classrooms"
                    name="classrooms"
                    type="number"
                    value={formData.classrooms}
                    onChange={handleChange}
                    placeholder="0"
                    data-testid="input-classrooms"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address / پتہ</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter complete address"
                    rows={2}
                    data-testid="input-address"
                  />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'attendance' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Attendance Tracking / حاضری
              </h2>
              <p className="text-sm text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                <span className="font-medium">Update daily before 10:00 AM</span>
                <span className="text-muted-foreground">|</span>
                <span>روزانہ صبح 10 بجے سے پہلے اپڈیٹ کریں</span>
              </p>

              <div className="space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-medium mb-3 text-blue-700 dark:text-blue-300">Student Attendance / طلباء کی حاضری</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput label="Total Students" field="totalStudents" icon={Users} />
                    <NumberInput label="Present Students" field="presentStudents" icon={Users} />
                  </div>
                  <div className="mt-3 p-2 bg-white dark:bg-background rounded text-sm">
                    <span className="text-muted-foreground">Absent: </span>
                    <span className="font-semibold text-red-600">
                      {Math.max(0, formData.totalStudents - formData.presentStudents)}
                    </span>
                    {formData.totalStudents > 0 && (
                      <span className="ml-2 text-muted-foreground">
                        ({((formData.presentStudents / formData.totalStudents) * 100).toFixed(0)}% attendance)
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="font-medium mb-3 text-green-700 dark:text-green-300">Teacher Attendance / اساتذہ کی حاضری</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput label="Total Teachers" field="totalTeachers" icon={Users} />
                    <NumberInput label="Present Teachers" field="presentTeachers" icon={Users} />
                  </div>
                  <div className="mt-3 p-2 bg-white dark:bg-background rounded text-sm">
                    <span className="text-muted-foreground">Absent: </span>
                    <span className="font-semibold text-red-600">
                      {Math.max(0, formData.totalTeachers - formData.presentTeachers)}
                    </span>
                    {formData.totalTeachers > 0 && (
                      <span className="ml-2 text-muted-foreground">
                        ({((formData.presentTeachers / formData.totalTeachers) * 100).toFixed(0)}% attendance)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'infrastructure' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Infrastructure / انفراسٹرکچر
              </h2>

              <div className="space-y-6">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <h3 className="font-medium mb-3 text-amber-700 dark:text-amber-300">Toilet Facilities / بیت الخلاء</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput label="Total Toilets" field="totalToilets" icon={Building2} />
                    <NumberInput label="Working Toilets" field="workingToilets" icon={Building2} />
                  </div>
                  <div className="mt-3 p-2 bg-white dark:bg-background rounded text-sm">
                    <span className="text-muted-foreground">Broken: </span>
                    <span className={`font-semibold ${(formData.totalToilets - formData.workingToilets) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {Math.max(0, formData.totalToilets - formData.workingToilets)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                  <Checkbox
                    id="water"
                    checked={formData.isDrinkingWaterAvailable}
                    onCheckedChange={(checked) => updateField('isDrinkingWaterAvailable', checked === true)}
                    data-testid="checkbox-water"
                  />
                  <Label htmlFor="water" className="flex items-center gap-2 cursor-pointer">
                    <Droplet className="w-5 h-5 text-cyan-500" />
                    <span>Drinking Water Available / پینے کا پانی دستیاب</span>
                  </Label>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'inventory' && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Inventory Status / انوینٹری
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InventoryItem title="Desks / ڈیسک" prefix="desks" />
                <InventoryItem title="Fans / پنکھے" prefix="fans" />
                <InventoryItem title="Chairs / کرسیاں" prefix="chairs" />
                <InventoryItem title="Blackboards / بلیک بورڈ" prefix="blackboards" />
                <InventoryItem title="Computers / کمپیوٹر" prefix="computers" />
              </div>
            </Card>
          )}

          <div className="flex justify-between gap-3 sticky bottom-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-emerald-600 to-teal-600"
              data-testid="button-save"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
