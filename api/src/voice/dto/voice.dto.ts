import { ApiProperty } from '@nestjs/swagger';

export class TextToSpeechDto {
  @ApiProperty({ example: 'Hello, how can I help you today?' })
  text: string;

  @ApiProperty({ example: 'alloy', required: false })
  voice?: string;
}

export class SpeechToTextDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Audio file to transcribe' })
  audio: any;
}
