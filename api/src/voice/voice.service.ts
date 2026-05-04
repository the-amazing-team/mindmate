import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execFilePromise = promisify(execFile);

@Injectable()
export class VoiceService {
  private readonly pythonPath = process.platform === 'win32' ? 'python' : 'python3';
  private readonly voiceScriptsPath = path.join(process.cwd(), 'voice');
  private readonly useMockVoice = false; // ENABLE REAL VOICE
  private readonly groq: Groq;

  constructor(private configService: ConfigService) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
  }


  async textToSpeech(text: string, voice = 'af_heart'): Promise<string> {
    if (this.useMockVoice) {
      console.log(`VoiceService: Mock mode active. Requested TTS for: "${text.substring(0, 30)}..." with voice: ${voice}`);
      return 'dummy_tts.wav';
    }

    const scriptPath = path.join(this.voiceScriptsPath, 'kokoro_tts.py');
    
    // Check if script exists
    if (!fs.existsSync(scriptPath)) {
      throw new Error(`TTS script not found at ${scriptPath}`);
    }

    const outputFileName = `tts_${Date.now()}.wav`;
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const outputPath = path.join(uploadsDir, outputFileName);
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      console.log(`Creating uploads directory at ${uploadsDir}`);
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    try {
      console.log(`Executing TTS: ${this.pythonPath} ${scriptPath} "${text.substring(0, 20)}..."`);
      await execFilePromise(this.pythonPath, [scriptPath, text, voice, outputPath]);
      return outputFileName;
    } catch (error) {
      console.error('TTS Execution Error:', error);
      throw new Error(`Failed to generate speech with Python. Ensure ${this.pythonPath} and all dependencies (Kokoro) are installed. Error: ${error.message}`);
    }
  }

  async speechToText(audioFilePath: string): Promise<string> {
    try {
      console.log(`VoiceService: Transcribing file with Groq... ${audioFilePath}`);
      
      const transcription = await this.groq.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: 'whisper-large-v3-turbo',
        response_format: 'json',
      });

      console.log('VoiceService: Transcription complete.');
      return transcription.text;
    } catch (error) {
      console.error('Groq STT Error:', error);
      throw new Error(`Failed to transcribe audio with Groq. Error: ${error.message}`);
    }
  }
}
