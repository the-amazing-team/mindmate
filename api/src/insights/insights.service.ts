import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async findAllByUser(userId: string) {
    return this.prisma.insight.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async findByEntry(entryId: string) {
    return this.prisma.insight.findMany({
      where: { journal_entry_id: entryId },
    });
  }

  async generateForEntry(entryId: string) {
    this.logger.log(`Generating insight for entry ${entryId}`);
    
    const entry = await this.prisma.journalEntry.findUnique({
      where: { id: entryId },
      include: { sections: { orderBy: { section_order: 'asc' } } },
    });

    if (!entry) {
      throw new NotFoundException(`Journal entry ${entryId} not found`);
    }

    // Aggregate content
    const fullContent = entry.sections.map((s) => s.content).join('\n\n');
    
    // Call AI Service
    const aiInsight = await this.aiService.generateInsights({ context: fullContent });

    // Save to DB
    return this.prisma.insight.create({
      data: {
        user_id: entry.user_id,
        journal_entry_id: entry.id,
        summary: aiInsight.summary,
        recommendation: aiInsight.recommendation,
        patterns: aiInsight.patterns as any,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.insight.delete({
      where: { id },
    });
  }
}
