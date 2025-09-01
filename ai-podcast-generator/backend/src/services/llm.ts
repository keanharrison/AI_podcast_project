import OpenAI from 'openai';

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

export interface PodcastScript {
  title: string;
  segments: Array<{
    speaker: string;
    text: string;
  }>;
}

export async function generateScript(rawText: string): Promise<PodcastScript> {
  const prompt = `You are a podcast scriptwriter. Summarize the provided source into a tight 3–10 minute script.
Constraints:
- Conversational, two-host style
- Clear structure: hook → 3–5 key insights → wrap-up with CTA
- Keep claims grounded; cite source names inline where possible
- Avoid fluff and repetition

Output format (JSON):
{
  "title": "...",
  "segments": [
    {"speaker":"Host A","text":"..."},
    {"speaker":"Host B","text":"..."}
  ]
}

Source content:
${rawText}`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional podcast scriptwriter. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const script: PodcastScript = JSON.parse(content);
    
    // Validate the response structure
    if (!script.title || !script.segments || !Array.isArray(script.segments)) {
      throw new Error('Invalid script format from LLM');
    }

    return script;
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse LLM response as JSON');
    }
    throw new Error(`LLM generation failed: ${error.message}`);
  }
}