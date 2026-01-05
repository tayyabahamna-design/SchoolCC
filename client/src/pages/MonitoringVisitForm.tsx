import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, CheckCircle2, Check, Upload, X } from 'lucide-react';
import { useActivities, MonitoringVisitData } from '@/contexts/activities';
import { toast } from 'sonner';
import { realSchools } from '@/data/realData';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { analytics } from '@/lib/analytics';

const getAllSchools = () => realSchools.map(school => `${school.name.toUpperCase()} (${school.emisNumber})`);

const STEPS = [
  { id: 0, label: 'Basic Info' },
  { id: 1, label: 'Attendance' },
  { id: 2, label: 'Facilities' },
  { id: 3, label: 'Learning' },
  { id: 4, label: 'Voice Notes' },
  { id: 5, label: 'Evidence' },
];

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  type: string;
  previewUrl?: string;
}

interface Props {
  onClose?: () => void;
}

export default function MonitoringVisitForm({ onClose }: Props) {
  const { user } = useAuth();
  const { addMonitoringVisit } = useActivities();

  // Get schools - filter by assigned schools for AEO users
  const getSchools = () => {
    const allSchools = getAllSchools();
    if (user?.role === 'AEO' && user?.assignedSchools && user.assignedSchools.length > 0) {
      // assignedSchools contains names like "GBPS DHOKE ZIARAT"
      // allSchools contains display strings like "GBPS DHOKE ZIARAT (37330XXX)"
      // Match by checking if display string starts with the assigned school name (trimmed and normalized)
      return allSchools.filter(schoolDisplay => 
        user.assignedSchools!.some(assignedName => 
          schoolDisplay.toUpperCase().trim().startsWith(assignedName.toUpperCase().trim())
        )
      );
    }
    return allSchools;
  };
  
  const SCHOOLS = getSchools();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<MonitoringVisitData>>(() => ({
    aeoName: user?.name || '',
    markaz: user?.markaz || '',
    visitDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    evidence: [],
  }));

  // Sync formData with user data when user loads asynchronously
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        aeoName: user.name || prev.aeoName,
        markaz: user.markaz || prev.markaz,
      }));
    }
  }, [user]);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [voiceNoteTranscription, setVoiceNoteTranscription] = useState<string>('');
  const [voiceNoteBlob, setVoiceNoteBlob] = useState<Blob | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map((file) => {
      const uploadedFile: UploadedFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        name: file.name,
        type: file.type,
      };

      if (file.type.startsWith('image/')) {
        uploadedFile.previewUrl = URL.createObjectURL(file);
      }

      return uploadedFile;
    });

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const calculatePercentages = () => {
    if (formData.teacherTotal && formData.teacherPresent) {
      const pct = Math.round((formData.teacherPresent / formData.teacherTotal) * 100);
      handleInputChange('teacherPercentage', pct);
    }
    if (formData.studentTotal && formData.studentPresent) {
      const pct = Math.round((formData.studentPresent / formData.studentTotal) * 100);
      handleInputChange('studentPercentage', pct);
    }
  };

  const validateCurrentStep = (): boolean => {
    if (currentStep === 0) {
      return !!(formData.schoolName && formData.visitDate);
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { id: _, ...dataWithoutId } = formData;
      const evidence = uploadedFiles.map((f) => ({
        id: f.id,
        name: f.name,
        type: f.type.startsWith('image/') ? 'photo' as const : 'document' as const,
        url: f.previewUrl || f.name,
      }));

      const visitId = `mon-${Date.now()}`;
      const visit: MonitoringVisitData = {
        ...(dataWithoutId as MonitoringVisitData),
        id: visitId,
        markaz: user?.markaz || formData.markaz || '',
        evidence,
        status: 'submitted',
        submittedAt: new Date(),
      };
      await addMonitoringVisit(visit);
      analytics.visit.submitted(visit.id, 'monitoring', visit.schoolName || '');
      toast.success('Monitoring visit submitted successfully!');
      onClose?.();
    } catch (error) {
      console.error('Error submitting monitoring visit:', error);
    } finally {
      setLoading(false);
    }
  };

  const isStepComplete = (stepIndex: number): boolean => {
    return stepIndex < currentStep;
  };

  const renderProgressIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          Step {currentStep + 1} of {STEPS.length}
        </span>
        <span className="text-sm font-medium text-foreground">
          {STEPS[currentStep].label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                index === currentStep
                  ? 'bg-primary border-primary text-primary-foreground'
                  : isStepComplete(index)
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-muted border-muted-foreground/30 text-muted-foreground'
              }`}
              data-testid={`step-indicator-${index}`}
            >
              {isStepComplete(index) ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-xs font-semibold">{index + 1}</span>
              )}
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded ${
                  isStepComplete(index) ? 'bg-green-500' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {STEPS.map((step, index) => (
          <span
            key={step.id}
            className={`text-xs ${
              index === currentStep
                ? 'text-primary font-medium'
                : isStepComplete(index)
                ? 'text-green-600 font-medium'
                : 'text-muted-foreground'
            }`}
            style={{ width: `${100 / STEPS.length}%`, textAlign: 'center' }}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );

  const renderBasicInfo = () => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Markaz</label>
          {user?.markaz ? (
            <div className="px-3 py-2 border border-input rounded-md bg-muted text-foreground" data-testid="display-markaz">
              {user.markaz}
            </div>
          ) : (
            <Input
              placeholder="Enter markaz name"
              value={formData.markaz || ''}
              onChange={(e) => handleInputChange('markaz', e.target.value)}
              data-testid="input-markaz"
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            School Name <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
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
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Visit Date <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={formData.visitDate || ''}
            onChange={(e) => handleInputChange('visitDate', e.target.value)}
            data-testid="input-visit-date"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Arrival Time</label>
          <Input
            type="time"
            value={formData.arrivalTime || ''}
            onChange={(e) => handleInputChange('arrivalTime', e.target.value)}
            data-testid="input-arrival-time"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Departure Time</label>
          <Input
            type="time"
            value={formData.departureTime || ''}
            onChange={(e) => handleInputChange('departureTime', e.target.value)}
            data-testid="input-departure-time"
          />
        </div>
      </div>
    </Card>
  );

  const renderAttendance = () => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Attendance Data</h2>
      
      <div className="space-y-6">
        <div className="border-b pb-6">
          <h3 className="font-semibold text-foreground mb-4">Teachers</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Total Teachers</label>
              <Input
                type="number"
                value={formData.teacherTotal || ''}
                onChange={(e) => {
                  handleInputChange('teacherTotal', parseInt(e.target.value) || 0);
                  calculatePercentages();
                }}
                data-testid="input-teacher-total"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Present</label>
              <Input
                type="number"
                value={formData.teacherPresent || ''}
                onChange={(e) => {
                  handleInputChange('teacherPresent', parseInt(e.target.value) || 0);
                  calculatePercentages();
                }}
                data-testid="input-teacher-present"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Percentage</label>
              <div className="px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground">
                {formData.teacherPercentage || 0}%
              </div>
            </div>
          </div>
        </div>

        <div className="border-b pb-6">
          <label className="block text-sm font-medium text-muted-foreground mb-2">Head Teacher Status</label>
          <select
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            value={formData.headTeacherStatus || ''}
            onChange={(e) => handleInputChange('headTeacherStatus', e.target.value)}
            data-testid="select-head-teacher"
          >
            <option value="">Select status...</option>
            <option value="on_duty">On Duty</option>
            <option value="leave">On Leave</option>
          </select>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-4">Students</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Total Students</label>
              <Input
                type="number"
                value={formData.studentTotal || ''}
                onChange={(e) => {
                  handleInputChange('studentTotal', parseInt(e.target.value) || 0);
                  calculatePercentages();
                }}
                data-testid="input-student-total"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Present</label>
              <Input
                type="number"
                value={formData.studentPresent || ''}
                onChange={(e) => {
                  handleInputChange('studentPresent', parseInt(e.target.value) || 0);
                  calculatePercentages();
                }}
                data-testid="input-student-present"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Percentage</label>
              <div className="px-3 py-2 border border-input rounded-md bg-muted text-muted-foreground">
                {formData.studentPercentage || 0}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderFacilities = () => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Facilities Assessment</h2>
      
      <div className="space-y-6">
        <div className="border-b pb-6">
          <h3 className="font-semibold text-foreground mb-4">Furniture Availability</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Total Students</label>
              <Input
                type="number"
                value={formData.furnitureTotal || ''}
                onChange={(e) => handleInputChange('furnitureTotal', parseInt(e.target.value) || 0)}
                data-testid="input-furniture-total"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">With Furniture</label>
              <Input
                type="number"
                value={formData.furnitureWith || ''}
                onChange={(e) => handleInputChange('furnitureWith', parseInt(e.target.value) || 0)}
                data-testid="input-furniture-with"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Without Furniture</label>
              <Input
                type="number"
                value={formData.furnitureWithout || ''}
                onChange={(e) => handleInputChange('furnitureWithout', parseInt(e.target.value) || 0)}
                data-testid="input-furniture-without"
              />
            </div>
          </div>
        </div>

        <div className="border-b pb-6">
          <h3 className="font-semibold text-foreground mb-4">Toilet Sufficiency</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Total Students</label>
              <Input
                type="number"
                value={formData.toiletStudentTotal || ''}
                onChange={(e) => handleInputChange('toiletStudentTotal', parseInt(e.target.value) || 0)}
                data-testid="input-toilet-student-total"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Total Toilets</label>
              <Input
                type="number"
                value={formData.toiletTotal || ''}
                onChange={(e) => handleInputChange('toiletTotal', parseInt(e.target.value) || 0)}
                data-testid="input-toilet-total"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Required (SRT)</label>
              <Input
                type="number"
                value={formData.toiletRequired || ''}
                onChange={(e) => handleInputChange('toiletRequired', parseInt(e.target.value) || 0)}
                data-testid="input-toilet-required"
              />
            </div>
          </div>
        </div>

        <div className="border-b pb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Drinking Water</label>
            <select
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              value={formData.drinkingWater || ''}
              onChange={(e) => handleInputChange('drinkingWater', e.target.value)}
              data-testid="select-drinking-water"
            >
              <option value="">Select...</option>
              <option value="available">Available</option>
              <option value="not_available">Not Available</option>
              <option value="taste_issue">Taste Issue</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Classroom Observation</label>
          <select
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            value={formData.classroomObservation || ''}
            onChange={(e) => handleInputChange('classroomObservation', e.target.value)}
            data-testid="select-classroom-observation"
          >
            <option value="">Select...</option>
            <option value="good">Good</option>
            <option value="average">Average</option>
            <option value="need_improvement">Needs Improvement</option>
          </select>
        </div>
      </div>
    </Card>
  );

  const renderLearning = () => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Learning & Resources</h2>
      
      <div className="space-y-6">
        <div className="border-b pb-6">
          <h3 className="font-semibold text-foreground mb-4">LND (Literacy & Numeracy Drive)</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">English %</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.lndEnglishPercent || ''}
                onChange={(e) => handleInputChange('lndEnglishPercent', parseInt(e.target.value) || 0)}
                data-testid="input-lnd-english"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Urdu %</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.lndUrduPercent || ''}
                onChange={(e) => handleInputChange('lndUrduPercent', parseInt(e.target.value) || 0)}
                data-testid="input-lnd-urdu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Maths %</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.lndMathsPercent || ''}
                onChange={(e) => handleInputChange('lndMathsPercent', parseInt(e.target.value) || 0)}
                data-testid="input-lnd-maths"
              />
            </div>
          </div>
        </div>

        <div className="border-b pb-6">
          <h3 className="font-semibold text-foreground mb-4">NSB (Non-Salary Budget)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Total Allocation</label>
              <Input
                type="number"
                value={formData.nsbAllocation || ''}
                onChange={(e) => handleInputChange('nsbAllocation', parseInt(e.target.value) || 0)}
                data-testid="input-nsb-allocation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Expenditure</label>
              <Input
                type="number"
                value={formData.nsbExpenditure || ''}
                onChange={(e) => handleInputChange('nsbExpenditure', parseInt(e.target.value) || 0)}
                data-testid="input-nsb-expenditure"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Balance</label>
              <Input
                type="number"
                value={formData.nsbBalance || ''}
                onChange={(e) => handleInputChange('nsbBalance', parseInt(e.target.value) || 0)}
                data-testid="input-nsb-balance"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Utilization %</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.nsbUtilizationPercent || ''}
                onChange={(e) => handleInputChange('nsbUtilizationPercent', parseInt(e.target.value) || 0)}
                data-testid="input-nsb-utilization"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">General Remarks</label>
          <textarea
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-24"
            placeholder="Enter general remarks..."
            value={formData.generalRemarks || ''}
            onChange={(e) => handleInputChange('generalRemarks', e.target.value)}
            data-testid="textarea-general-remarks"
          />
        </div>
      </div>
    </Card>
  );

  const handleVoiceNoteComplete = (transcription: string, audioBlob: Blob) => {
    setVoiceNoteTranscription(transcription);
    setVoiceNoteBlob(audioBlob);
    handleInputChange('voiceNotes', transcription);
  };

  const renderVoiceNotes = () => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Voice Notes (Optional)</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Record your observations and comments during the visit. Voice notes will be transcribed automatically using AI.
      </p>

      <VoiceRecorder onTranscriptionComplete={handleVoiceNoteComplete} />

      {voiceNoteTranscription && (
        <div className="mt-6 p-4 bg-muted rounded-lg border">
          <h3 className="text-sm font-medium text-foreground mb-2">Transcribed Voice Note</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{voiceNoteTranscription}</p>
        </div>
      )}
    </Card>
  );

  const renderEvidence = () => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Evidence (Optional)</h2>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center">
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">
            Upload photos, videos, or documents
          </p>
          <label className="inline-block">
            <input
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              data-testid="input-file-upload"
            />
            <Button variant="outline" asChild>
              <span className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </span>
            </Button>
          </label>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-3 mt-4">
            <h3 className="text-sm font-medium text-foreground">Uploaded Files ({uploadedFiles.length})</h3>
            <div className="grid grid-cols-2 gap-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="relative flex items-center gap-3 p-3 bg-muted rounded-lg border"
                  data-testid={`uploaded-file-${file.id}`}
                >
                  {file.previewUrl ? (
                    <img
                      src={file.previewUrl}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted-foreground/20 rounded flex items-center justify-center">
                      <span className="text-xs text-muted-foreground uppercase">
                        {file.name.split('.').pop()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.type || 'Unknown type'}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1"
                    onClick={() => handleRemoveFile(file.id)}
                    data-testid={`button-remove-file-${file.id}`}
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderAttendance();
      case 2:
        return renderFacilities();
      case 3:
        return renderLearning();
      case 4:
        return renderVoiceNotes();
      case 5:
        return renderEvidence();
      default:
        return null;
    }
  };

  const renderNavigationButtons = () => {
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === STEPS.length - 1;
    const canProceed = validateCurrentStep();

    return (
      <div className="flex gap-4 mt-8">
        {!isFirstStep && (
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="flex-1"
            data-testid="button-previous"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
        )}
        
        {isFirstStep && (
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            data-testid="button-cancel"
          >
            Cancel
          </Button>
        )}

        {!isLastStep ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex-1 bg-primary hover:bg-primary/90"
            data-testid="button-next"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700"
            data-testid="button-submit"
          >
            {loading ? 'Submitting...' : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit Monitoring Visit
              </>
            )}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-card rounded-lg p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Monitoring Visit Form</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-testid="button-close"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {renderProgressIndicator()}

      <div className="space-y-6">
        {renderCurrentStep()}
        {renderNavigationButtons()}
      </div>
    </div>
  );
}
