import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class CreateJournalSectionDto {
  @ApiProperty({ example: 'I felt really good today because...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 0 })
  @IsInt()
  section_order: number;

  @IsString()
  @IsOptional()
  primary_emotion?: string;

  @IsOptional()
  emotion_score?: number;

  @IsString()
  @IsOptional()
  reflection_text?: string;
}

export class CreateJournalDto {
  @ApiProperty({ example: 'userId123' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'A great day', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Happy' })
  @IsString()
  @IsNotEmpty()
  overall_mood: string;

  @ApiProperty({ type: [CreateJournalSectionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJournalSectionDto)
  sections: CreateJournalSectionDto[];
}
