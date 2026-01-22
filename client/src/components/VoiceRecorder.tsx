import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, Trash2, RotateCcw, Languages, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcription: string, audioBlob?: Blob) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onTranscriptionComplete, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [transcribedText, setTranscribedText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [language, setLanguage] = useState<'en-US' | 'ur-PK'>('en-US');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, [audioUrl]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      finalTranscriptRef.current = '';
      setTranscribedText('');

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setTotalDuration(recordingTime);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onresult = (event: any) => {
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscriptRef.current += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          const fullText = finalTranscriptRef.current + interimTranscript;
          setTranscribedText(fullText.trim());
          setIsTranscribing(true);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error !== 'no-speech') {
            setIsTranscribing(false);
          }
        };

        recognition.onend = () => {
          setIsTranscribing(false);
          if (isRecording && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (e) {}
          }
        };

        recognition.start();
        toast.success('Recording started - speak now');
      } else {
        toast.info('Recording started (speech recognition not supported in this browser)');
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      toast.success('Recording stopped');
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordingTime(0);
    setTotalDuration(0);
    setTranscribedText('');
    finalTranscriptRef.current = '';
    toast.info('Recording deleted');
  };

  const useTranscription = () => {
    if (transcribedText.trim()) {
      onTranscriptionComplete(transcribedText.trim(), audioBlob || undefined);
      toast.success('Text added to description');
    }
  };

  return (
    <div className="space-y-3 p-4 border border-border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Mic className="w-4 h-4" />
          Voice Note / صوتی نوٹ
        </h3>
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-muted-foreground" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en-US' | 'ur-PK')}
            className="text-xs px-2 py-1 border border-border rounded bg-background text-foreground"
            disabled={isRecording || disabled}
            data-testid="select-voice-language"
          >
            <option value="en-US">English</option>
            <option value="ur-PK">اردو (Urdu)</option>
          </select>
        </div>
      </div>

      {isRecording && (
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono text-foreground">{formatTime(recordingTime)}</span>
          {isTranscribing && (
            <span className="text-xs text-muted-foreground animate-pulse ml-2">
              Listening...
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {!isRecording && !audioBlob && (
          <Button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            variant="outline"
            className="flex items-center gap-2"
            data-testid="button-start-recording"
          >
            <Mic className="w-4 h-4 text-red-500" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <Button
            type="button"
            onClick={stopRecording}
            variant="destructive"
            className="flex items-center gap-2"
            data-testid="button-stop-recording"
          >
            <Square className="w-4 h-4" />
            Stop Recording
          </Button>
        )}

        {audioBlob && !isRecording && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={playAudio}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              data-testid="button-play-pause"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button
              type="button"
              onClick={deleteRecording}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-destructive hover:text-destructive"
              data-testid="button-delete-recording"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            <Button
              type="button"
              onClick={deleteRecording}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              data-testid="button-rerecord"
            >
              <RotateCcw className="w-3 h-3" />
              Re-record
            </Button>
          </div>
        )}
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setTotalDuration(Math.floor(audioRef.current.duration));
            }
          }}
          className="hidden"
        />
      )}

      {audioBlob && (
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <Button
            type="button"
            onClick={playAudio}
            variant="ghost"
            size="icon"
            className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Voice Note Recorded</p>
            <p className="text-xs text-muted-foreground">Duration: {formatTime(totalDuration)}</p>
          </div>
        </div>
      )}

      {isRecording && (
        <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border">
          <p className="text-xs font-medium text-muted-foreground">
            Live Transcription / براہ راست نقل:
          </p>
          {transcribedText ? (
            <p className="text-sm text-foreground whitespace-pre-wrap" dir={language === 'ur-PK' ? 'rtl' : 'ltr'}>
              {transcribedText}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Speak clearly... / واضح بولیں...
            </p>
          )}
        </div>
      )}

      {audioBlob && !isRecording && (
        <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border">
          <p className="text-xs font-medium text-muted-foreground">
            Transcription / نقل:
          </p>
          {transcribedText ? (
            <>
              <p className="text-sm text-foreground whitespace-pre-wrap" dir={language === 'ur-PK' ? 'rtl' : 'ltr'}>
                {transcribedText}
              </p>
              <Button
                type="button"
                size="sm"
                onClick={useTranscription}
                className="w-full mt-2"
                data-testid="button-use-transcription"
              >
                Use This Text in Description / یہ متن استعمال کریں
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No speech detected. Try recording again with clearer speech.
              <br />
              کوئی تقریر نہیں ملی۔ واضح تقریر کے ساتھ دوبارہ ریکارڈ کریں۔
            </p>
          )}
        </div>
      )}

      {!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window) && (
        <p className="text-xs text-muted-foreground">
          Note: Speech-to-text requires Chrome or Edge browser for best results.
        </p>
      )}
    </div>
  );
}
