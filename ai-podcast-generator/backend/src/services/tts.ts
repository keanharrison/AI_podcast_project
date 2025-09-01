import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { chunkText } from '../utils/text';
import type { PodcastScript } from './llm';

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Voice mapping for different speakers
const VOICE_MAP: Record<string, string> = {
  'Host A': 'alloy',
  'Host B': 'echo',
  'default': 'nova'
};

export async function synthesizeAudio(
  script: PodcastScript, 
  preferredVoice?: string, 
  style?: string
): Promise<string[]> {
  const wavPaths: string[] = [];
  const storageDir = path.join(__dirname, '../../storage');
  
  // Ensure storage directory exists
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  for (let i = 0; i < script.segments.length; i++) {
    const segment = script.segments[i];
    const voice = preferredVoice || VOICE_MAP[segment.speaker] || VOICE_MAP.default;
    
    // Chunk the text if it's too long
    const chunks = chunkText(segment.text, 1500);
    
    for (let j = 0; j < chunks.length; j++) {
      const chunk = chunks[j];
      const filename = `segment_${i}_chunk_${j}_${Date.now()}.mp3`;
      const filePath = path.join(storageDir, filename);
      
      try {
        console.log(`Generating TTS for segment ${i}, chunk ${j} with voice ${voice}...`);
        
        const openai = getOpenAIClient();
        const mp3Response = await openai.audio.speech.create({
          model: 'tts-1',
          voice: voice as any,
          input: chunk,
          response_format: 'mp3'
        });

        const buffer = Buffer.from(await mp3Response.arrayBuffer());
        fs.writeFileSync(filePath, buffer);
        wavPaths.push(filePath);
        
        console.log(`Generated audio file: ${filename}`);
      } catch (error: any) {
        throw new Error(`TTS failed for segment ${i}, chunk ${j}: ${error.message}`);
      }
    }
  }

  return wavPaths;
}