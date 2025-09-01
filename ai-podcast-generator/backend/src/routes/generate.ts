import express from 'express';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ingestContent } from '../services/ingest';
import { generateScript } from '../services/llm';
import { synthesizeAudio } from '../services/tts';
import { stitchToMp3 } from '../services/audio';

const router = express.Router();

interface GenerateRequest {
  input: string;
  inputType: 'url' | 'text';
  voice?: string;
  style?: string;
}

interface GenerateResponse {
  id: string;
  url: string;
  duration: number;
  size: number;
}

router.post('/', async (req: express.Request, res: express.Response) => {
  const startTime = Date.now();
  const requestId = uuidv4();
  
  try {
    console.log(`[${requestId}] Starting podcast generation...`);
    
    // Validate request body
    const { input, inputType, voice, style }: GenerateRequest = req.body;
    
    if (!input || !input.trim()) {
      return res.status(400).json({ error: 'Input is required' });
    }
    
    if (!inputType || !['url', 'text'].includes(inputType)) {
      return res.status(400).json({ error: 'inputType must be "url" or "text"' });
    }

    // Check input length limits
    const MAX_TEXT_LENGTH = 50000; // 50k characters
    if (inputType === 'text' && input.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({ 
        error: `Text input too long. Maximum ${MAX_TEXT_LENGTH} characters allowed.` 
      });
    }

    // Step 1: Ingest content
    console.log(`[${requestId}] Step 1: Ingesting content (${inputType})...`);
    const rawText = await ingestContent(input, inputType);
    console.log(`[${requestId}] Ingested ${rawText.length} characters in ${Date.now() - startTime}ms`);

    // Step 2: Generate script
    console.log(`[${requestId}] Step 2: Generating script...`);
    const script = await generateScript(rawText);
    console.log(`[${requestId}] Generated script with ${script.segments.length} segments in ${Date.now() - startTime}ms`);

    // Step 3: Synthesize audio
    console.log(`[${requestId}] Step 3: Synthesizing audio...`);
    const wavPaths = await synthesizeAudio(script, voice, style);
    console.log(`[${requestId}] Generated ${wavPaths.length} audio files in ${Date.now() - startTime}ms`);

    // Step 4: Stitch to MP3
    console.log(`[${requestId}] Step 4: Stitching audio files...`);
    const { mp3Path, duration, size } = await stitchToMp3(wavPaths, requestId);
    console.log(`[${requestId}] Created MP3 (${duration}s, ${size} bytes) in ${Date.now() - startTime}ms`);

    // Return response
    const response: GenerateResponse = {
      id: requestId,
      url: `/storage/${path.basename(mp3Path)}`,
      duration,
      size
    };

    console.log(`[${requestId}] Total generation time: ${Date.now() - startTime}ms`);
    res.json(response);

  } catch (error: any) {
    console.error(`[${requestId}] Error:`, error.message);
    
    if (error.message.includes('fetch')) {
      return res.status(422).json({ error: "Couldn't fetch content", message: error.message });
    }
    
    return res.status(502).json({ error: 'Generation failed', message: error.message });
  }
});

export default router;