import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PluginService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedPlugins();
  }

  async getAllPlugins() {
    return this.prisma.plugin.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInstalledPlugins(userId: string) {
    return this.prisma.installation.findMany({
      where: { userId },
      include: { plugin: true },
    });
  }

  async installPlugin(userId: string, pluginId: string) {
    return this.prisma.installation.upsert({
      where: {
        userId_pluginId: { userId, pluginId },
      },
      update: {},
      create: { userId, pluginId },
    });
  }

  private async seedPlugins() {
    const count = await this.prisma.plugin.count();
    if (count > 0) return;

    console.log('Seeding initial plugins...');
    const plugins = [
      {
        name: 'MoodFlow Pro',
        author: 'NeuraTech Labs',
        icon: '🌊',
        description: 'Advanced mood analytics with predictive AI.',
        category: 'Analytics',
        price: 4.99,
        rating: 4.9,
        reviews: 2341,
        installs: '12.4K',
        verified: true,
        code: `console.log("MoodFlow Pro loaded");`,
      },
      {
        name: 'SerenityBot',
        author: 'CalmAI',
        icon: '🤖',
        description: 'Custom AI therapist persona trained on CBT.',
        category: 'AI Workflows',
        price: 9.99,
        rating: 4.8,
        reviews: 1892,
        installs: '8.7K',
        verified: true,
        code: `console.log("SerenityBot active");`,
      },
    ];

    for (const p of plugins) {
      await this.prisma.plugin.create({ data: p });
    }
  }
}
