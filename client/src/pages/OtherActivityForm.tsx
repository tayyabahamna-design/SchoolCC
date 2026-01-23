import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, CheckCircle2, Check, Upload, X } from 'lucide-react';
import { useActivities, OtherActivityData, OTHER_ACTIVITIES_LIST } from '@/contexts/activities';
import { toast } from 'sonner';
import { VoiceRecorder } from '@/components/VoiceRecorder';

const STEPS = [
  { id: 0, label: 'Activity Type' },
  { id: 1, label: 'Activity Details' },
  { id: 2, label: 'Description' },
  { id: 3, label: 'Evidence (Optional)' },
];

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  file: File;
  previewUrl?: string;
}

interface Props {
  onClose?: () => void;
}

export default function OtherActivityForm({ onClose }: Props) {
  const { user } = useAuth();
  const { addOtherActivity } = useActivities();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<OtherActivityData>>({
    aeoId: user?.id || '',
    aeoName: user?.name || '',
    activityDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    evidence: [],
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [voiceNoteTranscription, setVoiceNoteTranscription] = useState<string>('');
  const [voiceNoteBlob, setVoiceNoteBlob] = useState<Blob | null>(null);

  const handleVoiceNoteComplete = (transcription: string, audioBlob: Blob) => {
    setVoiceNoteTranscription(transcription);
    setVoiceNoteBlob(audioBlob);
    handleInputChange('voiceNotes', transcription);
  };

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

  const validateCurrentStep = (): boolean => {
    if (currentStep === 0) {
      return !!formData.activityType;
    }
    if (currentStep === 1) {
      return !!formData.activityDate;
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
    if (isSubmittingRef.current) {
      console.log('[OtherActivityForm] Blocked duplicate submission - ref already true');
      return;
    }
    if (isSubmitting) {
      console.log('[OtherActivityForm] Blocked duplicate submission - state already true');
      return;
    }
    
    // Set ref FIRST (synchronous) to block subsequent clicks before any async operation
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setLoading(true);
    
    try {
      const { id: _, ...dataWithoutId } = formData;
      const evidence = uploadedFiles.map((f) => ({
        id: f.id,
        name: f.name,
        type: f.type.startsWith('image/') ? 'photo' as const : 'document' as const,
        url: f.previewUrl || f.name,
      }));

      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const activity: OtherActivityData = {
        ...(dataWithoutId as OtherActivityData),
        id: `other-${Date.now()}`,
        aeoId: formData.aeoId || user?.id || '',
        aeoName: formData.aeoName || user?.name || '',
        activityType: formData.activityType || 'other',
        activityDate: formData.activityDate || now.toISOString().split('T')[0],
        startTime: formData.startTime || currentTime,
        endTime: formData.endTime || currentTime,
        evidence,
        status: 'submitted',
        submittedAt: new Date(),
      };
      await addOtherActivity(activity);
      toast.success('Activity logged successfully!');
      onClose?.();
    } catch (error) {
      console.error('Error submitting activity:', error);
      toast.error('Failed to submit activity');
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
      setIsSubmitting(false);
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

  const renderActivityType = () => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Activity Type</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Select the type of activity you are logging
      </p>

      <select
        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        value={formData.activityType || ''}
        onChange={(e) => handleInputChange('activityType', e.target.value)}
        required
        data-testid="select-activity-type"
      >
        <option value="">Choose an activity...</option>
        {OTHER_ACTIVITIES_LIST.map((activity) => (
          <option key={activity} value={activity}>
            {activity}
          </option>
        ))}
      </select>
    </Card>
  );

  const renderActivityDetails = () => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Activity Details</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Activity Date <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={formData.activityDate || ''}
            onChange={(e) => handleInputChange('activityDate', e.target.value)}
            required
            data-testid="input-activity-date"
            className="cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Duration - From</label>
          <Input
            type="time"
            value={formData.startTime || ''}
            onChange={(e) => handleInputChange('startTime', e.target.value)}
            data-testid="input-start-time"
            className="cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Duration - To</label>
          <Input
            type="time"
            value={formData.endTime || ''}
            onChange={(e) => handleInputChange('endTime', e.target.value)}
            data-testid="input-end-time"
            className="cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
        </div>
      </div>
    </Card>
  );

  const renderDescription = () => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Description</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-muted-foreground mb-2">Activity Description</label>
        <textarea
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-20"
          placeholder="Describe the activity, key topics covered, participants involved, etc."
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          data-testid="textarea-description"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-muted-foreground mb-2">Additional Comments</label>
        <textarea
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-20"
          placeholder="Any additional notes or observations..."
          value={formData.comments || ''}
          onChange={(e) => handleInputChange('comments', e.target.value)}
          data-testid="textarea-comments"
        />
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Voice Notes (Optional)</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Record your observations. Voice notes will be transcribed automatically using AI.
        </p>
        <VoiceRecorder onTranscriptionComplete={handleVoiceNoteComplete} />
        
        {voiceNoteTranscription && (
          <div className="mt-4 p-4 bg-muted rounded-lg border">
            <h4 className="text-sm font-medium text-foreground mb-2">Transcribed Voice Note</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{voiceNoteTranscription}</p>
          </div>
        )}
      </div>
    </Card>
  );

  const renderEvidence = () => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Evidence (Optional)</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Attach photos, videos, or documents as evidence
      </p>

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
        return renderActivityType();
      case 1:
        return renderActivityDetails();
      case 2:
        return renderDescription();
      case 3:
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
            onClick={(e) => {
              if (isSubmittingRef.current || isSubmitting) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              handleSubmit();
            }}
            disabled={loading || isSubmitting}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            data-testid="button-submit"
            style={isSubmitting ? { pointerEvents: 'none', opacity: 0.7 } : undefined}
          >
            {loading || isSubmitting ? 'Submitting...' : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit
              </>
            )}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-card rounded-lg p-6 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Log Other Activity</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-testid="button-back"
        >
          ✕
        </Button>
      </div>

      {/* Progress Indicator */}
      {renderProgressIndicator()}

      {/* Current Step Content */}
      {renderCurrentStep()}

      {/* Navigation Buttons */}
      {renderNavigationButtons()}
    </div>
  );
}
