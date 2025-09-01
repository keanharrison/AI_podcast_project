import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';
import ffmpegPath from 'ffmpeg-static';

export interface AudioResult {
  mp3Path: string;
  duration: number;
  size: number;
}

export async function stitchToMp3(wavPaths: string[], requestId: string): Promise<AudioResult> {
  const storageDir = path.join(__dirname, '../../storage');
  const outputPath = path.join(storageDir, `${requestId}.mp3`);
  
  if (!ffmpegPath) {
    throw new Error('FFmpeg not available');
  }

  return new Promise((resolve, reject) => {
    // Create a temporary file list for ffmpeg concat
    const fileListPath = path.join(storageDir, `${requestId}_filelist.txt`);
    const fileList = wavPaths.map(p => `file '${p}'`).join('\n');
    fs.writeFileSync(fileListPath, fileList);

    console.log(`Stitching ${wavPaths.length} audio files to ${outputPath}...`);

    // Use ffmpeg to concatenate audio files
    const ffmpeg: ChildProcess = spawn(ffmpegPath as string, [
      '-f', 'concat',
      '-safe', '0',
      '-i', fileListPath,
      '-c', 'copy',
      '-y', // Overwrite output file
      outputPath
    ]);

    let stderr = '';
    
    ffmpeg.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', (code: number | null) => {
      // Clean up temporary files
      try {
        fs.unlinkSync(fileListPath);
        wavPaths.forEach(p => {
          if (fs.existsSync(p)) {
            fs.unlinkSync(p);
          }
        });
      } catch (cleanupError) {
        console.warn('Cleanup warning:', cleanupError);
      }

      if (code !== 0) {
        console.error('FFmpeg stderr:', stderr);
        reject(new Error(`FFmpeg failed with code ${code}`));
        return;
      }

      try {
        // Get file stats
        const stats = fs.statSync(outputPath);
        
        // Get duration using ffprobe (simplified - just return estimated duration)
        const estimatedDuration = Math.max(60, wavPaths.length * 10); // Rough estimate
        
        resolve({
          mp3Path: outputPath,
          duration: estimatedDuration,
          size: stats.size
        });
      } catch (error: any) {
        reject(new Error(`Failed to get audio file stats: ${error.message}`));
      }
    });

    ffmpeg.on('error', (error: Error) => {
      reject(new Error(`FFmpeg process error: ${error.message}`));
    });
  });
}