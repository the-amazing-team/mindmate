import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class ChatWithContextDto {
  @ApiProperty({ description: 'The question to ask the AI' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ description: 'The context for the chat' })
  @IsString()
  @IsNotEmpty()
  context: string;

  @ApiPropertyOptional({ description: 'The chat history' })
  @IsArray()
  @IsOptional()
  history?: any[];
}
