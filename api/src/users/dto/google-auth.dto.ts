import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GoogleAuthDto {
  @ApiProperty({ example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...' })
  idToken: string;

  @ApiPropertyOptional({ example: 'android' })
  platform?: 'android' | 'ios' | 'web';
}
