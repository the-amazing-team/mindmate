import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PersonalityType } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    email: string;
    name: string;
    password_hash: string;
    age_group?: string;
    personality_type?: PersonalityType;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictException('User already exists');
    }

    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password_hash: data.password_hash,
        age_group: data.age_group,
        personality_type: data.personality_type,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async updatePersonality(email: string, ageGroup: string, personality: PersonalityType) {
    return this.prisma.user.update({
      where: { email },
      data: {
        age_group: ageGroup,
        personality_type: personality,
      },
    });
  }
}
