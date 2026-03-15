import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PersonalityType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    email: string;
    name?: string;
    password?: string;
    auth_type?: any;
    age_group?: string;
    personality_type?: PersonalityType;
    onboarding_complete?: boolean;
    is_verified?: boolean;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return existing; // Return existing for sync/login
    }

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

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updatePersonality(email: string, ageGroup: string, personality: PersonalityType, goals: string[], reminders: string) {
    return this.prisma.user.update({
      where: { email },
      data: {
        age_group: ageGroup,
        personality_type: personality,
        goals: goals,
        reminders: reminders,
        onboarding_complete: true,
      },
    });
  }

  async createOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await this.prisma.otp.create({
      data: {
        email,
        otp,
        expires_at,
      },
    });

    return otp;
  }

  async verifyOtp(email: string, otp: string) {
    const validOtp = await this.prisma.otp.findFirst({
      where: {
        email,
        otp,
        expires_at: { gt: new Date() },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!validOtp) {
      return false;
    }

    // Mark user as verified
    await this.prisma.user.update({
      where: { email },
      data: { is_verified: true },
    });

    // Delete used OTPs for this email
    await this.prisma.otp.deleteMany({
      where: { email },
    });

    return true;
  }
}
