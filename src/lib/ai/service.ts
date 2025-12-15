import { ENV } from "@/config/env";
import OpenAI from "openai";

const openai = ENV.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: ENV.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    })
  : null;

export interface AIChatResponse {
  message: string;
  suggestions?: string[];
  relatedDuas?: any[];
}

export class EnhancedAIService {
  static async askGeneralQuestion(question: string): Promise<AIChatResponse> {
    if (!openai) {
      return {
        message:
          "AI assistant is not available. Please configure OpenAI API key.",
        suggestions: ["Configure API key to enable AI features"],
      };
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a helpful AI assistant specialized in Islam, spirituality, and character development.
            
**Guidelines:**
1. **Strictly Islamic Context**: Answer ONLY questions related to Islam, Quran, Hadith, Duas, spirituality, good character (Akhlaq), and daily challenges in this app.
2. **Refusal Policy**: If a user asks a question COMPLETELY unrelated to these topics (e.g., "how to fix a car", "politics", "movies"), politely decline by saying: "I can only help with questions related to Islam, spirituality, and your spiritual journey."
3. **References**: Provide references from Quran (Surah:Verse) or authentic Hadith (Bukhari, Muslim, etc.) whenever possible. **ALWAYS** provide a clickable markdown link to a reliable source.
   - Example Quran: \`[Quran 2:153](https://quran.com/2/153)\`
   - Example Hadith: \`[Bukhari 1](https://sunnah.com/bukhari:1)\`
4. **Formatting**: Use markdown (**bold**, *italic*, lists) for better readability.`,
          },
          {
            role: "user",
            content: question,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const response =
        completion.choices[0]?.message?.content ||
        "I apologize, but I could not generate a response.";

      return {
        message: response,
        suggestions: [
          "Ask me anything else",
          "Need help with something specific?",
        ],
      };
    } catch (error: any) {
      const { apiLogger } = await import("@/lib/logger");
      apiLogger.error("AI general question failed", {
        question,
        error: error.message,
      });
      const errorMessage = EnhancedAIService.getErrorMessage(error);
      return {
        message: errorMessage,
        suggestions: ["Try rephrasing your question"],
      };
    }
  }

  static async askIslamicQuestionWithMCP(
    question: string,
    userId: string,
    conversationHistory: Array<{ role: string; content: string }> = []
  ): Promise<AIChatResponse> {
    if (!openai) {
      return {
        message:
          "AI assistant is not available. Please configure OpenAI API key.",
        suggestions: ["Configure API key to enable AI features"],
      };
    }

    try {
      const { EnhancedMCPServer } = await import("@/lib/mcp/server");
      const mcpServer = new EnhancedMCPServer(userId);
      const availableFunctions = mcpServer.getAvailableFunctions();

      const messages: any[] = [
        {
          role: "system",
          content: `You are a knowledgeable Islamic scholar and assistant with direct access to the user's Islamic app database through MCP (Model Context Protocol) functions.

**STRICT MODE: ISLAMIC & APP CONTEXT ONLY**
You must ONLY answer questions related to:
1. Islam, Quran, Hadith, Fiqh, Spirituality
2. The user's progress, streaks, stats in this app
3. Duas, prayers, and challenges contained in this app

**Refusal Policy:**
If the user asks about **COMPLETELY** unrelated topics (e.g., sports, coding, cooking, general news), YOU MUST REFUSE politely.
- ALLOWED: "Tell me a hadith about patience", "What does Quran say about parents?"
- REFUSED: "Who won the match?", "How to bake a cake?"
Example refusal: "I apologize, but I interpret questions within the context of Islam and your spiritual journey only."

**Your Capabilities:**
You have real-time access to:
- User's challenge progress and statistics
- Complete duas database with categories and translations
- User's activity tracking and streaks
- Challenge templates and details

**How to Use MCP Functions:**
1. ALWAYS start by calling 'get_database_schema' to understand available data
2. Use specific query functions to get the exact information needed
3. Combine multiple function calls when needed for comprehensive answers
4. Use the data from function calls to provide personalized, accurate responses

**Available Functions:**
${availableFunctions.map((f) => `- ${f.name}: ${f.description}`).join("\n")}

**Response Guidelines:**
- **CITATIONS**: If the data includes a 'reference' field (e.g. from challenges), YOU MUST CITE IT. If asking about general Islamic rulings, provide standard references (Quran Surah:Verse, Hadith Book).
- **LINKS**: ALWAYS provide clickable markdown links for external references. THIS IS CRITICAL.
  - Quran: \`[Quran S:V](https://quran.com/S/V)\`
  - Sunnah: \`[Book Number](https://sunnah.com/book:number)\`
- Always base answers on actual user data from the database
- Format responses using markdown for readability (**bold**, *italic*, # headers, - lists, > quotes)
- When showing duas, include Arabic text, Bengali translation, and benefits
- Provide specific statistics with exact numbers from the database
- Be encouraging about user progress and offer actionable suggestions
- If data shows gaps or issues, offer helpful advice

**Language:**
- Use Bengali for dua titles and translations when available
- Use English for explanations and guidance
- Always show Arabic text for duas and prayers

Remember: You're not guessing - you have direct access to their actual data. Use it!`,
        },
      ];

      messages.push(...conversationHistory.slice(-4));
      messages.push({
        role: "user",
        content: question,
      });

      let completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        tools: availableFunctions.map((f) => ({
          type: "function" as const,
          function: {
            name: f.name,
            description: f.description,
            parameters: {
              type: "object",
              properties: f.parameters || {},
              required: [],
            },
          },
        })),
        tool_choice: "auto",
        max_tokens: 800,
        temperature: 0.7,
      });

      let responseMessage = completion.choices[0]?.message;
      let functionCallCount = 0;
      const maxFunctionCalls = 5;

      while (
        responseMessage?.tool_calls &&
        functionCallCount < maxFunctionCalls
      ) {
        functionCallCount++;
        const toolCalls = responseMessage.tool_calls;

        messages.push(responseMessage);

        for (const toolCall of toolCalls) {
          try {
            if (toolCall.type === "function") {
              const functionName = (toolCall as any).function.name;
              const functionArgs = JSON.parse(
                (toolCall as any).function.arguments || "{}"
              );

              console.log(
                `[AI-MCP] Calling function: ${functionName}`,
                functionArgs
              );

              const result = await mcpServer.executeFunction(
                functionName,
                functionArgs
              );

              console.log(`[AI-MCP] Function result:`, result);

              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(result),
              });
            }
          } catch (error: any) {
            const { apiLogger } = await import("@/lib/logger");
            apiLogger.error("MCP function execution failed", {
              functionName: (toolCall as any).function.name,
              error: error.message,
            });
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({ error: "Function execution failed" }),
            });
          }
        }

        completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages,
          tools: availableFunctions.map((f) => ({
            type: "function" as const,
            function: {
              name: f.name,
              description: f.description,
              parameters: {
                type: "object",
                properties: f.parameters || {},
                required: [],
              },
            },
          })),
          tool_choice: "auto",
          max_tokens: 800,
          temperature: 0.7,
        });

        responseMessage = completion.choices[0]?.message;
      }

      const finalResponse =
        responseMessage?.content ||
        "I apologize, but I could not generate a response.";

      return {
        message: finalResponse,
        suggestions: EnhancedAIService.generateSuggestions(question),
      };
    } catch (error: any) {
      const { apiLogger } = await import("@/lib/logger");
      apiLogger.error("AI Islamic question failed", {
        question,
        userId,
        error: error.message,
      });
      const errorMessage = EnhancedAIService.getErrorMessage(error);
      return {
        message: errorMessage,
        suggestions: [
          "Try rephrasing your question",
          "Ask about your challenges or progress",
        ],
      };
    }
  }

  private static generateSuggestions(question: string): string[] {
    const suggestions = [
      "Show me my challenge progress",
      "What duas should I recite today?",
      "How are my streaks doing?",
      "What challenges need my attention?",
      "Show me important duas",
      "Analyze my completion trends",
    ];

    return suggestions
      .filter(
        (s) => !s.toLowerCase().includes(question.toLowerCase().split(" ")[0])
      )
      .slice(0, 3);
  }

  private static getErrorMessage(error: any): string {
    if (error?.error?.code === "insufficient_quota") {
      return "⚠️ AI service quota exceeded. Please try again later or contact support.";
    }
    if (error?.error?.code === "rate_limit_exceeded") {
      return "⚠️ Too many requests. Please wait a moment and try again.";
    }
    if (error?.error?.code === "invalid_api_key") {
      return "⚠️ AI service configuration error. Please contact support.";
    }
    if (error?.error?.type === "server_error") {
      return "⚠️ AI service is temporarily unavailable. Please try again in a few minutes.";
    }
    return "⚠️ I encountered an error while processing your request. Please try again.";
  }
}
