import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLocation } from 'wouter';
import { ArrowLeft, Save, School, MapPin, Hash } from 'lucide-react';
import { useState, useEffect } from 'react';
import { realSchools } from '@/data/realData';
import { useToast } from '@/hooks/use-toast';

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
    totalStudents: '',
    totalTeachers: '',
    classrooms: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role === 'HEAD_TEACHER' && user.schoolId) {
      const school = realSchools.find(s => s.code === user.schoolId);
      if (school) {
        setFormData({
          name: school.name || '',
          emisNumber: school.emisNumber || '',
          address: '',
          phone: '',
          email: '',
          principalName: user.name || '',
          totalStudents: '',
          totalTeachers: '',
          classrooms: '',
        });
      }
    }
  }, [user]);

  if (!user || user.role !== 'HEAD_TEACHER') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Only Head Teachers can edit school details.</p>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      toast({
        title: "School Updated",
        description: "School details have been saved successfully.",
      });
      setIsSubmitting(false);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit School Details</h1>
            <p className="text-sm text-muted-foreground">Update your school information</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <School className="w-5 h-5 text-primary" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">School Name</Label>
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
                <Label htmlFor="emisNumber">EMIS Number</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="emisNumber"
                    name="emisNumber"
                    value={formData.emisNumber}
                    onChange={handleChange}
                    placeholder="EMIS Number"
                    className="pl-9"
                    readOnly
                    data-testid="input-emis-number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="principalName">Principal/Head Teacher Name</Label>
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
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  data-testid="input-phone"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
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
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Location & Infrastructure
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  rows={3}
                  data-testid="input-address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalStudents">Total Students</Label>
                  <Input
                    id="totalStudents"
                    name="totalStudents"
                    type="number"
                    value={formData.totalStudents}
                    onChange={handleChange}
                    placeholder="0"
                    data-testid="input-total-students"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalTeachers">Total Teachers</Label>
                  <Input
                    id="totalTeachers"
                    name="totalTeachers"
                    type="number"
                    value={formData.totalTeachers}
                    onChange={handleChange}
                    placeholder="0"
                    data-testid="input-total-teachers"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classrooms">Number of Classrooms</Label>
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
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
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
              className="bg-gradient-to-r from-blue-600 to-purple-600"
              data-testid="button-save"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
