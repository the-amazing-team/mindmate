import { Controller, Get, Post, Param, Delete, Query } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Insights')
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all insights for a user' })
  async findAll(@Param('userId') userId: string) {
    return this.insightsService.findAllByUser(userId);
  }

  @Get('entry/:entryId')
  @ApiOperation({ summary: 'Get insights for a specific journal entry' })
  async findByEntry(@Param('entryId') entryId: string) {
    return this.insightsService.findByEntry(entryId);
  }

  @Post('generate/:entryId')
  @ApiOperation({ summary: 'Manually trigger insight generation for an entry' })
  async generate(@Param('entryId') entryId: string) {
    return this.insightsService.generateForEntry(entryId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an insight' })
  async remove(@Param('id') id: string) {
    return this.insightsService.delete(id);
  }
}
