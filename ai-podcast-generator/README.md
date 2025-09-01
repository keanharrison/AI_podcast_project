# AI Podcast Generator

Transform any URL or text into an engaging AI-generated podcast in minutes.

## Features

- 🎯 **Smart Content Ingestion**: Paste a URL or text
- 🤖 **AI Script Generation**: Creates conversational two-host dialogue
- 🎙️ **Text-to-Speech**: High-quality voice synthesis
- 🎵 **Audio Processing**: Automatic stitching and MP3 export
- 📱 **Web Interface**: Simple, intuitive UI

## Quick Start

### Prerequisites
- Node.js 18+
- OpenAI API key
- (Optional) ElevenLabs API key

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repo-url>
   cd ai-podcast-generator
   ```

2. **Backend setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your API keys
   npm run dev
   ```

3. **Frontend setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000

## Environment Variables

Create `backend/.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
PORT=4000
```

## API

### POST /generate
Generate a podcast from input content.

**Request:**
```json
{
  "input": "https://example.com/article or raw text",
  "inputType": "url" | "text",
  "voice": "optional voice preference",
  "style": "optional style preference"
}
```

**Response:**
```json
{
  "id": "unique-id",
  "url": "/storage/unique-id.mp3",
  "duration": 180,
  "size": 2048000
}
```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **AI**: OpenAI GPT-4 & TTS
- **Audio**: FFmpeg for processing
- **Storage**: Local filesystem (expandable to S3)

## Development

```bash
# Backend development
cd backend && npm run dev

# Frontend development  
cd frontend && npm run dev

# Build for production
cd backend && npm run build
cd frontend && npm run build
```

Generated podcasts are saved in `backend/storage/` and served at `/storage/<id>.mp3`.