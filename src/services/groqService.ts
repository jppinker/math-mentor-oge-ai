
import { getRandomMathProblem, getMathProblemById } from "@/services/mathProblemsService";
import { supabase } from "@/integrations/supabase/client";

// Groq API service for chat completions
export interface Message {
  role: 'system' | 'user' | 'assistant'; 
  content: string;
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
    const fullMessages = [SYSTEM_PROMPT, ...messages];

    const { data, error } = await supabase.functions.invoke('groq-chat', {
      body: { messages: fullMessages, stream: true }
    });

    if (error) {
      console.error('Groq function error:', error);
      throw new Error(`Groq function error: ${error.message}`);
    }

    // The response should be a stream
    return data;
  } catch (error) {
    console.error('Error streaming from Groq:', error);
    return null;
  }
}

function extractLastQuestionId(messages: Message[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const match = messages[i].content.match(/ID задачи: ([\w-]+)/);
    if (match) return match[1];
  }
  return null;
}

export async function getChatCompletion(messages: Message[]): Promise<string> {
  try {
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase();

    // Step 1: Handle follow-up (answer/solution/details)
    if (lastMessage.includes('показать ответ') || lastMessage.includes('покажи решение') || lastMessage.includes('не понял')) {
      const questionId = extractLastQuestionId(messages);
      if (!questionId) return "Я не могу найти последнюю задачу. Пожалуйста, запроси новую.";

      const problem = await getMathProblemById(questionId);
      if (!problem) return "Не удалось найти задачу по ID.";

      if (lastMessage.includes('показать ответ')) {
        return `📌 Ответ: **${problem.answer}**`;
      }

      if (lastMessage.includes('покажи решение')) {
        return problem.solution_text || "Решение пока недоступно.";
      }

      if (lastMessage.includes('не понял')) {
        return problem.solutiontextexpanded || "Подробного объяснения нет.";
      }
    }

    // Step 2: Handle new problem request
    if (lastMessage.includes('задачу')) {
      let category: string | undefined = undefined;

      if (lastMessage.includes('алгебр')) category = 'алгебра';
      else if (lastMessage.includes('арифметик')) category = 'арифметика';
      else if (lastMessage.includes('геометр')) category = 'геометрия';
      else if (lastMessage.includes('практич')) category = 'практическая математика';

      const problem = await getRandomMathProblem(category);

      if (problem) {
       
        const rawImage = problem.problem_image?.replace(/^\/+/, '');
        const imageUrl = rawImage?.startsWith('http')
          ? rawImage
          : `https://casohrqgydyyvcclqwqm.supabase.co/storage/v1/object/public/images/${rawImage}`;

        
        const imagePart = problem.problem_image ? `🖼️ ![изображение](${imageUrl})\n\n` : "";

        return `Вот задача по категории *${category ?? 'Общее'}*:\n\n${imagePart}${problem.problem_text}\n\n(📌 ID задачи: ${problem.question_id})\n\nНапиши *показать ответ* или *покажи решение*, если хочешь продолжить.`;
      }

      return "Не удалось найти задачу. Попробуй ещё раз позже.";
    }

    // Step 3: Default to Groq completion
    const fullMessages = [SYSTEM_PROMPT, ...messages];
    
    const { data, error } = await supabase.functions.invoke('groq-chat', {
      body: { messages: fullMessages, stream: false }
    });

    if (error) {
      console.error('Groq function error:', error);
      throw new Error(`Groq function error: ${error.message}`);
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Chat completion error:', error);
    return 'Произошла ошибка. Попробуй позже.';
  }
}
