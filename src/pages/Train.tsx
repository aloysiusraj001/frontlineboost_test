import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PersonaStage } from '@/components/training/PersonaStage';
import { VoiceControls } from '@/components/training/VoiceControls';
import { VoiceConversation } from '@/components/training/VoiceConversation';
import { SetupInstructions } from '@/components/training/SetupInstructions.tsx';
import { useVoiceTraining } from '@/hooks/useVoiceTraining';
import { scenarios, personas, type SessionState } from '@/data/data';
import { Clock, Square, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Train() {
  // Get first scenario by default
  const scenario = scenarios[0];
  const persona = personas.find(p => p.id === scenario.personaId) || personas[0];

  // Session state
  const [session, setSession] = useState<SessionState>({
    id: `session-${Date.now()}`,
    status: 'idle',
    timerSec: 0,
    difficulty: scenario.difficultyDefault,
    intensity: 0,
    transcript: []
  });

  // Voice training hook
  const personaContext = {
    name: persona.name,
    role: persona.role,
    mood: scenario.mood,
    intensity: session.intensity,
    scenario: scenario.description,
    background: `You are ${persona.description}`
  };

  // *** Updated destructure ***
  const {
    isRecording,
    isProcessing,
    isSpeaking,
    conversation,
    partialTranscript,
    llmStreamingOutput,        // NEW!
    abortLLM,                  // NEW!
    error: voiceError,
    startRecording,
    stopRecording,
    resetConversation,
    stopSpeech
  } = useVoiceTraining(personaContext);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (session.status === 'live') {
      interval = setInterval(() => {
        setSession(prev => ({
          ...prev,
          timerSec: prev.timerSec + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [session.status]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = () => {
    setSession(prev => ({
      ...prev,
      status: 'live',
      startedAt: new Date().toISOString()
    }));
  };

  const handleEndAndScore = () => {
    setSession(prev => ({ ...prev, status: 'ended' }));
    // Session ended - could show summary here in the future
  };

  const handleEscalate = () => {
    if (session.intensity < 3) {
      setSession(prev => ({ ...prev, intensity: (prev.intensity + 1) as 0 | 1 | 2 | 3 }));
    }
  };

  const handleReset = () => {
    setSession(prev => ({
      ...prev,
      intensity: 0,
      transcript: [],
      timerSec: 0
    }));
    resetConversation();
  };

  return (
    <div className="min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{scenario.title}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                {persona.name} •
                <Badge variant="outline" className="text-xs">
                  {scenario.mood}
                </Badge>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                {formatTimer(session.timerSec)}
              </div>

              <Select
                value={session.difficulty}
                onValueChange={(value: 'Beginner' | 'Standard' | 'Advanced') =>
                  setSession(prev => ({ ...prev, difficulty: value }))
                }
                disabled={session.status === 'live'}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              <Badge variant={
                session.status === 'live' ? 'default' :
                session.status === 'paused' ? 'secondary' : 'outline'
              }>
                {session.status === 'idle' ? 'Idle' :
                 session.status === 'live' ? 'Live' :
                 session.status === 'paused' ? 'Paused' : 'Ended'}
              </Badge>

              <Button
                variant={session.status === 'idle' ? 'default' : 'outline'}
                size="sm"
                onClick={session.status === 'idle' ? handleStartSession : handleEndAndScore}
              >
                {session.status === 'idle' ? (
                  <>
                    <Clock className="h-4 w-4 mr-1" />
                    Start Session
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4 mr-1" />
                    End Session
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* <SetupInstructions /> */}

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="col-span-8 space-y-6">
            {/* Persona Stage */}
            <PersonaStage
              persona={persona}
              mood={scenario.mood}
              intensity={session.intensity}
              onEscalate={handleEscalate}
              onReset={handleReset}
            />

            {/* Conversation Area */}
            <div className="space-y-4">
              {voiceError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{voiceError}</AlertDescription>
                </Alert>
              )}

              {/* ========= Partial Transcript Display ========= */}
              {isRecording && (
                <div className="partial-transcript p-3 rounded bg-muted mb-2 flex flex-col gap-1">
                  <strong>Live Transcript:</strong>
                  <p>{partialTranscript || "Listening..."}</p>
                  <Button size="sm" variant="ghost" onClick={stopRecording}>
                    Stop
                  </Button>
                </div>
              )}
              {/* ========= Partial LLM Response Display ========= */}
              {isProcessing && (
                <div className="partial-llm p-3 rounded bg-muted mb-2 flex flex-col gap-1">
                  <strong>AI Response:</strong>
                  <p>{llmStreamingOutput || "AI is responding..."}</p>
                  <Button size="sm" variant="ghost" onClick={abortLLM}>
                    Cancel
                  </Button>
                </div>
              )}

              <VoiceControls
                isRecording={isRecording}
                isProcessing={isProcessing}
                isSpeaking={isSpeaking}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                onReset={resetConversation}
                onStopSpeech={stopSpeech}
                disabled={session.status !== 'live'}
              />
              <VoiceConversation
                messages={conversation}
                personaName={persona.name}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-4">
            {/* Empty right column */}
          </div>
        </div>
      </div>
    </div>
  );
}
