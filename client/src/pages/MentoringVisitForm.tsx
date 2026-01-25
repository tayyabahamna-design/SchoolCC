import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Check, Upload, Trash2, CheckCircle2, Mic, Square, Play, Pause, X, Loader2 } from 'lucide-react';
import { useActivities, MentoringVisitData, MENTORING_AREAS } from '@/contexts/activities';
import { toast } from 'sonner';
import { realSchools } from '@/data/realData';
import { analytics } from '@/lib/analytics';
import { gpsTracker } from '@/lib/gps-tracking';

interface VoiceNoteData {
  blob: Blob;
  url: string;
  duration: number;
  transcription?: string;
}

const getAllSchools = () => realSchools.map(school => `${school.name.toUpperCase()} (${school.emisNumber})`);

const SUBJECTS = ['English', 'Urdu', 'Mathematics', 'Science', 'Social Studies', 'General'];

const STEPS = [
  { id: 0, label: 'Basic Info' },
  { id: 1, label: 'HOTS Indicators' },
  { id: 2, label: 'Feedback' },
  { id: 3, label: 'Evidence' },
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

export default function MentoringVisitForm({ onClose }: Props) {
  const { user } = useAuth();
  const { addMentoringVisit } = useActivities();
  const [location, navigate] = useLocation();

  // Detect edit mode from URL path
  const isEditMode = location.startsWith('/edit-mentoring-visit/');
  const visitId = isEditMode ? location.split('/').pop() : undefined;
  const mentoringAreas = MENTORING_AREAS;

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
  const [formData, setFormData] = useState<Partial<MentoringVisitData>>({
    aeoId: user?.id || '',
    aeoName: user?.name || '',
    visitDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    evidence: [],
    indicators: [],
  });

  const [selectedAreas, setSelectedAreas] = useState<Record<string, Record<string, 'emerging' | 'developing' | 'proficient' | null>>>({});

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [recordingField, setRecordingField] = useState<string | null>(null);
  const [voiceNotes, setVoiceNotes] = useState<Record<string, VoiceNoteData>>({});
  const [playingField, setPlayingField] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementsRef = useRef<Record<string, HTMLAudioElement>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');

  // GPS tracking session ID - generated once when form opens
  const sessionIdRef = useRef<string>(`session-ment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      Object.values(voiceNotes).forEach(note => {
        if (note.url) URL.revokeObjectURL(note.url);
      });
    };
  }, []);

  // Start GPS tracking when form opens (silent tracking for AEO) - skip in edit mode
  useEffect(() => {
    if (!user?.id || isEditMode) return;

    const startTracking = async () => {
      try {
        await gpsTracker.startTracking(
          sessionIdRef.current,
          'visit_session',
          user.id
        );
        console.log('[MentoringVisitForm] GPS tracking started silently');
      } catch (error) {
        // Silently fail - don't show error to AEO
        console.error('[MentoringVisitForm] GPS tracking failed to start:', error);
      }
    };

    startTracking();

    // Cleanup: stop tracking when form is closed
    return () => {
      gpsTracker.stopTracking().catch(error => {
        console.error('[MentoringVisitForm] GPS tracking failed to stop:', error);
      });
    };
  }, [user?.id, isEditMode]);

  // Fetch existing visit data when in edit mode
  useEffect(() => {
    if (isEditMode && visitId) {
      const fetchVisitData = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/activities/mentoring/${visitId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch visit data');
          }
          const visit = await response.json();

          // Pre-fill form with existing data
          setFormData({
            ...visit,
            visitDate: visit.visitDate || new Date().toISOString().split('T')[0],
          });

          // Set selected areas from indicators
          if (visit.indicators && Array.isArray(visit.indicators)) {
            const areas: Record<string, Record<string, 'emerging' | 'developing' | 'proficient' | null>> = {};
            visit.indicators.forEach((indicator: any) => {
              if (!areas[indicator.area]) {
                areas[indicator.area] = {};
              }
              areas[indicator.area][indicator.indicator] = indicator.level;
            });
            setSelectedAreas(areas);
          }

        } catch (error) {
          console.error('Error fetching visit:', error);
          toast.error('Failed to load visit data');
          navigate('/aeo-activity/logs');
        } finally {
          setLoading(false);
        }
      };

      fetchVisitData();
    }
  }, [isEditMode, visitId, navigate]);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        if ((recognitionRef as any).stopContinuous) {
          (recognitionRef as any).stopContinuous();
        }
        try { recognitionRef.current.abort(); } catch (e) {}
        recognitionRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      Object.values(audioElementsRef.current).forEach(audio => {
        if (audio) audio.pause();
      });
    };
  }, []);

  const startRecording = async (fieldId: string) => {
    try {
      // Stop any existing speech recognition first
      if (recognitionRef.current) {
        if ((recognitionRef as any).stopContinuous) {
          (recognitionRef as any).stopContinuous();
        }
        try { recognitionRef.current.abort(); } catch (e) {}
        recognitionRef.current = null;
      }
      
      // Clean up any existing voice note for this field before recording new one
      if (voiceNotes[fieldId]) {
        if (voiceNotes[fieldId].url) {
          URL.revokeObjectURL(voiceNotes[fieldId].url);
        }
        if (audioElementsRef.current[fieldId]) {
          audioElementsRef.current[fieldId].pause();
          delete audioElementsRef.current[fieldId];
        }
        setVoiceNotes(prev => {
          const updated = { ...prev };
          delete updated[fieldId];
          return updated;
        });
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      transcriptRef.current = '';
      setRecordingTime(0);
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      // Store the fieldId for use in onstop callback
      const currentFieldId = fieldId;
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        
        // Get the final transcription captured during recording
        const finalTranscription = transcriptRef.current.trim() || undefined;
        
        setVoiceNotes(prev => ({
          ...prev,
          [currentFieldId]: {
            blob,
            url,
            duration: recordingTime,
            transcription: finalTranscription,
          }
        }));
        
        stream.getTracks().forEach(track => track.stop());
        
        if (finalTranscription) {
          toast.success('Voice note recorded with transcription');
        } else {
          toast.success('Voice note recorded (no speech detected for transcription)');
        }
      };
      
      mediaRecorder.start();
      setRecordingField(fieldId);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start speech recognition to transcribe while recording
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        
        // Track if we should keep restarting (only while recording)
        let shouldContinue = true;
        // Accumulate all transcribed text across recognition sessions
        let accumulatedText = '';
        
        const startRecognitionSession = () => {
          if (!shouldContinue) return;
          
          const recognition = new SpeechRecognition();
          recognitionRef.current = recognition;
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          
          // Track current session's final results
          let sessionFinalText = '';
          
          recognition.onresult = (event: any) => {
            let currentSessionText = '';
            for (let i = 0; i < event.results.length; i++) {
              if (event.results[i].isFinal) {
                // Final results won't change, add to session final
                sessionFinalText = '';
                for (let j = 0; j <= i; j++) {
                  if (event.results[j].isFinal) {
                    sessionFinalText += event.results[j][0].transcript + ' ';
                  }
                }
              }
              currentSessionText += event.results[i][0].transcript + ' ';
            }
            // Update transcript with accumulated + current session text
            transcriptRef.current = (accumulatedText + currentSessionText).trim();
          };
          
          recognition.onerror = (event: any) => {
            // Don't log 'aborted' errors as they're expected when stopping
            if (event.error !== 'aborted') {
              console.error('Speech recognition error:', event.error);
            }
          };
          
          recognition.onend = () => {
            // Save final text from this session before restarting
            if (sessionFinalText) {
              accumulatedText += sessionFinalText;
            }
            
            // Only restart if we should continue (still recording)
            if (shouldContinue && recognitionRef.current) {
              // Restart immediately to not miss any speech
              startRecognitionSession();
            } else {
              recognitionRef.current = null;
            }
          };
          
          try {
            recognition.start();
          } catch (e) {
            console.error('Failed to start recognition:', e);
          }
        };
        
        // Store the stop function so stopRecording can prevent restarts
        (recognitionRef as any).stopContinuous = () => {
          shouldContinue = false;
        };
        
        startRecognitionSession();
      }
      
      toast.success('Recording started - speak now');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    // Stop speech recognition first - prevent restarts then abort
    if (recognitionRef.current) {
      // First prevent auto-restart
      if ((recognitionRef as any).stopContinuous) {
        (recognitionRef as any).stopContinuous();
      }
      try { 
        recognitionRef.current.abort(); // Use abort() for immediate stop
      } catch (e) {}
      recognitionRef.current = null;
    }
    
    if (mediaRecorderRef.current && recordingField) {
      mediaRecorderRef.current.stop();
      setRecordingField(null);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const toggleVoiceRecording = async (fieldId: string) => {
    if (recordingField === fieldId) {
      stopRecording();
    } else {
      if (recordingField) {
        stopRecording();
      }
      await startRecording(fieldId);
    }
  };

  const playVoiceNote = (fieldId: string) => {
    const voiceNote = voiceNotes[fieldId];
    if (!voiceNote) return;
    
    if (playingField === fieldId && audioElementsRef.current[fieldId]) {
      audioElementsRef.current[fieldId].pause();
      setPlayingField(null);
    } else {
      Object.keys(audioElementsRef.current).forEach(key => {
        if (audioElementsRef.current[key]) {
          audioElementsRef.current[key].pause();
        }
      });
      
      if (!audioElementsRef.current[fieldId]) {
        audioElementsRef.current[fieldId] = new Audio(voiceNote.url);
        audioElementsRef.current[fieldId].onended = () => setPlayingField(null);
      }
      
      audioElementsRef.current[fieldId].play();
      setPlayingField(fieldId);
    }
  };

  const transcribeVoiceNote = async (fieldId: string) => {
    const voiceNote = voiceNotes[fieldId];
    if (!voiceNote) return;
    
    // If transcription was captured during recording, just use it
    if (voiceNote.transcription) {
      toast.info('Transcription already available from recording');
      return;
    }
    
    // No transcription available - inform user they need to re-record
    toast.error('No transcription available. Please record again - the transcription is captured while you speak during recording.');
  };

  const useTranscription = (fieldId: string, targetField: string) => {
    const voiceNote = voiceNotes[fieldId];
    if (voiceNote?.transcription) {
      const currentValue = formData[targetField as keyof typeof formData] || '';
      handleInputChange(targetField, currentValue ? `${currentValue}\n${voiceNote.transcription}` : voiceNote.transcription);
      toast.success('Transcription added to text field');
    }
  };

  const deleteVoiceNote = (fieldId: string) => {
    const voiceNote = voiceNotes[fieldId];
    if (voiceNote?.url) {
      URL.revokeObjectURL(voiceNote.url);
    }
    if (audioElementsRef.current[fieldId]) {
      audioElementsRef.current[fieldId].pause();
      delete audioElementsRef.current[fieldId];
    }
    setVoiceNotes(prev => {
      const updated = { ...prev };
      delete updated[fieldId];
      return updated;
    });
    setRecordingField(null);
    setPlayingField(null);
    toast.info('Voice note deleted');
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
    if (isSubmittingRef.current) {
      console.log('[MentoringVisitForm] Blocked duplicate submission - ref already true');
      return;
    }
    if (isSubmitting) {
      console.log('[MentoringVisitForm] Blocked duplicate submission - state already true');
      return;
    }

    // Set ref FIRST (synchronous) to block subsequent clicks before any async operation
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setLoading(true);

    try {
      const evidence = uploadedFiles.map((f) => ({
        id: f.id,
        name: f.name,
        type: f.type.startsWith('image/') ? 'photo' as const : 'document' as const,
        url: f.previewUrl || f.name,
      }));

      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);

      if (isEditMode && visitId) {
        // UPDATE existing visit
        const visitData = {
          ...formData,
          evidence,
        };

        const response = await fetch(`/api/activities/mentoring/${visitId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(visitData),
        });

        if (!response.ok) {
          throw new Error('Failed to update visit');
        }

        const updatedVisit = await response.json();
        toast.success('Mentoring visit updated successfully!');
        navigate('/aeo-activity/logs');
      } else {
        // CREATE new visit
        const visit: MentoringVisitData = {
          id: `ment-${Date.now()}`,
          aeoId: formData.aeoId || user?.id || '',
          schoolId: formData.schoolId || '',
          aeoName: formData.aeoName || user?.name || '',
          schoolName: formData.schoolName || '',
          markaz: user?.markaz || formData.markaz || '',
          tehsil: user?.tehsilName || formData.tehsil || '',
          visitDate: formData.visitDate || now.toISOString().split('T')[0],
          arrivalTime: formData.arrivalTime || currentTime,
          departureTime: formData.departureTime || currentTime,
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
        const savedVisit = await addMentoringVisit(visit);

        // Link GPS points from session to the submitted visit
        try {
          const linkResponse = await fetch('/api/gps-tracking/link-to-visit', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sessionIdRef.current,
              visitId: savedVisit.id,
              visitType: 'mentoring_visit'
            })
          });

          if (linkResponse.ok) {
            const linkResult = await linkResponse.json();
            console.log(`[MentoringVisitForm] Linked ${linkResult.updatedCount} GPS points to visit`);
          }
        } catch (error) {
          // Silently fail - GPS linking is not critical
          console.error('[MentoringVisitForm] Failed to link GPS points:', error);
        }

        // Stop GPS tracking after successful submission
        await gpsTracker.stopTracking();

        analytics.visit.submitted(savedVisit.id, 'mentoring', visit.schoolName || '');
        toast.success('Mentoring visit submitted successfully!');
        onClose?.();
      }
    } catch (error) {
      console.error('Error submitting mentoring visit:', error);
      toast.error(isEditMode ? 'Failed to update visit' : 'Failed to submit visit');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const getRatingColor = (rating: string | null) => {
    switch (rating) {
      case 'emerging':
        return 'bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700';
      case 'developing':
        return 'bg-yellow-100 dark:bg-yellow-900/40 border-yellow-300 dark:border-yellow-700';
      case 'proficient':
        return 'bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700';
      default:
        return 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600';
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
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            School Name <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            value={formData.schoolName || ''}
            onChange={(e) => {
              const selectedSchool = e.target.value;
              handleInputChange('schoolName', selectedSchool);
              // Extract EMIS number from school name format: "SCHOOL NAME (EMIS_NUMBER)"
              const emisMatch = selectedSchool.match(/\((\d+)\)$/);
              if (emisMatch) {
                handleInputChange('schoolId', emisMatch[1]);
              }
            }}
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
          <label className="block text-sm font-medium text-muted-foreground mb-2">Class Observed</label>
          <select
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            value={formData.classObserved || ''}
            onChange={(e) => handleInputChange('classObserved', e.target.value)}
            data-testid="select-class-observed"
          >
            <option value="">Select class...</option>
            <option value="Writing">Writing</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
              <option key={num} value={`Class ${num}`}>
                Class {num}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Teacher Name</label>
          <Input
            placeholder="Enter teacher name"
            value={formData.teacherName || ''}
            onChange={(e) => handleInputChange('teacherName', e.target.value)}
            data-testid="input-teacher-name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Subject</label>
          <select
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
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
  );

  const renderIndicators = () => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">HOTS Indicators</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Rate each indicator within every area based on your observation.
      </p>

      <div className="space-y-10">
        {mentoringAreas.map((area) => (
          <div key={area.id} className="border-b pb-8 last:border-b-0">
            <h3 className="text-base font-bold text-foreground mb-6 p-3 bg-muted rounded-lg">
              {area.name}
            </h3>

            <div className="space-y-6 ml-4">
              {area.indicators.map((indicator) => {
                const selectedRating = selectedAreas[area.id]?.[indicator.id];

                return (
                  <div key={indicator.id} className="border-l-2 border-muted-foreground/30 pl-4">
                    <h4 className="font-semibold text-foreground mb-1">{indicator.name}</h4>
                    {indicator.description && (
                      <p className="text-xs text-muted-foreground mb-3">{indicator.description}</p>
                    )}

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {['emerging', 'developing', 'proficient'].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleIndicatorRating(area.id, indicator.id, rating as any)}
                          className={`p-2 rounded-lg border-2 text-center transition-all text-sm ${
                            selectedRating === rating
                              ? getRatingColor(rating) + ' border-current font-semibold'
                              : 'bg-background border-muted-foreground/30 hover:border-muted-foreground'
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

                    {selectedRating && (
                      <div className={`p-3 rounded-lg text-sm ${getRatingColor(selectedRating)}`}>
                        <p className="text-foreground font-medium mb-1">Rubric:</p>
                        <p className="text-muted-foreground">{indicator.rubric[selectedRating]}</p>
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
  );

  const renderFeedback = () => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Feedback & Action Items</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Strengths Observed
          </label>
          <div className="flex gap-2">
            <textarea
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-20"
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
              {voiceNotes['strengths'] && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => playVoiceNote('strengths')}
                    data-testid="button-play-strengths"
                    title={playingField === 'strengths' ? 'Pause' : 'Play voice note'}
                  >
                    {playingField === 'strengths' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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
            <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-red-100 dark:bg-red-900/50 rounded w-fit text-xs">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-red-700 dark:text-red-400 font-medium">Recording... {formatTime(recordingTime)}</span>
            </div>
          )}
          {voiceNotes['strengths'] && recordingField !== 'strengths' && (
            <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-green-600 font-medium">✓ Voice note recorded ({formatTime(voiceNotes['strengths'].duration)})</span>
              </div>
              {voiceNotes['strengths'].transcription ? (
                <div className="space-y-2">
                  <p className="text-sm text-foreground bg-background p-2 rounded border">{voiceNotes['strengths'].transcription}</p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => useTranscription('strengths', 'strengthsObserved')}
                    className="text-xs h-7"
                  >
                    Use in Text Field
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No speech was detected. Re-record if you need transcription.</p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Areas for Improvement
          </label>
          <div className="flex gap-2">
            <textarea
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-20"
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
              {voiceNotes['improvements'] && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => playVoiceNote('improvements')}
                    data-testid="button-play-improvements"
                    title={playingField === 'improvements' ? 'Pause' : 'Play voice note'}
                  >
                    {playingField === 'improvements' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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
            <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-red-100 dark:bg-red-900/50 rounded w-fit text-xs">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-red-700 dark:text-red-400 font-medium">Recording... {formatTime(recordingTime)}</span>
            </div>
          )}
          {voiceNotes['improvements'] && recordingField !== 'improvements' && (
            <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-green-600 font-medium">✓ Voice note recorded ({formatTime(voiceNotes['improvements'].duration)})</span>
              </div>
              {voiceNotes['improvements'].transcription ? (
                <div className="space-y-2">
                  <p className="text-sm text-foreground bg-background p-2 rounded border">{voiceNotes['improvements'].transcription}</p>
                  <Button type="button" size="sm" onClick={() => useTranscription('improvements', 'areasForImprovement')} className="text-xs h-7">Use in Text Field</Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No speech was detected. Re-record if you need transcription.</p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Action Items
          </label>
          <div className="flex gap-2">
            <textarea
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-20"
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
              {voiceNotes['actions'] && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => playVoiceNote('actions')}
                    data-testid="button-play-actions"
                    title={playingField === 'actions' ? 'Pause' : 'Play voice note'}
                  >
                    {playingField === 'actions' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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
            <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-red-100 dark:bg-red-900/50 rounded w-fit text-xs">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-red-700 dark:text-red-400 font-medium">Recording... {formatTime(recordingTime)}</span>
            </div>
          )}
          {voiceNotes['actions'] && recordingField !== 'actions' && (
            <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-green-600 font-medium">✓ Voice note recorded ({formatTime(voiceNotes['actions'].duration)})</span>
              </div>
              {voiceNotes['actions'].transcription ? (
                <div className="space-y-2">
                  <p className="text-sm text-foreground bg-background p-2 rounded border">{voiceNotes['actions'].transcription}</p>
                  <Button type="button" size="sm" onClick={() => useTranscription('actions', 'actionItems')} className="text-xs h-7">Use in Text Field</Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No speech was detected. Re-record if you need transcription.</p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            General Feedback
          </label>
          <div className="flex gap-2">
            <textarea
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-20"
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
              {voiceNotes['feedback'] && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => playVoiceNote('feedback')}
                    data-testid="button-play-feedback"
                    title={playingField === 'feedback' ? 'Pause' : 'Play voice note'}
                  >
                    {playingField === 'feedback' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
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
            <div className="flex items-center gap-2 mt-2 px-2 py-1 bg-red-100 dark:bg-red-900/50 rounded w-fit text-xs">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-red-700 dark:text-red-400 font-medium">Recording... {formatTime(recordingTime)}</span>
            </div>
          )}
          {voiceNotes['feedback'] && recordingField !== 'feedback' && (
            <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-green-600 font-medium">✓ Voice note recorded ({formatTime(voiceNotes['feedback'].duration)})</span>
              </div>
              {voiceNotes['feedback'].transcription ? (
                <div className="space-y-2">
                  <p className="text-sm text-foreground bg-background p-2 rounded border">{voiceNotes['feedback'].transcription}</p>
                  <Button type="button" size="sm" onClick={() => useTranscription('feedback', 'generalFeedback')} className="text-xs h-7">Use in Text Field</Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No speech was detected. Re-record if you need transcription.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  const renderEvidence = () => (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Evidence (Optional)</h2>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">
            Upload images, videos, or documents as evidence
          </p>
          <label htmlFor="file-upload" className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </span>
            </Button>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              data-testid="input-file-upload"
            />
          </label>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-3 mt-4">
            {uploadedFiles.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg border border-muted-foreground/20"
                data-testid={`evidence-item-${item.id}`}
              >
                <div className="flex items-center gap-3">
                  {item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted-foreground/20 rounded flex items-center justify-center">
                      <span className="text-xs text-muted-foreground uppercase">
                        {item.type.split('/')[1]?.slice(0, 3) || 'file'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFile(item.id)}
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
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderIndicators();
      case 2:
        return renderFeedback();
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
      <div className="flex gap-4 mt-8">
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
            <ArrowLeft className="w-4 h-4 mr-2" />
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
            className="flex-1 bg-purple-600 hover:bg-purple-700"
            data-testid="button-submit"
            style={isSubmitting ? { pointerEvents: 'none', opacity: 0.7 } : undefined}
          >
            {isSubmitting ? 'Submitting...' : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Submit
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
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-card rounded-lg p-6 max-h-[90vh] overflow-y-auto">
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

      <div className="space-y-6">
        {renderProgressIndicator()}
        {renderCurrentStep()}
        {renderNavigationButtons()}
      </div>
    </div>
  );
}
