import { useState, useRef, useCallback } from 'react';

interface VoiceRecording {
  id: string;
  audioUrl: string;
  duration: number;
}

export function useVoiceRecorder() {
  const [recordings, setRecordings] = useState<Record<string, VoiceRecording>>({});
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        return { audioBlob, audioUrl };
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, []);

  const stopRecording = useCallback(
    (recordingId: string): Promise<VoiceRecording | null> => {
      return new Promise((resolve) => {
        if (!mediaRecorderRef.current) {
          resolve(null);
          return;
        }

        const mediaRecorder = mediaRecorderRef.current;

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const recording: VoiceRecording = {
            id: recordingId,
            audioUrl,
            duration: 0,
          };
          setRecordings((prev) => ({ ...prev, [recordingId]: recording }));
          resolve(recording);
        };

        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        mediaRecorderRef.current = null;
      });
    },
    []
  );

  const playRecording = useCallback((recordingId: string) => {
    const recording = recordings[recordingId];
    if (!recording) return;

    const audio = new Audio(recording.audioUrl);
    audio.play().catch((error) => {
      console.error('Failed to play recording:', error);
    });
  }, [recordings]);

  const deleteRecording = useCallback((recordingId: string) => {
    const recording = recordings[recordingId];
    if (recording) {
      URL.revokeObjectURL(recording.audioUrl);
    }
    setRecordings((prev) => {
      const updated = { ...prev };
      delete updated[recordingId];
      return updated;
    });
  }, [recordings]);

  const hasRecording = useCallback((recordingId: string) => {
    return !!recordings[recordingId];
  }, [recordings]);

  return {
    recordings,
    startRecording,
    stopRecording,
    playRecording,
    deleteRecording,
    hasRecording,
  };
}
