import { Controller, Post, Get, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JournalService } from './journal.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { ProcessJournalDto } from '../ai/dto/process-journal.dto';
import { JwtAuthGuard } from '../users/jwt-auth.guard';

@ApiTags('Journal')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new journal entry', description: 'Creates a new journal entry with multiple sections for mood tracking and reflection' })
  @ApiResponse({ status: 201, description: 'Journal entry created successfully', type: Object })
  async create(@Body() createJournalDto: CreateJournalDto) {
    return this.journalService.create(createJournalDto);
  }

  @Post('process-journal')
  @ApiOperation({ summary: 'Process a journal section for emotions and reflections', description: 'Uses AI to analyze journal text and extract primary emotions, emotional scores, and reflection text' })
  @ApiResponse({ status: 200, description: 'Journal processed successfully', type: Object })
  async processJournal(@Body() processJournalDto: ProcessJournalDto) {
    return this.journalService.processJournal(processJournalDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all journal entries for a user', description: 'Retrieves all journal entries for a specific user, ordered by creation date' })
  @ApiQuery({ name: 'includeSections', description: 'Include section details in response', required: false })
  @ApiResponse({ status: 200, description: 'Returns list of journal entries', type: Object })
  async findAll(@Param('userId') userId: string, @Query('includeSections') includeSections?: string) {
    return this.journalService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific journal entry', description: 'Retrieves a single journal entry by its ID, including all sections and insights' })
  @ApiResponse({ status: 200, description: 'Returns journal entry details', type: Object })
  @ApiResponse({ status: 404, description: 'Journal entry not found' })
  async findOne(@Param('id') id: string) {
    return this.journalService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a journal entry', description: 'Permanently deletes a journal entry and all associated sections' })
  @ApiResponse({ status: 200, description: 'Journal entry deleted successfully', type: Object })
  async remove(@Param('id') id: string) {
    return this.journalService.delete(id);
  }
}
