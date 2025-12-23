import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useMockVisits } from '@/hooks/useMockVisits';
import { useLocation } from 'wouter';
import { ArrowLeft, MapPin } from 'lucide-react';

const SCHOOLS = [
  { id: 'school-1', name: 'Government Primary School, Zone A' },
  { id: 'school-2', name: 'Government Upper Primary School' },
  { id: 'school-3', name: 'Government Secondary School' },
];

export default function CreateVisit() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { createVisit } = useMockVisits();

  const [selectedSchool, setSelectedSchool] = useState('');
  const [visitType, setVisitType] = useState<'monitoring' | 'mentoring'>('monitoring');
  const [objectives, setObjectives] = useState('');
  const [classesToObserve, setClassesToObserve] = useState<string[]>([]);
  const [currentClass, setCurrentClass] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  // Only AEOs can plan visits
  if (user.role !== 'AEO') {
    navigate('/school-visits');
    return null;
  }

  const handleAddClass = () => {
    if (currentClass.trim() && !classesToObserve.includes(currentClass)) {
      setClassesToObserve([...classesToObserve, currentClass]);
      setCurrentClass('');
    }
  };

  const handleRemoveClass = (className: string) => {
    setClassesToObserve(classesToObserve.filter((c) => c !== className));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool || !objectives.trim()) return;

    setLoading(true);
    setTimeout(() => {
      const school = SCHOOLS.find((s) => s.id === selectedSchool);
      if (school) {
        const newVisit = createVisit(
          selectedSchool,
          school.name,
          visitType,
          objectives,
          visitType === 'mentoring' ? classesToObserve : undefined,
          user.id,
          user.name,
          user.role
        );
        navigate(`/visit/${newVisit.id}`);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/school-visits')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground ml-4">Plan School Visit</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Visit Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Visit Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select School *
                </label>
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="select-school"
                >
                  <option value="">Choose a school...</option>
                  {SCHOOLS.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Visit Type *
                </label>
                <div className="space-y-2">
                  {(['monitoring', 'mentoring'] as const).map((type) => (
                    <label
                      key={type}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        visitType === type
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card hover:border-primary/30'
                      }`}
                      data-testid={`radio-visit-type-${type}`}
                    >
                      <input
                        type="radio"
                        name="visitType"
                        value={type}
                        checked={visitType === type}
                        onChange={(e) => setVisitType(e.target.value as any)}
                        className="w-4 h-4"
                      />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-foreground capitalize">{type}</div>
                        <div className="text-xs text-muted-foreground">
                          {type === 'monitoring' && 'Infrastructure, attendance, and facilities check'}
                          {type === 'mentoring' && 'Teacher observation and HOTS mentoring session'}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Visit Objectives *
                </label>
                <textarea
                  placeholder="Describe the objectives for this visit (e.g., Check infrastructure status, Observe teaching methods...)"
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-20"
                  data-testid="textarea-objectives"
                />
              </div>

              {visitType === 'mentoring' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Classes to Observe
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      placeholder="e.g., Class 5-A, Grade 4 Science"
                      value={currentClass}
                      onChange={(e) => setCurrentClass(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddClass();
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      data-testid="input-class-name"
                    />
                    <button
                      type="button"
                      onClick={handleAddClass}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                      data-testid="button-add-class"
                    >
                      Add
                    </button>
                  </div>
                  {classesToObserve.length > 0 && (
                    <div className="space-y-2">
                      {classesToObserve.map((cls) => (
                        <div key={cls} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                          <span className="text-sm text-foreground">{cls}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveClass(cls)}
                            className="text-xs text-red-600 hover:text-red-700"
                            data-testid={`button-remove-class-${cls}`}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Info */}
          <Card className="p-6 bg-primary/5 border-l-4 border-l-primary">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              GPS & Evidence
            </h3>
            <p className="text-sm text-muted-foreground">
              Your location will be automatically recorded throughout the visit. You can add photos, voice notes, and detailed observations for each indicator.
            </p>
          </Card>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/school-visits')}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedSchool || !objectives.trim() || loading}
              data-testid="button-start-visit"
            >
              {loading ? 'Starting...' : 'Plan Visit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
