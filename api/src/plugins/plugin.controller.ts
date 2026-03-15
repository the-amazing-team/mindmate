import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PluginService } from './plugin.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InstallPluginDto } from './dto/plugin.dto';

@ApiTags('Plugins')
@Controller('plugins')
export class PluginController {
  constructor(private readonly pluginService: PluginService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available plugins' })
  @ApiResponse({ status: 200, description: 'Returns list of plugins' })
  async getAllPlugins() {
    return this.pluginService.getAllPlugins();
  }

  @Get('installed/:userId')
  @ApiOperation({ summary: 'Get plugins installed by a user' })
  @ApiParam({ name: 'userId', example: 'user-id-123' })
  @ApiResponse({ status: 200, description: 'Returns list of installed plugins' })
  async getInstalledPlugins(@Param('userId') userId: string) {
    return this.pluginService.getInstalledPlugins(userId);
  }

  @Post('install')
  @ApiOperation({ summary: 'Install a plugin for a user' })
  @ApiResponse({ status: 201, description: 'Plugin installed successfully' })
  async installPlugin(@Body() data: InstallPluginDto) {
    return this.pluginService.installPlugin(data.userId, data.pluginId);
  }
}
