class TTSService {
  private apiKey: string;
  private voiceId: string;
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private ws: WebSocket | null = null;

  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
    this.voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Default voice

    if (!this.apiKey) {
      console.warn('ElevenLabs API key not found. TTS will be disabled.');
    }
  }

  async synthesizeSpeech(text: string): Promise<void> {
    if (!this.apiKey) {
      // Fallback to browser's built-in TTS
      return this.fallbackTTS(text);
    }

    try {
      await this.synthesizeSpeechStream(text);
    } catch (error) {
      console.error('TTS streaming error:', error);
      // Fallback to non-streaming API if WebSocket fails
      try {
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`,
          {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'Content-Type': 'application/json',
              'xi-api-key': this.apiKey,
            },
            body: JSON.stringify({
              text,
              model_id: 'eleven_monolingual_v1',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5,
                style: 0.5,
                use_speaker_boost: true,
              }
            }),
          }
        );
        if (!response.ok) throw new Error(`ElevenLabs API error: ${response.status}`);
        const audioBuffer = await response.arrayBuffer();
        await this.playAudio(audioBuffer);
      } catch (error) {
        console.error('TTS error:', error);
        this.fallbackTTS(text);
      }
    }
  }

  // ElevenLabs Streaming TTS (WebSocket)
  async synthesizeSpeechStream(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Official endpoint & protocol—check your TTS tier!
      const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}/stream`;
      this.ws = new WebSocket(wsUrl);
      let firstChunkPlayed = false;
      const audioQueue: ArrayBuffer[] = [];
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        // Authenticate & send payload to start TTS
        this.ws?.send(JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.5,
            use_speaker_boost: true,
          },
          xi_api_key: this.apiKey,
        }));
      };

      this.ws.onmessage = async (event) => {
        const audioChunk = event.data as ArrayBuffer;
        audioQueue.push(audioChunk);

        if (!firstChunkPlayed) {
          firstChunkPlayed = true;
          // Start playback as soon as first phrase/chunk arrives
          if (!this.audioContext) this.audioContext = new AudioContext();
          const buffer = await this.audioContext.decodeAudioData(audioQueue.shift()!);
          this.playBuffer(buffer);
        } else if (audioQueue.length > 0 && this.audioContext) {
          // Optionally, overlap subsequent buffers for seamless playback
          const buffer = await this.audioContext.decodeAudioData(audioQueue.shift()!);
          this.playBuffer(buffer);
        }
      };

      this.ws.onerror = (err) => {
        reject(err);
      };

      this.ws.onclose = () => {
        resolve();
      };
    });
  }

  // Plays one buffer (called multiple times for streaming mode)
  playBuffer(buffer: AudioBuffer) {
    if (!this.audioContext) return;
    this.currentSource = this.audioContext.createBufferSource();
    this.currentSource.buffer = buffer;
    this.currentSource.connect(this.audioContext.destination);
    this.currentSource.start();
  }

  // Non-stream fallback
  private async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    try {
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      const audioData = await this.audioContext.decodeAudioData(audioBuffer);
      this.playBuffer(audioData);
    } catch (error) {
      console.error('Audio playback error:', error);
      throw error;
    }
  }

  private fallbackTTS(text: string): Promise<void> {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      speechSynthesis.speak(utterance);
    });
  }

  stopSpeech(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (e) { /* Intentionally ignored */ }
      this.currentSource.disconnect();
      this.currentSource = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (e) { /* Intentionally ignored */ }
      this.audioContext = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    speechSynthesis.cancel();
  }
}

export const ttsService = new TTSService();
