import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

import { VoiceModule } from './voice/voice.module';
import { PluginModule } from './plugins/plugin.module';

@Module({
  imports: [PrismaModule, VoiceModule, PluginModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
