import { Module } from '@nestjs/common';
import { VoiceController } from './voice.controller';
import { VoiceService } from './voice.service';
import { KokoroService } from './kokoro.service';

@Module({
  controllers: [VoiceController],
  providers: [VoiceService, KokoroService],
  exports: [VoiceService, KokoroService],
})
export class VoiceModule {}
