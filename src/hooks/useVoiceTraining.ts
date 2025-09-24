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
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const conversationRef = useRef<Array<{role: 'user' | 'assistant', content: string}>>([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setIsRecording(true);
      await speechService.startRecording();
      toast.success('Recording started - speak now!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start recording');
      setIsRecording(false);
      toast.error('Failed to start recording');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!isRecording) return;

    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      // Stop recording and get transcript
      const transcript = await speechService.stopRecording();
      
      if (!transcript.trim()) {
        toast.error('No speech detected. Please try again.');
        setIsProcessing(false);
        return;
      }

      // Add user message to conversation
      const userMessage: ConversationMessage = {
        role: 'user',
        content: transcript,
        timestamp: new Date().toISOString()
      };
      
      setConversation(prev => [...prev, userMessage]);
      conversationRef.current.push({ role: 'user', content: transcript });

      // Generate AI response
      const aiResponse = await llmService.generatePersonaResponse(
        transcript,
        personaContext,
        conversationRef.current
      );

      // Add AI response to conversation
      const aiMessage: ConversationMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };
      
      setConversation(prev => [...prev, aiMessage]);
      conversationRef.current.push({ role: 'assistant', content: aiResponse });

      // Convert to speech and play
      setIsSpeaking(true);
      await ttsService.synthesizeSpeech(aiResponse);
      setIsSpeaking(false);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
      setIsSpeaking(false);
    }
  }, [isRecording, personaContext]);

  const resetConversation = useCallback(() => {
    setConversation([]);
    conversationRef.current = [];
    setError(null);
    ttsService.stopSpeech();
    setIsSpeaking(false);
  }, []);

  const stopSpeech = useCallback(() => {
    ttsService.stopSpeech();
    setIsSpeaking(false);
  }, []);

  return {
    isRecording,
    isProcessing,
    isSpeaking,
    conversation,
    error,
    startRecording,
    stopRecording,
    resetConversation,
    stopSpeech
  };
}