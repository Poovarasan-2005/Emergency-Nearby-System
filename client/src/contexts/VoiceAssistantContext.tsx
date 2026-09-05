import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// SpeechRecognition type polyfill
interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface VoiceAssistantContextType {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  lastResponse: string | null;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  isSpeaking: boolean;
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | undefined>(undefined);

export const VoiceAssistantProvider: React.FC<{
  children: React.ReactNode;
  onCommand?: (command: string) => void;
}> = ({ children, onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        setIsSupported(true);
        const recog = new SpeechRecognitionClass();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = 'en-US';

        recog.onresult = (event: SpeechRecognitionEventLike) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          setIsListening(false);
          if (onCommand) {
            onCommand(text);
          }
        };

        recog.onerror = () => {
          setIsListening(false);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        setRecognition(recog);
      }
    }
  }, [onCommand]);

  const speak = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setLastResponse(text);
    }
  }, []);

  const startListening = useCallback(() => {
    if (!recognition) return;
    try {
      setTranscript('');
      recognition.start();
      setIsListening(true);
    } catch {
      // already started
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (!recognition) return;
    try {
      recognition.stop();
      setIsListening(false);
    } catch {
      // already stopped
    }
  }, [recognition]);

  return (
    <VoiceAssistantContext.Provider
      value={{
        isListening,
        isSupported,
        transcript,
        lastResponse,
        startListening,
        stopListening,
        speak,
        isSpeaking,
      }}
    >
      {children}
    </VoiceAssistantContext.Provider>
  );
};

export const useVoiceAssistant = (): VoiceAssistantContextType => {
  const ctx = useContext(VoiceAssistantContext);
  if (!ctx) throw new Error('useVoiceAssistant must be used within VoiceAssistantProvider');
  return ctx;
};
