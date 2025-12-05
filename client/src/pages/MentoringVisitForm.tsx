import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useMockAEOActivities, MentoringVisitData, MentoringVisitIndicator } from '@/hooks/useMockAEOActivities';
import { toast } from 'sonner';

const SCHOOLS = [
  'Government Primary School, Zone A',
  'Government Upper Primary School',
  'Government Secondary School',
];

const SUBJECTS = ['English', 'Urdu', 'Mathematics', 'Science', 'Social Studies', 'General'];

export default function MentoringVisitForm() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { addMentoringVisit, mentoringIndicators } = useMockAEOActivities();

  const [formData, setFormData] = useState<Partial<MentoringVisitData>>({
    aeoName: user?.name || '',
    visitDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    evidence: [],
    indicators: mentoringIndicators.map((ind) => ({
      id: ind.id,
      name: ind.name,
      rating: null,
      rubricText: '',
      examples: '',
    })),
  });

  const [evidence, setEvidence] = useState<{ id: string; name: string; type: 'photo' | 'document' | 'voice'; url: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleIndicatorRating = (indicatorId: string, rating: 'emerging' | 'developing' | 'proficient') => {
    const indicator = mentoringIndicators.find((ind) => ind.id === indicatorId);
    setFormData((prev) => ({
      ...prev,
      indicators: prev.indicators?.map((ind) => {
        if (ind.id === indicatorId && indicator) {
          return {
            ...ind,
            rating,
            rubricText: indicator.rubric[rating],
          };
        }
        return ind;
      }),
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
      const visit: MentoringVisitData = {
        id: `ment-${Date.now()}`,
        ...(dataWithoutId as MentoringVisitData),
        evidence,
        status: 'submitted',
        submittedAt: new Date(),
      };
      addMentoringVisit(visit);
      toast.success('Mentoring visit submitted successfully!');
      navigate('/aeo-activity/hub');
    }, 1000);
  };

  const getRatingColor = (rating: string | null) => {
    switch (rating) {
      case 'emerging':
        return 'bg-red-100 border-red-300';
      case 'developing':
        return 'bg-yellow-100 border-yellow-300';
      case 'proficient':
        return 'bg-green-100 border-green-300';
      default:
        return 'bg-slate-100 border-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/aeo-activity/hub')}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 ml-4">Mentoring Visit Form (HOTS)</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="indicators">HOTS Indicators</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
          </TabsList>

          {/* Basic Info */}
          <TabsContent value="basic" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">School Name</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900"
                    value={formData.schoolName || ''}
                    onChange={(e) => handleInputChange('schoolName', e.target.value)}
                    data-testid="select-school"
                  >
                    <option value="">Select school...</option>
                    {SCHOOLS.map((school) => (
                      <option key={school} value={school}>
                        {school}
                      </option>
                    ))}
                  </select>
                </div>
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
                  <label className="block text-sm font-medium text-slate-700 mb-2">Class Observed</label>
                  <Input
                    placeholder="e.g., Class 5-A"
                    value={formData.classObserved || ''}
                    onChange={(e) => handleInputChange('classObserved', e.target.value)}
                    data-testid="input-class-observed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Teacher Name</label>
                  <Input
                    placeholder="Enter teacher name"
                    value={formData.teacherName || ''}
                    onChange={(e) => handleInputChange('teacherName', e.target.value)}
                    data-testid="input-teacher-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900"
                    value={formData.subject || ''}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    data-testid="select-subject"
                  >
                    <option value="">Select subject...</option>
                    {SUBJECTS.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* HOTS Indicators */}
          <TabsContent value="indicators" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">HOTS Indicators</h2>
              <p className="text-sm text-slate-600 mb-6">
                Rate each indicator based on your observation. Select a rating to see rubric details.
              </p>

              <div className="space-y-8">
                {formData.indicators?.map((indicator, idx) => (
                  <div key={indicator.id} className="border-b pb-6 last:border-b-0">
                    <h3 className="font-semibold text-slate-900 mb-4">{indicator.name}</h3>

                    {/* Rating Buttons */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {['emerging', 'developing', 'proficient'].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleIndicatorRating(indicator.id, rating as any)}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            indicator.rating === rating
                              ? getRatingColor(rating) + ' border-current font-semibold'
                              : 'bg-white border-slate-300 hover:border-slate-400'
                          }`}
                          data-testid={`button-rating-${indicator.id}-${rating}`}
                        >
                          <div className="text-sm capitalize font-medium">
                            {rating === 'emerging' && '🔴'}
                            {rating === 'developing' && '🟡'}
                            {rating === 'proficient' && '🟢'}
                            <span className="ml-2">{rating}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Rubric Display */}
                    {indicator.rating && (
                      <div className={`p-4 rounded-lg ${getRatingColor(indicator.rating)}`}>
                        <p className="text-sm text-slate-900 font-medium">Rubric Description:</p>
                        <p className="text-sm text-slate-700 mt-2">{indicator.rubricText}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Feedback */}
          <TabsContent value="feedback" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Feedback & Action Items</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Strengths Observed
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 min-h-20"
                    placeholder="Describe the teacher's strengths..."
                    value={formData.strengthsObserved || ''}
                    onChange={(e) => handleInputChange('strengthsObserved', e.target.value)}
                    data-testid="textarea-strengths"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Areas for Improvement
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 min-h-20"
                    placeholder="Identify areas for improvement..."
                    value={formData.areasForImprovement || ''}
                    onChange={(e) => handleInputChange('areasForImprovement', e.target.value)}
                    data-testid="textarea-improvements"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Action Items
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 min-h-20"
                    placeholder="Specific action items for improvement..."
                    value={formData.actionItems || ''}
                    onChange={(e) => handleInputChange('actionItems', e.target.value)}
                    data-testid="textarea-actions"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    General Feedback
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 min-h-20"
                    placeholder="Additional comments..."
                    value={formData.generalFeedback || ''}
                    onChange={(e) => handleInputChange('generalFeedback', e.target.value)}
                    data-testid="textarea-general-feedback"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Evidence */}
          <TabsContent value="evidence" className="space-y-4">
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
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex gap-4 mt-8">
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
            className="flex-1 bg-purple-600 hover:bg-purple-700"
            data-testid="button-submit"
          >
            {loading ? 'Submitting...' : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit Mentoring Visit
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
