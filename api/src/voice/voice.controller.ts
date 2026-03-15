import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VoiceService } from './voice.service';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { Request } from 'express';

@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post('tts')
  async textToSpeech(@Body() data: { text: string, voice?: string }) {
    if (!data.text) {
      return { success: false, message: 'Text field is required' };
    }
    
    try {
      const filename = await this.voiceService.textToSpeech(data.text, data.voice);
      return { 
        success: true, 
        audioUrl: `/uploads/${filename}` 
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post('stt')
  @UseInterceptors(FileInterceptor('audio', {
    storage: diskStorage({
      destination: (req: Request, file: Express.Multer.File, cb) => {
        const uploadPath = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req: Request, file: Express.Multer.File, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname || '.m4a'));
      },
    }),
  }))
  async speechToText(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { success: false, message: 'No file uploaded' };
    }
    
    try {
      const transcription = await this.voiceService.speechToText(file.path);
      return { 
        success: true, 
        text: transcription 
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
