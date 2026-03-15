import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
 * TypeScript implementation of the Kokoro TTS Pipeline logic.
 * This service wraps the Python Kokoro model to provide a similar 
 * generator-like experience in TypeScript.
 */
@Injectable()
export class KokoroService {
  private readonly logger = new Logger(KokoroService.name);
  private readonly pythonPath = process.platform === 'win32' ? 'python' : 'python3';
  private readonly voiceScriptsPath = path.join(process.cwd(), 'voice');
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Equivalent to: 
   * generator = pipeline(text, voice='af_heart')
   * for i, (gs, ps, audio) in enumerate(generator):
   *     sf.write(f'{i}.wav', audio, 24000)
   */
  async generateSpeechChunks(text: string, voice = 'af_heart'): Promise<string[]> {
    const scriptPath = path.join(this.voiceScriptsPath, 'kokoro_tts.py');
    const sessionId = Date.now();
    const chunkFiles: string[] = [];

    return new Promise((resolve, reject) => {
      // We pass a special flag or handle the output accordingly
      // For this implementation, we'll assume the python script 
      // can output filenames of generated chunks to stdout
      const pyProcess = spawn(this.pythonPath, [
        scriptPath, 
        text, 
        voice, 
        path.join(this.uploadsDir, `chunk_${sessionId}`)
      ]);

      pyProcess.stdout.on('data', (data) => {
        const output = data.toString();
        this.logger.log(`Python Output: ${output}`);
        
        // Match chunk file paths from python output
        const matches = output.match(/Saved to (.*\.wav)/g);
        if (matches) {
          matches.forEach((m: string) => {
            const filePath = m.replace('Saved to ', '').trim();
            chunkFiles.push(path.basename(filePath));
          });
        }
      });

      pyProcess.stderr.on('data', (data) => {
        this.logger.error(`Python Error: ${data.toString()}`);
      });

      pyProcess.on('close', (code) => {
        if (code === 0) {
          this.logger.log(`TTS Generation complete. Generated ${chunkFiles.length} chunks.`);
          resolve(chunkFiles);
        } else {
          reject(new Error(`Python process exited with code ${code}`));
        }
      });
    });
  }
}
