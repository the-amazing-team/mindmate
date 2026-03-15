import { ApiProperty } from '@nestjs/swagger';
import { PersonalityType } from '@prisma/client';

export class UpdateProfileDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: '18-24' })
  age_group: string;

  @ApiProperty({ enum: PersonalityType })
  personality_type: PersonalityType;

  @ApiProperty({ example: ['Better sleep', 'Stress management'], type: [String] })
  goals: string[];

  @ApiProperty({ example: '08:00' })
  reminders: string;
}
