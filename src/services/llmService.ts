// If using Node.js < v18, uncomment the next line
// import fetch from 'node-fetch';

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
// Always type guard before using .content or .parts
function toGeminiMessages(
  history: Array<GeminiMessage | { role: string; content?: string; parts?: { text: string }[] }>
): GeminiMessage[] {
  return history.map((m) => {
    if ('parts' in m && Array.isArray(m.parts)) {
      // Already Gemini format, may be 'assistant' or 'model'
      return {
        role: m.role === "assistant" ? "model" : m.role === "model" ? "model" : "user",
        parts: m.parts,
      };
    } else if ('content' in m && typeof m.content === "string") {
      // Legacy format with content
      return {
        role: m.role === "assistant" ? "model" : m.role === "model" ? "model" : "user",
        parts: [{ text: m.content }],
      };
    } else {
      // Fallback: use empty text
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
      throw new Error('Gemini API key is required');
    }
    this.apiKey = apiKey;
  }

  async generatePersonaResponse(
    studentMessage: string,
    personaContext: PersonaContext,
    conversationHistory: Array<GeminiMessage | { role: string; content?: string; parts?: { text: string }[] }>
  ): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(personaContext);

      // Gemini expects valid GeminiMessage[] only!
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
            }
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${await response.text()}`);
      }

      const data = await response.json();
      // Gemini returns output as: candidates[0].content.parts[0].text
      const content =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I need a moment to think about that.";

      return content;
    } catch (error) {
      console.error('LLM service error:', error);
      throw new Error('Failed to generate response');
    }
  }

  private buildSystemPrompt(context: PersonaContext): string {
    const intensityDescriptions = {
      0: 'mildly annoyed but still reasonable',
      1: 'noticeably frustrated and impatient',
      2: 'quite angry and demanding immediate action',
      3: 'extremely upset and potentially hostile',
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
