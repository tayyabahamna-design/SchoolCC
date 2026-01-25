import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, CheckCircle2, Upload, X } from 'lucide-react';
import { useActivities, OfficeVisitData } from '@/contexts/activities';
import { toast } from 'sonner';
import { analytics } from '@/lib/analytics';
import { gpsTracker } from '@/lib/gps-tracking';

const STEPS = ['Visit Details', 'Activities Completed', 'Comments', 'Evidence (Optional)'];

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

export default function OfficeVisitForm({ onClose }: Props) {
  const { user } = useAuth();
  const { addOfficeVisit } = useActivities();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<OfficeVisitData>>({
    aeoId: user?.id || '',
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

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  // GPS tracking session ID - generated once when form opens
  const sessionIdRef = useRef<string>(`session-office-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Start GPS tracking when form opens (silent tracking for AEO)
  useEffect(() => {
    if (!user?.id) return;

    const startTracking = async () => {
      try {
        await gpsTracker.startTracking(
          sessionIdRef.current,
          'visit_session',
          user.id
        );
        console.log('[OfficeVisitForm] GPS tracking started silently');
      } catch (error) {
        // Silently fail - don't show error to AEO
        console.error('[OfficeVisitForm] GPS tracking failed to start:', error);
      }
    };

    startTracking();

    // Cleanup: stop tracking when form is closed
    return () => {
      gpsTracker.stopTracking().catch(error => {
        console.error('[OfficeVisitForm] GPS tracking failed to stop:', error);
      });
    };
  }, [user?.id]);

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
      return !!formData.visitDate;
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
      console.log('[OfficeVisitForm] Blocked duplicate submission - ref already true');
      return;
    }
    if (isSubmitting) {
      console.log('[OfficeVisitForm] Blocked duplicate submission - state already true');
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
      const visit: OfficeVisitData = {
        ...(dataWithoutId as OfficeVisitData),
        id: `off-${Date.now()}`,
        aeoId: formData.aeoId || user?.id || '',
        aeoName: formData.aeoName || user?.name || '',
        markaz: user?.markaz || '',
        tehsil: user?.tehsilName || '',
        visitDate: formData.visitDate || now.toISOString().split('T')[0],
        arrivalTime: formData.arrivalTime || currentTime,
        departureTime: formData.departureTime || currentTime,
        evidence,
        status: 'submitted',
        submittedAt: new Date(),
      };
      const savedVisit = await addOfficeVisit(visit);

      // Link GPS points from session to the submitted visit
      try {
        const linkResponse = await fetch('/api/gps-tracking/link-to-visit', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            visitId: savedVisit.id,
            visitType: 'office_visit'
          })
        });

        if (linkResponse.ok) {
          const linkResult = await linkResponse.json();
          console.log(`[OfficeVisitForm] Linked ${linkResult.updatedCount} GPS points to visit`);
        }
      } catch (error) {
        // Silently fail - GPS linking is not critical
        console.error('[OfficeVisitForm] Failed to link GPS points:', error);
      }

      // Stop GPS tracking after successful submission
      await gpsTracker.stopTracking();

      analytics.visit.submitted(savedVisit.id, 'office', 'District Office');
      toast.success('Office visit submitted successfully!');
      onClose?.();
    } catch (error) {
      console.error('Error submitting office visit:', error);
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
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">
          Step {currentStep + 1} of {STEPS.length}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {STEPS.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
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
            key={index}
            className={`text-xs ${
              index === currentStep
                ? 'text-primary font-medium'
                : isStepComplete(index)
                ? 'text-green-600 font-medium'
                : 'text-muted-foreground'
            }`}
            style={{ width: `${100 / STEPS.length}%`, textAlign: 'center' }}
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );

  const renderVisitDetails = () => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Visit Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Visit Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              type="date"
              value={formData.visitDate || ''}
              onChange={(e) => handleInputChange('visitDate', e.target.value)}
              data-testid="input-visit-date"
              className="cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Arrival Time</label>
          <div className="relative">
            <Input
              type="time"
              value={formData.arrivalTime || ''}
              onChange={(e) => handleInputChange('arrivalTime', e.target.value)}
              data-testid="input-arrival-time"
              className="cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Departure Time</label>
          <div className="relative">
            <Input
              type="time"
              value={formData.departureTime || ''}
              onChange={(e) => handleInputChange('departureTime', e.target.value)}
              data-testid="input-departure-time"
              className="cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Purpose</label>
          <Input
            placeholder="e.g., Report compilation, meetings"
            value={formData.purpose || ''}
            onChange={(e) => handleInputChange('purpose', e.target.value)}
            data-testid="input-purpose"
          />
        </div>
      </div>
    </Card>
  );

  const renderActivitiesCompleted = () => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Activities Completed</h2>
      <p className="text-sm text-muted-foreground mb-4">Check the activities you completed during this office visit</p>

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
            <label htmlFor={activity.actId} className="text-sm font-medium text-foreground cursor-pointer">
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
  );

  const renderComments = () => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Comments</h2>
      <textarea
        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-24"
        placeholder="Enter any additional comments or notes..."
        value={formData.comments || ''}
        onChange={(e) => handleInputChange('comments', e.target.value)}
        data-testid="textarea-comments"
      />
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
        return renderVisitDetails();
      case 1:
        return renderActivitiesCompleted();
      case 2:
        return renderComments();
      case 3:
        return renderEvidence();
      default:
        return null;
    }
  };

  const renderNavigationButtons = () => {
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === STEPS.length - 1;

    return (
      <div className="flex gap-4 mt-6">
        {isFirstStep ? (
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            data-testid="button-cancel"
          >
            Cancel
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="flex-1"
            data-testid="button-previous"
          >
            Previous
          </Button>
        )}

        {isLastStep ? (
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
                Submit Visit
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!validateCurrentStep()}
            className="flex-1"
            data-testid="button-next"
          >
            Next
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-card rounded-lg p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Office Visit Form</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-testid="button-back"
        >
          ✕
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
