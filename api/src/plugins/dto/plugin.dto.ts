import { ApiProperty } from '@nestjs/swagger';

export class InstallPluginDto {
  @ApiProperty({ example: 'user-id-123' })
  userId: string;

  @ApiProperty({ example: 'plugin-id-456' })
  pluginId: string;
}
