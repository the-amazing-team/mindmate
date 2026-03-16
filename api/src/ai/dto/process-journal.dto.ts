import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ProcessJournalDto {
  @ApiProperty({ description: 'The content of the journal' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
