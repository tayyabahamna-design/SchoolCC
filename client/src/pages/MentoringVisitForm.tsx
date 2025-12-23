import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Mic, Square, Play, X } from 'lucide-react';
import { useMockAEOActivities, MentoringVisitData, MentoringVisitArea } from '@/hooks/useMockAEOActivities';
import { toast } from 'sonner';
import { realSchools } from '@/data/realData';

// Use real schools from data
const SCHOOLS = realSchools.map(school => `${school.name} (${school.emisNumber})`);

const SUBJECTS = ['English', 'Urdu', 'Mathematics', 'Science', 'Social Studies', 'General'];

interface Props {
  onClose?: () => void;
}

export default function MentoringVisitForm({ onClose }: Props) {
  const { user } = useAuth();
  const { addMentoringVisit, mentoringAreas } = useMockAEOActivities();

  const [formData, setFormData] = useState<Partial<MentoringVisitData>>({
    aeoName: user?.name || '',
    visitDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    evidence: [],
    indicators: [],
  });

  const [selectedAreas, setSelectedAreas] = useState<Record<string, Record<string, 'emerging' | 'developing' | 'proficient' | null>>>({});

  const [evidence, setEvidence] = useState<{ id: string; name: string; type: 'photo' | 'document' | 'voice'; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [recordingField, setRecordingField] = useState<string | null>(null);
  const [recordedVoiceNotes, setRecordedVoiceNotes] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleIndicatorRating = (areaId: string, indicatorId: string, rating: 'emerging' | 'developing' | 'proficient') => {
    setSelectedAreas((prev) => ({
      ...prev,
      [areaId]: {
        ...(prev[areaId] || {}),
        [indicatorId]: rating,
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

  const toggleVoiceRecording = (fieldId: string) => {
    if (recordingField === fieldId) {
      setRecordingField(null);
      setRecordedVoiceNotes((prev) => ({
        ...prev,
        [fieldId]: `voice_${Date.now()}`,
      }));
    } else {
      setRecordingField(fieldId);
    }
  };

  const deleteVoiceNote = (fieldId: string) => {
    setRecordedVoiceNotes((prev) => {
      const updated = { ...prev };
      delete updated[fieldId];
      return updated;
    });
    setRecordingField(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(() => {
      const visit: MentoringVisitData = {
        id: `ment-${Date.now()}`,
        aeoName: formData.aeoName || '',
        schoolName: formData.schoolName || '',
        visitDate: formData.visitDate || '',
        arrivalTime: formData.arrivalTime || '',
        departureTime: formData.departureTime || '',
        classObserved: formData.classObserved || '',
        teacherName: formData.teacherName || '',
        subject: formData.subject || '',
        indicators: formData.indicators || [],
        generalFeedback: formData.generalFeedback || '',
        strengthsObserved: formData.strengthsObserved || '',
        areasForImprovement: formData.areasForImprovement || '',
        actionItems: formData.actionItems || '',
        evidence,
        status: 'submitted',
        submittedAt: new Date(),
      };
      addMentoringVisit(visit);
      toast.success('Mentoring visit submitted successfully!');
      onClose?.();
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
    <div className="bg-card rounded-lg p-6 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Mentoring Visit Form (HOTS)</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-testid="button-back"
        >
          ✕
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-6">
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
                Rate each indicator within every area based on your observation.
              </p>

              <div className="space-y-10">
                {mentoringAreas.map((area) => (
                  <div key={area.id} className="border-b pb-8 last:border-b-0">
                    <h3 className="text-base font-bold text-slate-900 mb-6 p-3 bg-slate-100 rounded-lg">
                      {area.name}
                    </h3>

                    <div className="space-y-6 ml-4">
                      {area.indicators.map((indicator) => {
                        const selectedRating = selectedAreas[area.id]?.[indicator.id];
                        const currentIndicatorData = area.indicators.find((ind) => ind.id === indicator.id);

                        return (
                          <div key={indicator.id} className="border-l-2 border-slate-300 pl-4">
                            <h4 className="font-semibold text-slate-800 mb-1">{indicator.name}</h4>
                            {indicator.description && (
                              <p className="text-xs text-slate-600 mb-3">{indicator.description}</p>
                            )}

                            {/* Rating Buttons */}
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              {['emerging', 'developing', 'proficient'].map((rating) => (
                                <button
                                  key={rating}
                                  onClick={() => handleIndicatorRating(area.id, indicator.id, rating as any)}
                                  className={`p-2 rounded-lg border-2 text-center transition-all text-sm ${
                                    selectedRating === rating
                                      ? getRatingColor(rating) + ' border-current font-semibold'
                                      : 'bg-white border-slate-300 hover:border-slate-400'
                                  }`}
                                  data-testid={`button-rating-${area.id}-${indicator.id}-${rating}`}
                                >
                                  <div className="capitalize font-medium">
                                    {rating === 'emerging' && '🔴'}
                                    {rating === 'developing' && '🟡'}
                                    {rating === 'proficient' && '🟢'}
                                    <span className="ml-1 text-xs">{rating}</span>
                                  </div>
                                </button>
                              ))}
                            </div>

                            {/* Rubric Display */}
                            {selectedRating && (
                              <div className={`p-3 rounded-lg text-sm ${getRatingColor(selectedRating)}`}>
                                <p className="text-slate-900 font-medium mb-1">Rubric:</p>
                                <p className="text-slate-700">{indicator.rubric[selectedRating]}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Feedback */}
          <TabsContent value="feedback" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Feedback & Action Items</h2>

              <div className="space-y-6">
                {/* Strengths Observed */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Strengths Observed
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 min-h-20"
                      placeholder="Describe the teacher's strengths..."
                      value={formData.strengthsObserved || ''}
                      onChange={(e) => handleInputChange('strengthsObserved', e.target.value)}
                      data-testid="textarea-strengths"
                    />
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant={recordingField === 'strengths' ? 'destructive' : 'outline'}
                        size="icon"
                        onClick={() => toggleVoiceRecording('strengths')}
                        className={recordingField === 'strengths' ? 'bg-red-600 hover:bg-red-700' : ''}
                        data-testid="button-record-strengths"
                        title={recordingField === 'strengths' ? 'Stop recording' : 'Record voice note'}
                      >
                        {recordingField === 'strengths' ? (
                          <Square className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </Button>
                      {recordedVoiceNotes['strengths'] && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled
                            data-testid="button-play-strengths"
                            title="Voice note recorded"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteVoiceNote('strengths')}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            data-testid="button-delete-strengths-voice"
                            title="Delete voice note"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {recordingField === 'strengths' && (
                    <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-red-100 rounded w-fit text-xs">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                      <span className="text-red-700 font-medium">Recording...</span>
                    </div>
                  )}
                  {recordedVoiceNotes['strengths'] && recordingField !== 'strengths' && (
                    <div className="text-xs text-green-600 font-medium mt-2">✓ Voice note recorded</div>
                  )}
                </div>

                {/* Areas for Improvement */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Areas for Improvement
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 min-h-20"
                      placeholder="Identify areas for improvement..."
                      value={formData.areasForImprovement || ''}
                      onChange={(e) => handleInputChange('areasForImprovement', e.target.value)}
                      data-testid="textarea-improvements"
                    />
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant={recordingField === 'improvements' ? 'destructive' : 'outline'}
                        size="icon"
                        onClick={() => toggleVoiceRecording('improvements')}
                        className={recordingField === 'improvements' ? 'bg-red-600 hover:bg-red-700' : ''}
                        data-testid="button-record-improvements"
                        title={recordingField === 'improvements' ? 'Stop recording' : 'Record voice note'}
                      >
                        {recordingField === 'improvements' ? (
                          <Square className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </Button>
                      {recordedVoiceNotes['improvements'] && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled
                            data-testid="button-play-improvements"
                            title="Voice note recorded"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteVoiceNote('improvements')}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            data-testid="button-delete-improvements-voice"
                            title="Delete voice note"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {recordingField === 'improvements' && (
                    <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-red-100 rounded w-fit text-xs">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                      <span className="text-red-700 font-medium">Recording...</span>
                    </div>
                  )}
                  {recordedVoiceNotes['improvements'] && recordingField !== 'improvements' && (
                    <div className="text-xs text-green-600 font-medium mt-2">✓ Voice note recorded</div>
                  )}
                </div>

                {/* Action Items */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Action Items
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 min-h-20"
                      placeholder="Specific action items for improvement..."
                      value={formData.actionItems || ''}
                      onChange={(e) => handleInputChange('actionItems', e.target.value)}
                      data-testid="textarea-actions"
                    />
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant={recordingField === 'actions' ? 'destructive' : 'outline'}
                        size="icon"
                        onClick={() => toggleVoiceRecording('actions')}
                        className={recordingField === 'actions' ? 'bg-red-600 hover:bg-red-700' : ''}
                        data-testid="button-record-actions"
                        title={recordingField === 'actions' ? 'Stop recording' : 'Record voice note'}
                      >
                        {recordingField === 'actions' ? (
                          <Square className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </Button>
                      {recordedVoiceNotes['actions'] && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled
                            data-testid="button-play-actions"
                            title="Voice note recorded"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteVoiceNote('actions')}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            data-testid="button-delete-actions-voice"
                            title="Delete voice note"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {recordingField === 'actions' && (
                    <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-red-100 rounded w-fit text-xs">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                      <span className="text-red-700 font-medium">Recording...</span>
                    </div>
                  )}
                  {recordedVoiceNotes['actions'] && recordingField !== 'actions' && (
                    <div className="text-xs text-green-600 font-medium mt-2">✓ Voice note recorded</div>
                  )}
                </div>

                {/* General Feedback */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    General Feedback
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900 min-h-20"
                      placeholder="Additional comments..."
                      value={formData.generalFeedback || ''}
                      onChange={(e) => handleInputChange('generalFeedback', e.target.value)}
                      data-testid="textarea-general-feedback"
                    />
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant={recordingField === 'feedback' ? 'destructive' : 'outline'}
                        size="icon"
                        onClick={() => toggleVoiceRecording('feedback')}
                        className={recordingField === 'feedback' ? 'bg-red-600 hover:bg-red-700' : ''}
                        data-testid="button-record-feedback"
                        title={recordingField === 'feedback' ? 'Stop recording' : 'Record voice note'}
                      >
                        {recordingField === 'feedback' ? (
                          <Square className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                      </Button>
                      {recordedVoiceNotes['feedback'] && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled
                            data-testid="button-play-feedback"
                            title="Voice note recorded"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteVoiceNote('feedback')}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            data-testid="button-delete-feedback-voice"
                            title="Delete voice note"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {recordingField === 'feedback' && (
                    <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-red-100 rounded w-fit text-xs">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                      <span className="text-red-700 font-medium">Recording...</span>
                    </div>
                  )}
                  {recordedVoiceNotes['feedback'] && recordingField !== 'feedback' && (
                    <div className="text-xs text-green-600 font-medium mt-2">✓ Voice note recorded</div>
                  )}
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
            onClick={onClose}
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
