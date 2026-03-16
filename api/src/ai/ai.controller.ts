import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProcessJournalDto } from './dto/process-journal.dto';
import { GenerateInsightsDto } from './dto/generate-insights.dto';
import { ChatWithContextDto } from './dto/chat-with-context.dto';
import { ScheduleCheckinDto } from './dto/schedule-checkin.dto';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  @Post('process-journal')
  @ApiOperation({ summary: 'Process a journal section for emotions and reflections' })
  @ApiResponse({ status: 200, description: 'Journal processed successfully' })
  async processJournal(@Body() body: ProcessJournalDto): Promise<any> {
    this.logger.log(`Processing journal content`);
    return this.aiService.processJournal(body);
  }

  @Post('generate-insights')
  @ApiOperation({ summary: 'Generate weekly insights and recommendations from context' })
  @ApiResponse({ status: 200, description: 'Insights generated successfully' })
  async generateInsights(@Body() body: GenerateInsightsDto): Promise<any> {
    this.logger.log(`Generating insights from context`);
    return this.aiService.generateInsights(body);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI using provided context' })
  @ApiResponse({ status: 200, description: 'Chat response generated' })
  async chatWithContext(@Body() body: ChatWithContextDto): Promise<any> {
    this.logger.log(`Chat request with context`);
    return this.aiService.chatWithContext(body);
  }

  @Post('schedule-checkin')
  @ApiOperation({ summary: 'Determine next AI check-in time from context' })
  @ApiResponse({ status: 200, description: 'Check-in time calculated' })
  async scheduleCheckin(@Body() body: ScheduleCheckinDto): Promise<any> {
    this.logger.log(`Calculating check-in time`);
    return this.aiService.scheduleCheckin(body);
  }
}
