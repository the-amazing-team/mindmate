import { ApiProperty } from '@nestjs/swagger';

export class PipelineDto {
  @ApiProperty({ example: 'A', description: 'Pipeline identifier (A, B, C, or D)' })
  pipeline: string;

  @ApiProperty({ example: {}, description: 'Payload for the pipeline' })
  payload: any;
}
