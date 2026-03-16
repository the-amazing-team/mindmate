import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateInsightsDto {
  @ApiProperty({ description: 'The context for generating insights' })
  @IsString()
  @IsNotEmpty()
  context: string;
}
