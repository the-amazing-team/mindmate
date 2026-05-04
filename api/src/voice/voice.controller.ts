import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VoiceService } from './voice.service';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { TextToSpeechDto, SpeechToTextDto } from './dto/voice.dto';

@ApiTags('Voice')
@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post('tts')
  @ApiOperation({ summary: 'Convert text to speech' })
  @ApiResponse({ status: 200, description: 'Audio URL returned successfully' })
  async textToSpeech(@Body() data: TextToSpeechDto) {
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
  @ApiOperation({ summary: 'Convert speech to text' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: SpeechToTextDto })
  @ApiResponse({ status: 200, description: 'Transcription returned successfully' })
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
      console.error('STT: No file received');
      return { success: false, message: 'No file uploaded' };
    }
    
    console.log(`STT: Received file ${file.originalname}, size: ${file.size} bytes, path: ${file.path}`);
    
    try {
      const transcription = await this.voiceService.speechToText(file.path);
      console.log(`STT: Transcription successful: "${transcription}"`);
      return { 
        success: true, 
        text: transcription 
      };
    } catch (error) {
      console.error('STT Error:', error.message);
      return { success: false, message: error.message };
    }
  }
}
