import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ScheduleCheckinDto {
  @ApiProperty({ description: 'The context for scheduling a check-in' })
  @IsString()
  @IsNotEmpty()
  context: string;
}
