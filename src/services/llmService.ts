// src/services/llmService.ts

interface PersonaContext {
  name: string;
  role: string;
  mood: string;
  intensity: number;
  scenario: string;
  background: string;
}

type GeminiRole = "user" | "model";

interface GeminiMessage {
  role: GeminiRole;
  parts: { text: string }[];
}

// Accepts either GeminiMessage or legacy { role, content }
function toGeminiMessages(
  history: Array<GeminiMessage | { role: string; content?: string; parts?: { text: string }[] }>
): GeminiMessage[] {
  return history.map((m) => {
    if ("parts" in m && Array.isArray(m.parts)) {
      return {
        role: m.role === "assistant" ? "model" : m.role === "model" ? "model" : "user",
        parts: m.parts,
      };
    } else if ("content" in m && typeof m.content === "string") {
      return {
        role: m.role === "assistant" ? "model" : m.role === "model" ? "model" : "user",
        parts: [{ text: m.content }],
      };
    } else {
      return {
        role: m.role === "assistant" ? "model" : m.role === "model" ? "model" : "user",
        parts: [{ text: "" }],
      };
    }
  });
}

class LLMService {
  private apiKey: string;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is required");
    }
    this.apiKey = apiKey;
  }

  /**
   * Legacy full-response call (no streaming)
   */
  async generatePersonaResponse(
    studentMessage: string,
    personaContext: PersonaContext,
    conversationHistory: Array<GeminiMessage | { role: string; content?: string; parts?: { text: string }[] }>
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(personaContext);
    const messages: GeminiMessage[] = [
      { role: "user", parts: [{ text: `${systemPrompt}\n\n${studentMessage}` }] },
      ...toGeminiMessages(conversationHistory),
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 150,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I need a moment to think about that."
    );
  }

  /**
   * Streaming Gemini response with chunk updates and abort support
   */
  async generatePersonaResponseStream(
    studentMessage: string,
    personaContext: PersonaContext,
    conversationHistory: Array<GeminiMessage | { role: string; content?: string; parts?: { text: string }[] }>,
    onChunk: (text: string) => void,
    abortSignal?: AbortSignal
  ): Promise<void> {
    const systemPrompt = this.buildSystemPrompt(personaContext);
    const messages: GeminiMessage[] = [
      { role: "user", parts: [{ text: `${systemPrompt}\n\n${studentMessage}` }] },
      ...toGeminiMessages(conversationHistory),
    ];

    // Note: Using "stream: true" for Gemini streaming API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 150,
          },
          stream: true, // Request streamed output!
        }),
        signal: abortSignal,
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${await response.text()}`);
    }

    // Read the streaming response
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No streaming body found");

    const decoder = new TextDecoder();
    let textBuffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);

      // Gemini streams line-delimited JSON
      textBuffer += chunk;
      const lines = textBuffer.split('\n');
      textBuffer = lines.pop() || ""; // Save incomplete line for next iteration

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const obj = JSON.parse(trimmed);
          const msg =
            obj.candidates?.[0]?.content?.parts?.[0]?.text ||
            obj.content?.parts?.[0]?.text ||
            "";
          if (msg) onChunk(msg);
        } catch {
          // Ignore parse errors
        }
      }
    }

    // Try to flush last chunk
    if (textBuffer.trim()) {
      try {
        const obj = JSON.parse(textBuffer);
        const msg =
          obj.candidates?.[0]?.content?.parts?.[0]?.text ||
          obj.content?.parts?.[0]?.text ||
          "";
        if (msg) onChunk(msg);
      } catch {
          //intentional
      }
    }
  }

  private buildSystemPrompt(context: PersonaContext): string {
    const intensityDescriptions = {
      0: "mildly annoyed but still reasonable",
      1: "noticeably frustrated and impatient",
      2: "quite angry and demanding immediate action",
      3: "extremely upset and potentially hostile",
    };
    return `You are ${context.name}, a ${context.role} who is currently ${context.mood.toLowerCase()} and ${intensityDescriptions[context.intensity as keyof typeof intensityDescriptions]}.

SCENARIO: ${context.scenario}
BACKGROUND: ${context.background}

PERSONALITY TRAITS:
- You are ${context.mood.toLowerCase()} about your situation
- Your emotional intensity is ${context.intensity}/3
- You want your problem resolved quickly
- You may escalate if you feel unheard or dismissed
- You can be calmed down with genuine empathy and concrete solutions

RESPONSE GUIDELINES:
- Keep responses under 50 words
- Stay in character as an upset ${context.role}
- Show your emotional state through your words
- Respond naturally to what the student says
- If they show empathy and offer solutions, gradually become more cooperative
- If they dismiss you or seem unhelpful, become more frustrated
- Use realistic, conversational language
- Don't break character or mention you're an AI

Remember: You're a real person with a real problem, not a training simulation.`;
  }
}

export const llmService = new LLMService();
