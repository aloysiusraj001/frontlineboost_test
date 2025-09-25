import { useState, useCallback, useRef } from 'react';
import { speechService } from '@/services/speechService';
import { llmService } from '@/services/llmService';
import { ttsService } from '@/services/ttsService';
import { toast } from '@/components/ui/sonner';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface PersonaContext {
  name: string;
  role: string;
  mood: string;
  intensity: number;
  scenario: string;
  background: string;
}

export function useVoiceTraining(personaContext: PersonaContext) {
  // State for UI and conversation
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);

  // Streaming states
  const [partialTranscript, setPartialTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [llmStreamingOutput, setLLMStreamingOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [llmAborted, setLLMAborted] = useState(false);

  // Refs for logic and control between calls
  const conversationRef = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const llmTriggered = useRef(false);
  const llmAbortControllerRef = useRef<AbortController | null>(null);
  const llmCache = useRef(new Map<string, string>());
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Streaming partial transcript triggers LLM if content length is sufficient
  const handlePartial = useCallback((text: string) => {
    setPartialTranscript(text);

    // Trigger LLM once, for meaningful transcript, if not already triggered
    if (!llmTriggered.current && text.trim().length > 20) {
      llmTriggered.current = true;
      setIsProcessing(true);
      setLLMStreamingOutput('');
      setLLMAborted(false);

      // Debounce rapid input (350ms)
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(() => {
        const cacheKey = JSON.stringify({
          utterance: text,
          personaContext,
          history: conversationRef.current
        });

        // Return cached result if present
        if (llmCache.current.has(cacheKey)) {
          setLLMStreamingOutput(llmCache.current.get(cacheKey) || '');
          setIsProcessing(false);
          return;
        }

        const abortController = new AbortController();
        llmAbortControllerRef.current = abortController;

        llmService
          .generatePersonaResponseStream(
            text,
            personaContext,
            conversationRef.current,
            (chunk: string) => {
              setLLMStreamingOutput((prev) => prev + chunk);
              // Optionally update cache progressively
              llmCache.current.set(cacheKey, (llmCache.current.get(cacheKey) || '') + chunk);
            },
            abortController.signal
          )
          .then(() => {
            setIsProcessing(false);
          })
          .catch(() => {
            setError('LLM streaming error');
            setIsProcessing(false);
          });
      }, 350);
    }
  }, [personaContext]);

  // Final transcript callback
  const handleFinal = useCallback((text: string) => {
    setFinalTranscript(text);
    setPartialTranscript('');
  }, []);

  // Main recording logic
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setIsRecording(true);
      setPartialTranscript('');
      setFinalTranscript('');
      setLLMStreamingOutput('');
      setLLMAborted(false);
      llmTriggered.current = false;

      speechService.partialCallback = handlePartial;
      speechService.finalCallback = handleFinal;
      await speechService.startRecording();
      toast.success('Recording started - speak now!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start recording');
      setIsRecording(false);
      toast.error('Failed to start recording');
    }
  }, [handlePartial, handleFinal]);

  // Stop logic - cleanup
  const stopRecording = useCallback(async () => {
    if (!isRecording) return;
    setIsRecording(false);
    speechService.stopRecording();
    setIsProcessing(false);
    setPartialTranscript('');
    setFinalTranscript('');
    // LLM already triggered during partial transcript
  }, [isRecording]);

  // Cancel LLM
  const abortLLM = useCallback(() => {
    if (llmAbortControllerRef.current) {
      llmAbortControllerRef.current.abort();
      setLLMAborted(true);
      setIsProcessing(false);
      setLLMStreamingOutput('');
      llmAbortControllerRef.current = null;
    }
  }, []);

  // Reset whole session and conversation
  const resetConversation = useCallback(() => {
    setConversation([]);
    conversationRef.current = [];
    setError(null);
    setPartialTranscript('');
    setFinalTranscript('');
    setLLMStreamingOutput('');
    setLLMAborted(false);
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    llmTriggered.current = false;
    ttsService.stopSpeech();
    setIsSpeaking(false);
    llmCache.current.clear();
  }, []);

  // Stop TTS playback
  const stopSpeech = useCallback(() => {
    ttsService.stopSpeech();
    setIsSpeaking(false);
  }, []);

  return {
    isRecording,
    isProcessing,
    isSpeaking,
    conversation,
    partialTranscript,      // Live partial transcript for display
    finalTranscript,        // Final transcript after phrase is done
    llmStreamingOutput,     // Live LLM output for progressive UI
    llmAborted,             // For cancellation feedback
    error,
    startRecording,
    stopRecording,
    abortLLM,               // Call this to cancel LLM calls
    resetConversation,
    stopSpeech,
  };
}
