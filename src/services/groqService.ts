import { getRandomMathProblem } from "@/services/mathProblemsService.ts";

// Groq API service for chat completions
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Use Vite's environment variable syntax instead of process.env
const VITE_GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// Check if API key is available
if (!VITE_GROQ_API_KEY) {
  console.error('VITE_GROQ_API_KEY is not set in environment variables');
}

// Enhanced system prompt for the math tutor
const SYSTEM_PROMPT: Message = {
  role: 'system',
  content: `You are "Ёжик" (Hedgehog), a helpful and patient high school math teacher specializing in Russian OGE (ОГЭ) exam preparation. You explain math concepts step-by-step and adapt to the student's level. 

Key capabilities:
- Use LaTeX notation for mathematical expressions: inline math with \\(...\\) or $...$ and block math with \\[...\\] or $$...$$
- Keep responses in Russian language
- Break down complex topics into simple steps
- Answer general math questions and provide explanations
- Help students understand mathematical concepts

You can discuss any math-related topics, explain formulas, solve problems, and provide educational guidance. When students need practice problems, they will be provided automatically from our database.

Remember: You are a patient, encouraging teacher who helps students learn mathematics effectively through conversation and explanation.`
};

export async function streamChatCompletion(messages: Message[]): Promise<ReadableStream<Uint8Array> | null> {
  try {
    if (!VITE_GROQ_API_KEY) {
      throw new Error('VITE_GROQ_API_KEY is not set in environment variables');
    }
    
    const fullMessages = [SYSTEM_PROMPT, ...messages];
    
    console.log("🧪 [GroqService] Key type:", typeof VITE_GROQ_API_KEY);
    console.log("🧪 [GroqService] Key value:", VITE_GROQ_API_KEY);  // WARNING: temporary, don't expose in production!
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VITE_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: fullMessages,
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${response.status}`);
    }

    return response.body;
  } catch (error) {
    console.error('Error streaming from Groq:', error);
    return null;
  }
}

export async function getChatCompletion(messages: Message[]): Promise<string> {
  try {
    const lastUserMessage = messages[messages.length - 1]?.content.toLowerCase();

    // Check if user asked for a math problem
    if (lastUserMessage.includes('задачу')) {
      let category: string | undefined = undefined;

      if (lastUserMessage.includes('алгебр')) category = 'алгебра';
      else if (lastUserMessage.includes('арифметик')) category = 'арифметика';
      else if (lastUserMessage.includes('геометр')) category = 'геометрия';
      else if (lastUserMessage.includes('практич')) category = 'практическая математика';

      const problem = await getRandomMathProblem(category);

      if (problem) {
        const imagePart = problem.problem_image ? `🖼️ ![изображение](${problem.problem_image})\n\n` : "";
        return `Вот задача по категории *${category ?? 'Общее'}*:\n\n${imagePart}${problem.problem_text}\n\nНапиши *показать ответ* или *покажи решение*, если хочешь продолжить.`;
      }

      return "Не удалось найти задачу. Попробуй ещё раз позже.";
    }

    // Default: go to Groq
    const fullMessages = [SYSTEM_PROMPT, ...messages];
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VITE_GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: fullMessages
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Chat completion error:', error);
    return 'Произошла ошибка. Попробуй позже.';
  }
}
