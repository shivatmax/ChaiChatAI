import React, { useState, useRef } from 'react';
import { Mic, Disc2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { useToast } from '../hooks/use-toast';

interface AudioTranscriberProps {
  onTranscriptionComplete: (text: string) => void;
  isDisabled: boolean;
}

const AudioTranscriber: React.FC<AudioTranscriberProps> = ({
  onTranscriptionComplete,
  isDisabled,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/wav',
        });

        try {
          const formData = new FormData();
          formData.append('audio', audioBlob);

          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Transcription failed');
          }

          const data = await response.json();
          if (data.text) {
            onTranscriptionComplete(data.text);
          }
        } catch (error) {
          console.error('Error transcribing audio:', error);
          toast({
            title: 'Transcription Error',
            description: 'Failed to transcribe audio. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Microphone Error',
        description: 'Failed to access microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: isDisabled ? 1 : 1.1 }}
      whileTap={{ scale: isDisabled ? 1 : 0.9 }}
    >
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        variant="outline"
        size="icon"
        className={`rounded-xl bg-white/80 hover:bg-white border-blue-200 w-8 h-8 sm:w-12 sm:h-12 transition-all duration-300 ${
          isRecording ? 'bg-red-100 hover:bg-red-200' : ''
        }`}
        disabled={isDisabled || isProcessing}
      >
        {isProcessing ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="h-4 w-4 sm:h-6 sm:w-6 text-blue-500 filter-glow" />
          </motion.div>
        ) : isRecording ? (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              color: ['#ef4444', '#dc2626', '#ef4444'],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Disc2 className="h-4 w-4 sm:h-6 sm:w-6 text-red-500 filter-glow" />
          </motion.div>
        ) : (
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Mic className="h-4 w-4 sm:h-6 sm:w-6 text-blue-500 filter-glow" />
          </motion.div>
        )}
      </Button>
    </motion.div>
  );
};

export default AudioTranscriber;
