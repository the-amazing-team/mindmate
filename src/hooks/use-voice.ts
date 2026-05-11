import { useCallback, useEffect, useRef, useState } from "react";

interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  supported: boolean;
  amplitude: number;
}

interface UseVoiceOptions {
  onTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
}

export function useVoice({ onTranscript, onFinalTranscript }: UseVoiceOptions = {}) {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    transcript: "",
    supported: typeof window !== "undefined" && "webkitSpeechRecognition" in window,
    amplitude: 0,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    synthRef.current = window.speechSynthesis;
    return () => {
      recognitionRef.current?.stop();
      synthRef.current?.cancel();
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const startListening = useCallback(() => {
    if (!state.supported) return;

    const SpeechRecognition =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setState((prev) => ({ ...prev, isListening: true, transcript: "" }));
      animatePulse();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      const current = final || interim;
      setState((prev) => ({ ...prev, transcript: current }));
      onTranscript?.(current);

      if (final) {
        onFinalTranscript?.(final);
      }
    };

    recognition.onerror = () => {
      setState((prev) => ({ ...prev, isListening: false, transcript: "" }));
      cancelAnimationFrame(animFrameRef.current);
    };

    recognition.onend = () => {
      setState((prev) => ({ ...prev, isListening: false, amplitude: 0 }));
      cancelAnimationFrame(animFrameRef.current);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [state.supported, onTranscript, onFinalTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState((prev) => ({ ...prev, isListening: false, amplitude: 0 }));
    cancelAnimationFrame(animFrameRef.current);
  }, []);

  const speak = useCallback(
    (text: string, opts?: { rate?: number; pitch?: number; volume?: number }) => {
      if (!synthRef.current) return;
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = opts?.rate ?? 0.88; // Slightly slower = calmer
      utterance.pitch = opts?.pitch ?? 0.95;
      utterance.volume = opts?.volume ?? 0.9;

      // Pick the warmest available voice
      const voices = synthRef.current.getVoices();
      const preferred = voices.find(
        (v) =>
          v.name.includes("Samantha") ||
          v.name.includes("Karen") ||
          v.name.includes("Moira") ||
          v.lang === "en-GB",
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => setState((prev) => ({ ...prev, isSpeaking: true }));
      utterance.onend = () => setState((prev) => ({ ...prev, isSpeaking: false }));

      synthRef.current.speak(utterance);
    },
    [],
  );

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setState((prev) => ({ ...prev, isSpeaking: false }));
  }, []);

  function animatePulse() {
    const animate = () => {
      setState((prev) => ({
        ...prev,
        amplitude: 0.3 + Math.random() * 0.7,
      }));
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
  }

  return {
    ...state,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    toggleListening: state.isListening ? stopListening : startListening,
  };
}
