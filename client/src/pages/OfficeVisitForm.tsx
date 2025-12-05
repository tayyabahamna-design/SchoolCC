import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useMockAEOActivities, OfficeVisitData } from '@/hooks/useMockAEOActivities';
import { toast } from 'sonner';

export default function OfficeVisitForm() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { addOfficeVisit } = useMockAEOActivities();

  const [formData, setFormData] = useState<Partial<OfficeVisitData>>({
    aeoName: user?.name || '',
    visitDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    evidence: [],
    activitiesCompleted: {
      admin: false,
      reporting: false,
      meeting: false,
      coordination: false,
      oversight: false,
      audit: false,
      exams: false,
      other: false,
    },
  });

  const [evidence, setEvidence] = useState<{ id: string; name: string; type: 'photo' | 'document' | 'voice'; url: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleActivityChange = (activity: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      activitiesCompleted: {
        ...prev.activitiesCompleted!,
        [activity]: checked,
      },
    }));
  };

  const handleAddEvidence = () => {
    const newEvidence = {
      id: `ev-${Date.now()}`,
      name: `Evidence ${evidence.length + 1}`,
      type: 'photo' as const,
      url: `evidence-${Date.now()}.jpg`,
    };
    setEvidence([...evidence, newEvidence]);
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidence(evidence.filter((e) => e.id !== id));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(() => {
      const { id: _, ...dataWithoutId } = formData;
      const visit: OfficeVisitData = {
        id: `off-${Date.now()}`,
        ...(dataWithoutId as OfficeVisitData),
        evidence,
        status: 'submitted',
        submittedAt: new Date(),
      };
      addOfficeVisit(visit);
      toast.success('Office visit submitted successfully!');
      navigate('/aeo-activity/hub');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/aeo-activity/hub')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 ml-4">Office Visit Form</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Visit Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Visit Date</label>
                <Input
                  type="date"
                  value={formData.visitDate || ''}
                  onChange={(e) => handleInputChange('visitDate', e.target.value)}
                  data-testid="input-visit-date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Arrival Time</label>
                <Input
                  type="time"
                  value={formData.arrivalTime || ''}
                  onChange={(e) => handleInputChange('arrivalTime', e.target.value)}
                  data-testid="input-arrival-time"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Departure Time</label>
                <Input
                  type="time"
                  value={formData.departureTime || ''}
                  onChange={(e) => handleInputChange('departureTime', e.target.value)}
                  data-testid="input-departure-time"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Purpose</label>
                <Input
                  placeholder="e.g., Report compilation, meetings"
                  value={formData.purpose || ''}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  data-testid="input-purpose"
                />
              </div>
            </div>
          </Card>

          {/* Activities Completed */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Activities Completed</h2>
            <p className="text-sm text-slate-600 mb-4">Check the activities you completed during this office visit</p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { actId: 'admin', label: 'Administrative Tasks' },
                { actId: 'reporting', label: 'Reporting' },
                { actId: 'meeting', label: 'Meetings' },
                { actId: 'coordination', label: 'Coordination' },
                { actId: 'oversight', label: 'Oversight' },
                { actId: 'audit', label: 'School/Records Audit' },
                { actId: 'exams', label: 'Exam Facilitation' },
                { actId: 'other', label: 'Other' },
              ].map((activity) => (
                <div key={activity.actId} className="flex items-center space-x-2">
                  <Checkbox
                    id={activity.actId}
                    checked={formData.activitiesCompleted?.[activity.actId as keyof typeof formData.activitiesCompleted] === true}
                    onCheckedChange={(checked) => handleActivityChange(activity.actId, checked === true)}
                    data-testid={`checkbox-activity-${activity.actId}`}
                  />
                  <label htmlFor={activity.actId} className="text-sm font-medium text-slate-700 cursor-pointer">
                    {activity.label}
                  </label>
                </div>
              ))}
            </div>

            {formData.activitiesCompleted?.other && (
              <div className="mt-4">
                <Input
                  placeholder="Please describe other activities"
                  value={formData.activitiesCompleted?.otherDescription || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      activitiesCompleted: {
                        ...prev.activitiesCompleted!,
                        otherDescription: e.target.value,
                      },
                    }))
                  }
                  data-testid="input-other-description"
                />
              </div>
            )}
          </Card>

          {/* Comments */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Comments</h2>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 min-h-24"
              placeholder="Enter any additional comments or notes..."
              value={formData.comments || ''}
              onChange={(e) => handleInputChange('comments', e.target.value)}
              data-testid="textarea-comments"
            />
          </Card>

          {/* Evidence */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Evidence & Documentation</h2>

            <div className="space-y-4">
              <Button
                onClick={handleAddEvidence}
                className="w-full"
                variant="outline"
                data-testid="button-add-evidence"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Evidence
              </Button>

              {evidence.length > 0 && (
                <div className="space-y-3 mt-4">
                  {evidence.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                      data-testid={`evidence-item-${item.id}`}
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-600">{item.type}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEvidence(item.id)}
                        data-testid={`button-remove-evidence-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/aeo-activity/hub')}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              data-testid="button-submit"
            >
              {loading ? 'Submitting...' : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Office Visit
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
