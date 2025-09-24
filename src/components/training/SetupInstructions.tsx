import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Key, Mic, Volume2, AlertCircle } from 'lucide-react';

export function SetupInstructions() {
  const hasAssemblyAI = !!import.meta.env.VITE_ASSEMBLYAI_API_KEY;
  const hasElevenLabs = !!import.meta.env.VITE_ELEVENLABS_API_KEY;
  const hasGemini = !!import.meta.env.VITE_GEMINI_API_KEY;

  const allConfigured = hasAssemblyAI && hasElevenLabs && hasGemini;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Configuration Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            <span className="text-sm">AssemblyAI (Speech-to-Text)</span>
            <Badge variant={hasAssemblyAI ? "default" : "destructive"}>
              {hasAssemblyAI ? "Configured" : "Missing"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            <span className="text-sm">ElevenLabs (Text-to-Speech)</span>
            <Badge variant={hasElevenLabs ? "default" : "secondary"}>
              {hasElevenLabs ? "Configured" : "Fallback"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">🤖</span>
            <span className="text-sm">Gemini Pro 2.5 (LLM)</span>
            <Badge variant={hasGemini ? "default" : "destructive"}>
              {hasGemini ? "Configured" : "Missing"}
            </Badge>
          </div>
        </div>

        {!allConfigured && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Setup Required:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Copy <code>.env.example</code> to <code>.env</code></li>
                  <li>Add your API keys:
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                      {!hasAssemblyAI && (
                        <li>
                          <a href="https://www.assemblyai.com/" target="_blank" rel="noopener noreferrer"
                             className="text-primary hover:underline inline-flex items-center gap-1">
                            Get AssemblyAI API key <ExternalLink className="h-3 w-3" />
                          </a>
                        </li>
                      )}
                      {!hasElevenLabs && (
                        <li>
                          <a href="https://elevenlabs.io/" target="_blank" rel="noopener noreferrer"
                             className="text-primary hover:underline inline-flex items-center gap-1">
                            Get ElevenLabs API key <ExternalLink className="h-3 w-3" />
                          </a> (optional - will use browser TTS as fallback)
                        </li>
                      )}
                      {!hasGemini && (
                        <li>
                          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
                             className="text-primary hover:underline inline-flex items-center gap-1">
                            Get Gemini API key <ExternalLink className="h-3 w-3" />
                          </a>
                        </li>
                      )}
                    </ul>
                  </li>
                  <li>Restart the development server</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {allConfigured && (
          <Alert>
            <AlertDescription className="text-green-700 dark:text-green-400">
              ✅ All APIs configured! Voice training is ready to use.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
