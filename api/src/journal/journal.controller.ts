import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JournalService } from './journal.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { ProcessJournalDto } from '../ai/dto/process-journal.dto';

@ApiTags('Journal')
@Controller('journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new journal entry' })
  @ApiResponse({ status: 201, description: 'Journal entry created successfully' })
  async create(@Body() createJournalDto: CreateJournalDto) {
    return this.journalService.create(createJournalDto);
  }

  @Post('process-journal')
  @ApiOperation({ summary: 'Process a journal section for emotions and reflections' })
  @ApiResponse({ status: 200, description: 'Journal processed successfully' })
  async processJournal(@Body() processJournalDto: ProcessJournalDto) {
    return this.journalService.processJournal(processJournalDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all journal entries for a user' })
  @ApiResponse({ status: 200, description: 'Returns list of journal entries' })
  async findAll(@Param('userId') userId: string) {
    return this.journalService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific journal entry' })
  @ApiResponse({ status: 200, description: 'Returns journal entry details' })
  @ApiResponse({ status: 404, description: 'Journal entry not found' })
  async findOne(@Param('id') id: string) {
    return this.journalService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a journal entry' })
  @ApiResponse({ status: 200, description: 'Journal entry deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.journalService.delete(id);
  }
}
