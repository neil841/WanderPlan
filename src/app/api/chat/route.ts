import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { promises as fs } from 'fs';
import path from 'path';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return new Response('Missing API Key', { status: 500 });
    }

    const userGuidePath = path.join(process.cwd(), 'docs', 'USER-GUIDE.md');
    let userGuideContent = '';
    try {
      userGuideContent = await fs.readFile(userGuidePath, 'utf-8');
    } catch (error) {
      console.error('Error reading user guide:', error);
    }

    // Build the system prompt with WanderPlan documentation
    const systemPrompt = `You are a helpful, friendly, and knowledgeable AI assistant for the WanderPlan travel planning app.

Your goal is to help users navigate the app, understand features, and solve problems.

IMPORTANT INSTRUCTIONS:
1. ONLY answer questions based on the WanderPlan User Guide documentation provided below.
2. When users ask how to do something, provide step-by-step instructions from the documentation.
3. If the answer is not in the documentation, politely say you don't have that information and suggest contacting support at support@wanderplan.com.
4. Do NOT make up features or capabilities that are not documented.
5. Be concise but helpful. Use bullet points or numbered steps when explaining processes.
6. If asked about pricing, say that WanderPlan is 100% free and open-source.

===== WANDERPLAN USER GUIDE DOCUMENTATION =====

${userGuideContent}

===== END OF DOCUMENTATION =====`;

    // Use gemini-2.0-flash model with proper system prompt
    const result = await generateText({
      model: google('gemini-2.0-flash'),
      system: systemPrompt,
      messages,
    });

    return new Response(result.text, {
      headers: { 'Content-Type': 'text/plain' },
    });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
}
