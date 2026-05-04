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

  @ApiProperty({ example: 'John Doe', required: false })
  name?: string;

  @ApiProperty({ example: true, required: false })
  notifications_enabled?: boolean;

  @ApiProperty({ example: true, required: false })
  reminders_enabled?: boolean;

  @ApiProperty({ example: true, required: false })
  weekly_insights_enabled?: boolean;

  @ApiProperty({ example: false, required: false })
  marketing_emails_enabled?: boolean;
}
