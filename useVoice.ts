import { useCallback, useRef, useState, useEffect } from 'react';

interface VoiceState {
  isSpeaking: boolean;
  isListening: boolean;
  transcript: string;
}

export function useVoice(voiceEnabled: boolean, listenEnabled: boolean) {
  const [state, setState] = useState<VoiceState>({
    isSpeaking: false,
    isListening: false,
    transcript: '',
  });
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!voiceEnabled || !synthRef.current) return;
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 0.8;
      utterance.rate = 1.1;
      utterance.volume = 1;
      const voices = synthRef.current.getVoices();
      const ukMale = voices.find(
        (v) =>
          v.lang.includes('en-GB') &&
          (v.name.includes('Male') || v.name.includes('Daniel') || v.name.includes('Google UK English Male'))
      );
      if (ukMale) utterance.voice = ukMale;
      utterance.onstart = () => setState((s) => ({ ...s, isSpeaking: true }));
      utterance.onend = () => setState((s) => ({ ...s, isSpeaking: false }));
      synthRef.current.speak(utterance);
    },
    [voiceEnabled]
  );

  const startListening = useCallback(
    (onCommand?: (cmd: string) => void) => {
      if (!listenEnabled) return;
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event: any) => {
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          }
        }
        if (final && onCommand) {
          onCommand(final.toLowerCase());
        }
        setState((s) => ({
          ...s,
          transcript: final,
          isListening: true,
        }));
      };
      recognitionRef.current.onerror = () => {
        setState((s) => ({ ...s, isListening: false }));
      };
      recognitionRef.current.onend = () => {
        setState((s) => ({ ...s, isListening: false }));
      };
      recognitionRef.current.start();
      setState((s) => ({ ...s, isListening: true }));
    },
    [listenEnabled]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setState((s) => ({ ...s, isListening: false }));
  }, []);

  return {
    ...state,
    speak,
    startListening,
    stopListening,
  };
}
