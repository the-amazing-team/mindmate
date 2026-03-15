import { Controller, Post, Body, BadRequestException, Logger } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  @Post('pipeline')
  async runPipeline(@Body() body: { pipeline: string; payload: any }): Promise<any> {
    const { pipeline, payload } = body;
    this.logger.log(`Running pipeline ${pipeline}`);

    switch (pipeline) {
      case 'A':
        return this.aiService.processJournal(payload);
      case 'B':
        return this.aiService.generateInsights(payload);
      case 'C':
        return this.aiService.chatWithContext(payload);
      case 'D':
        return this.aiService.scheduleCheckin(payload);
      default:
        throw new BadRequestException('Unknown pipeline');
    }
  }
}
