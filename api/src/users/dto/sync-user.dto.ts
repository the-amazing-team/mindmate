import { ApiProperty } from '@nestjs/swagger';
import { AuthType } from '@prisma/client';

export class SyncUserDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe', required: false })
  name?: string;

  @ApiProperty({ example: 'password123', required: false, format: 'password' })
  password?: string;

  @ApiProperty({ enum: AuthType, default: AuthType.EMAIL, required: false })
  auth_type?: AuthType;

  @ApiProperty({ example: false, required: false })
  onboarding_complete?: boolean;
}
