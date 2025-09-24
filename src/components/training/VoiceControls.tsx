import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Square, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onReset: () => void;
  onStopSpeech: () => void;
  disabled?: boolean;
}

export function VoiceControls({
  isRecording,
  isProcessing,
  isSpeaking,
  onStartRecording,
  onStopRecording,
  onReset,
  onStopSpeech,
  disabled = false
}: VoiceControlsProps) {
  const getRecordingButtonText = () => {
    if (isProcessing) return 'Processing...';
    if (isRecording) return 'Stop Recording';
    return 'Start Speaking';
  };

  const getStatusBadge = () => {
    if (isProcessing) return <Badge variant="secondary">Processing</Badge>;
    if (isSpeaking) return <Badge className="bg-blue-500">AI Speaking</Badge>;
    if (isRecording) return <Badge className="bg-red-500 animate-pulse">Recording</Badge>;
    return <Badge variant="outline">Ready</Badge>;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg border">
      <div className="flex items-center gap-2">
        {getStatusBadge()}
      </div>

      <div className="flex items-center gap-3">
        {/* Main Recording Button */}
        <Button
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={disabled || isProcessing || isSpeaking}
          className={cn(
            "min-w-[140px]",
            isRecording && "animate-pulse"
          )}
        >
          {isRecording ? (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              {getRecordingButtonText()}
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              {getRecordingButtonText()}
            </>
          )}
        </Button>

        {/* Stop Speech Button */}
        {isSpeaking && (
          <Button
            size="lg"
            variant="outline"
            onClick={onStopSpeech}
            className="border-blue-500/20 hover:border-blue-500/40"
          >
            <VolumeX className="h-4 w-4 mr-2" />
            Stop AI
          </Button>
        )}

        {/* Reset Button */}
        <Button
          size="lg"
          variant="outline"
          onClick={onReset}
          disabled={disabled || isRecording || isProcessing}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground max-w-md">
        {isRecording ? (
          <p className="text-red-600 dark:text-red-400 font-medium">
            🎤 Listening... Click "Stop Recording" when finished
          </p>
        ) : isProcessing ? (
          <p className="text-blue-600 dark:text-blue-400 font-medium">
            🤖 Processing your message...
          </p>
        ) : isSpeaking ? (
          <p className="text-blue-600 dark:text-blue-400 font-medium">
            🔊 AI is responding... Click "Stop AI" to interrupt
          </p>
        ) : (
          <p>
            Click "Start Speaking" to begin your conversation with the AI persona. 
            Speak clearly and wait for the response.
          </p>
        )}
      </div>
    </div>
  );
}