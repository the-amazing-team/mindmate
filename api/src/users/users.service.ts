import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PersonalityType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UsersService {
  private readonly googleClient: OAuth2Client;
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(configService.get<string>('GOOGLE_CLIENT_ID'));
  }

  async create(data: { email: string; name?: string; password?: string; auth_type?: any; age_group?: string; personality_type?: PersonalityType; onboarding_complete?: boolean; is_verified?: boolean; }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return existing;
    const password_hash = await bcrypt.hash(data.password || 'managed-externally', 10);
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password_hash,
        auth_type: (data.auth_type as any) || 'EMAIL',
        age_group: data.age_group,
        personality_type: data.personality_type,
        onboarding_complete: data.onboarding_complete ?? false,
        is_verified: data.is_verified ?? false,
      },
    });
  }

  async validatePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  generateJwt(user: any) {
    const payload = { userId: user.id, email: user.email, name: user.name };
    return jwt.sign(payload, this.configService.get<string>('JWT_SECRET') || 'default-secret-key-for-dev', { expiresIn: '7d' });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updatePersonality(data: {
    email: string;
    age_group: string;
    personality_type: PersonalityType;
    goals: string[];
    reminders: string;
    name?: string;
    notifications_enabled?: boolean;
    reminders_enabled?: boolean;
    weekly_insights_enabled?: boolean;
    marketing_emails_enabled?: boolean;
  }) {
    const {
      email,
      age_group,
      personality_type,
      goals,
      reminders,
      name,
      notifications_enabled,
      reminders_enabled,
      weekly_insights_enabled,
      marketing_emails_enabled,
    } = data;

    this.logger.log(`Updating profile for user: ${email}`);

    const updateData: any = {
      name: name || undefined,
      age_group: age_group || undefined,
      personality_type: personality_type || undefined,
      goals: goals ? { set: goals } : undefined,
      reminders: reminders || undefined,
      notifications_enabled: notifications_enabled ?? undefined,
      reminders_enabled: reminders_enabled ?? undefined,
      weekly_insights_enabled: weekly_insights_enabled ?? undefined,
      marketing_emails_enabled: marketing_emails_enabled ?? undefined,
      onboarding_complete: true,
    };

    return this.prisma.user.update({
      where: { email },
      data: updateData,
    });
  }

  async createOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);
    await this.prisma.otp.create({ data: { email, otp, expires_at } });
    return otp;
  }

  async verifyOtp(email: string, otp: string) {
    const validOtp = await this.prisma.otp.findFirst({
      where: { email, otp, expires_at: { gt: new Date() } },
      orderBy: { created_at: 'desc' },
    });
    if (!validOtp) return false;
    await this.prisma.user.update({ where: { email }, data: { is_verified: true } });
    await this.prisma.otp.deleteMany({ where: { email } });
    return true;
  }

  async authenticateWithGoogle(idToken: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({ idToken, audience: this.configService.get<string>('GOOGLE_CLIENT_ID') });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) throw new UnauthorizedException('Invalid Google token');
      const email = payload.email.toLowerCase();
      const name = payload.name || payload.given_name || 'Google User';
      let user = await this.prisma.user.findUnique({ where: { email } });
      if (user) {
      } else {
        const dummyPassword = bcrypt.hashSync(Math.random().toString(), 10);
        user = await this.prisma.user.create({
          data: { email, name, password_hash: dummyPassword, auth_type: 'GOOGLE', is_verified: true },
        });
      }
      const token = this.generateJwt(user);
      return { user, token };
    } catch (error) {
      this.logger.error('Google authentication error', error);
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }

  async getMetrics(userId: string) {
    const totalJournals = await this.prisma.journalEntry.count({ where: { user_id: userId } });
    const totalCheckIns = await this.prisma.checkIn.count({ where: { user_id: userId } });
    
    const activities = await Promise.all([
      this.prisma.journalEntry.findMany({ where: { user_id: userId }, select: { created_at: true } }),
      this.prisma.checkIn.findMany({ where: { user_id: userId }, select: { created_at: true } })
    ]);
    
    const dates = [...activities[0], ...activities[1]]
      .map(a => a.created_at.toISOString().split('T')[0])
      .sort((a, b) => b.localeCompare(a));
    
    const uniqueDates = Array.from(new Set(dates));
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (uniqueDates.length > 0 && (uniqueDates[0] === today || uniqueDates[0] === yesterday)) {
      streak = 1;
      for (let i = 0; i < uniqueDates.length - 1; i++) {
        const d1 = new Date(uniqueDates[i]);
        const d2 = new Date(uniqueDates[i+1]);
        const diff = Math.round((d1.getTime() - d2.getTime()) / 86400000);
        if (diff === 1) streak++;
        else break;
      }
    }
    
    return { streak, totalJournals, totalCheckIns };
  }

  async createCheckIn(userId: string, moodScore: number, note?: string) {
    return this.prisma.checkIn.create({
      data: {
        user_id: userId,
        mood_score: moodScore,
        note
      }
    });
  }
}
