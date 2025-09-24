class TTSService {
  private apiKey: string;
  private voiceId: string;
  private audioContext: AudioContext | null = null;

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
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`, {
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
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();
      await this.playAudio(audioBuffer);
    } catch (error) {
      console.error('TTS error:', error);
      // Fallback to browser TTS
      this.fallbackTTS(text);
    }
  }

  private async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    try {
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      const audioData = await this.audioContext.decodeAudioData(audioBuffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioData;
      source.connect(this.audioContext.destination);
      source.start();
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
      utterance.onerror = () => resolve(); // Still resolve to continue flow
      
      speechSynthesis.speak(utterance);
    });
  }

  stopSpeech(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    speechSynthesis.cancel();
  }
}

export const ttsService = new TTSService();