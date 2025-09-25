// src/services/speechService.ts

export class SpeechService {
  private ws: WebSocket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private transcript: string = "";
  private readonly ASSEMBLYAI_WS_URL = 'wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000';
  private readonly apiKey: string;
  public partialCallback: ((text: string) => void) | null = null;
  public finalCallback: ((text: string) => void) | null = null;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('AssemblyAI API key required');
    this.apiKey = apiKey;
  }

  // Fetch a real-time JWT token from AssemblyAI
  async acquireRealtimeToken(): Promise<string> {
    const response = await fetch('https://api.assemblyai.com/v2/realtime/token', {
      method: 'POST',
      headers: { 'authorization': this.apiKey }
    });
    if (!response.ok) throw new Error('Failed to acquire AssemblyAI real-time token');
    const { token } = await response.json();
    return token;
  }

  async startRecording(): Promise<void> {
    this.cleanup();

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      throw new Error('Microphone access denied or unavailable');
    }

    // Always acquire a new JWT token for real-time websocket
    const token = await this.acquireRealtimeToken();

    // Connect to AssemblyAI real-time websocket
    this.ws = new WebSocket(
      `${this.ASSEMBLYAI_WS_URL}&token=${token}`
    );

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.message_type === 'PartialTranscript' && this.partialCallback) {
          this.partialCallback(msg.text || '');
        } else if (msg.message_type === 'FinalTranscript') {
          this.transcript += (msg.text || "") + " ";
          if (this.finalCallback) {
            this.finalCallback(this.transcript.trim());
          }
        }
      } catch {
        // Ignore malformed message
      }
    };

    this.ws.onopen = () => {
      try {
        this.mediaRecorder = new MediaRecorder(this.stream as MediaStream, {
          mimeType: 'audio/webm;codecs=opus'
        });

        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
          if (event.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
            event.data.arrayBuffer().then(buffer => {
              this.ws?.send(buffer);
            });
          }
        };

        this.mediaRecorder.start(250);
      } catch {
        throw new Error('Unable to start MediaRecorder');
      }
    };

    this.ws.onerror = (event) => {
      if (this.finalCallback) {
        this.finalCallback('ASR WebSocket error. Please retry.');
      }
      this.cleanup();
    };
  }

  stopRecording(): void {
    try {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.ondataavailable = null;
        this.mediaRecorder.stop();
      }
    } catch {
      // Ignore
    }
    this.cleanup();
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  private cleanup(): void {
    if (this.stream) {
      try { this.stream.getTracks().forEach(track => track.stop()); } catch {}
      this.stream = null;
    }
    if (this.ws) {
      try {
        this.ws.onmessage = null;
        this.ws.onopen = null;
        this.ws.onerror = null;
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    if (this.mediaRecorder) {
      try {
        this.mediaRecorder.ondataavailable = null;
        this.mediaRecorder.onstop = null;
        if (this.mediaRecorder.state !== "inactive") {
          this.mediaRecorder.stop();
        }
      } catch {}
      this.mediaRecorder = null;
    }
    this.transcript = "";
  }
}

// --- Singleton Export ---
const apiKey = import.meta.env.VITE_ASSEMBLYAI_API_KEY || "YOUR_API_KEY";
export const speechService = new SpeechService(apiKey);
// Assign partialCallback and finalCallback before calling startRecording()
