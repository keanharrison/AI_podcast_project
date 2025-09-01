import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { PodcastScript } from './llm';
import type { AudioResult } from './audio';

// Mock podcast script for demo
const mockScript: PodcastScript = {
  title: "AI in Healthcare: A Revolutionary Breakthrough",
  segments: [
    {
      speaker: "Host A",
      text: "Welcome to AI Insights! I'm Sarah, and today we're diving into how artificial intelligence is transforming healthcare."
    },
    {
      speaker: "Host B", 
      text: "Thanks Sarah! I'm Mike, and this topic is absolutely fascinating. The precision that machine learning brings to medical imaging is just incredible."
    },
    {
      speaker: "Host A",
      text: "Exactly! What used to take doctors hours to analyze, AI can now process in minutes with remarkable accuracy. We're talking about early disease detection that could save millions of lives."
    },
    {
      speaker: "Host B",
      text: "And let's not forget about drug discovery. AI is accelerating the development of new treatments from decades down to just years. The pharmaceutical industry is being completely revolutionized."
    },
    {
      speaker: "Host A",
      text: "It's amazing to think about the possibilities. From personalized medicine to predictive healthcare, AI is making the impossible possible."
    },
    {
      speaker: "Host B",
      text: "Absolutely! Thanks for joining us on AI Insights. Keep exploring, keep learning, and we'll see you next time!"
    }
  ]
};

export async function generateDemoScript(rawText: string): Promise<PodcastScript> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create a dynamic script based on input
  const dynamicScript: PodcastScript = {
    title: "AI-Generated Podcast: Your Content",
    segments: [
      {
        speaker: "Host A",
        text: `Welcome to our AI-generated podcast! Today we're discussing some fascinating content about ${rawText.substring(0, 50)}...`
      },
      {
        speaker: "Host B",
        text: "Thanks for that introduction! This is really interesting material. Let me share some key insights from what we've learned."
      },
      {
        speaker: "Host A", 
        text: `The main points from our source material really highlight how ${rawText.split(' ').slice(0, 10).join(' ')}... continues to evolve.`
      },
      {
        speaker: "Host B",
        text: "Exactly! And what's particularly striking is the broader implications this has for our understanding of the topic."
      },
      {
        speaker: "Host A",
        text: "Well said! Thanks everyone for tuning in to our AI-generated podcast. We hope you found these insights valuable!"
      }
    ]
  };

  return dynamicScript;
}

export async function generateDemoAudio(script: PodcastScript, requestId: string): Promise<AudioResult> {
  // Simulate TTS and audio processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const storageDir = path.join(__dirname, '../../storage');
  
  // Ensure storage directory exists
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  // Create a simple demo audio file (silent MP3)
  const outputPath = path.join(storageDir, `${requestId}.mp3`);
  
  // Create a minimal MP3 file header for demo
  const demoMp3Data = Buffer.from([
    0xFF, 0xFB, 0x90, 0x00, // MP3 header
    ...Array(1000).fill(0x00) // Silent audio data
  ]);
  
  fs.writeFileSync(outputPath, demoMp3Data);
  
  return {
    mp3Path: outputPath,
    duration: 45 + Math.floor(Math.random() * 60), // Random duration 45-105 seconds
    size: demoMp3Data.length
  };
}