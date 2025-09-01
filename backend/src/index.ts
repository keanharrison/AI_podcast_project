import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import generateRouter from './routes/generate';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/generate', limiter);

// Serve static files from storage directory
app.use('/storage', express.static(path.join(__dirname, '../storage')));

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// List saved episodes
app.get('/episodes', (req, res) => {
  try {
    const storageDir = path.join(__dirname, '../storage');
    const files = require('fs').readdirSync(storageDir)
      .filter((file: string) => file.endsWith('.mp3'))
      .map((file: string) => {
        const filePath = path.join(storageDir, file);
        const stats = require('fs').statSync(filePath);
        const id = file.replace('.mp3', '');
        
        return {
          id,
          filename: file,
          url: `/storage/${file}`,
          size: stats.size,
          created: stats.birthtime,
        };
      })
      .sort((a: any, b: any) => new Date(b.created).getTime() - new Date(a.created).getTime());
    
    res.json({ episodes: files });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to list episodes', message: error.message });
  }
});

app.use('/generate', generateRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🎙️  AI Podcast Generator backend running on port ${PORT}`);
  console.log(`📁 Storage served at http://localhost:${PORT}/storage`);
});