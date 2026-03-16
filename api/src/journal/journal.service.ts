import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { AiService } from '../ai/ai.service';
import { ProcessJournalDto } from '../ai/dto/process-journal.dto';
import { InsightsService } from '../insights/insights.service';

@Injectable()
export class JournalService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private insightsService: InsightsService,
  ) {}

  async create(data: CreateJournalDto) {
    const entry = await this.prisma.journalEntry.create({
      data: {
        user_id: data.userId,
        title: data.title,
        overall_mood: data.overall_mood,
        sections: {
          create: data.sections.map((section) => ({
            content: section.content,
            section_order: section.section_order,
            primary_emotion: section.primary_emotion,
            emotion_score: section.emotion_score,
            reflection_text: section.reflection_text,
          })),
        },
      },
      include: {
        sections: true,
      },
    });

    // Generate insight for the new entry
    try {
      await this.insightsService.generateForEntry(entry.id);
    } catch (err) {
      console.error('Failed to generate insight for new entry:', err);
      // We don't want to fail the whole journal creation if insight generation fails
    }

    return entry;
  }

  async processJournal(data: ProcessJournalDto) {
    return this.aiService.processJournal(data);
  }

  async findAllByUser(userId: string) {
    return this.prisma.journalEntry.findMany({
      where: { user_id: userId },
      include: {
        sections: {
          orderBy: { section_order: 'asc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const entry = await this.prisma.journalEntry.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { section_order: 'asc' },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException(`Journal entry with ID ${id} not found`);
    }

    return entry;
  }

  async delete(id: string) {
    return this.prisma.journalEntry.delete({
      where: { id },
    });
  }
}
