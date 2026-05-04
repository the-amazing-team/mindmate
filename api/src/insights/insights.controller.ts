import { Controller, Get, Post, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../users/jwt-auth.guard';

@ApiTags('Insights')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all insights for a user', description: 'Retrieves all AI-generated insights for a specific user across all journal entries' })
  @ApiResponse({ status: 200, description: 'Returns list of insights', type: Object })
  async findAll(@Param('userId') userId: string) {
    return this.insightsService.findAllByUser(userId);
  }

  @Get('entry/:entryId')
  @ApiOperation({ summary: 'Get insights for a specific journal entry', description: 'Retrieves all insights generated for a specific journal entry' })
  @ApiResponse({ status: 200, description: 'Returns insights for the entry', type: Object })
  async findByEntry(@Param('entryId') entryId: string) {
    return this.insightsService.findByEntry(entryId);
  }

  @Post('generate/:entryId')
  @ApiOperation({ summary: 'Manually trigger insight generation', description: 'Manually triggers AI processing to generate insights for a specific journal entry' })
  @ApiResponse({ status: 200, description: 'Insights generated successfully', type: Object })
  async generate(@Param('entryId') entryId: string) {
    return this.insightsService.generateForEntry(entryId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an insight', description: 'Deletes a specific insight from the system' })
  @ApiResponse({ status: 200, description: 'Insight deleted successfully', type: Object })
  async remove(@Param('id') id: string) {
    return this.insightsService.delete(id);
  }
}
