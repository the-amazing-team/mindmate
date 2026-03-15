import { Injectable } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execFilePromise = promisify(execFile);

@Injectable()
export class VoiceService {
  // On Windows, 'python' or 'py' is common. On Linux/Mac, 'python3' is standard.
  private readonly pythonPath = process.platform === 'win32' ? 'python' : 'python3';
  private readonly voiceScriptsPath = path.join(process.cwd(), 'voice');
  private readonly useMockVoice = true; // Set to true to bypass Python scripts for development

  async textToSpeech(text: string, voice = 'af_heart'): Promise<string> {
    if (this.useMockVoice) {
      console.log('VoiceService: Mock mode active. Returning dummy_tts.wav');
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
    if (this.useMockVoice) {
      console.log('VoiceService: Mock mode active. Returning dummy transcription.');
      const dummyData = JSON.parse(fs.readFileSync(path.join(this.voiceScriptsPath, 'dummy_voice_data.json'), 'utf8'));
      const phrases = dummyData.stt_dummy_phrases;
      return phrases[Math.floor(Math.random() * phrases.length)];
    }

    const scriptPath = path.join(this.voiceScriptsPath, 'whisper_stt.py');

    if (!fs.existsSync(scriptPath)) {
      throw new Error(`STT script not found at ${scriptPath}`);
    }
    
    try {
      console.log(`Executing STT: ${this.pythonPath} ${scriptPath} ${audioFilePath}`);
      const { stdout, stderr } = await execFilePromise(this.pythonPath, [scriptPath, audioFilePath]);
      
      if (stderr && !stdout) {
        console.warn('STT Python stderr:', stderr);
      }

      const match = stdout.match(/Transcription:\s*(.*)/i);
      return match ? match[1].trim() : stdout.trim();
    } catch (error) {
      console.error('STT Execution Error:', error);
      throw new Error(`Failed to transcribe audio with Python. Ensure ${this.pythonPath} and Whisper are installed. Error: ${error.message}`);
    }
  }
}
