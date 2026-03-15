import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PluginService } from './plugin.service';

@Controller('plugins')
export class PluginController {
  constructor(private readonly pluginService: PluginService) {}

  @Get()
  async getAllPlugins() {
    return this.pluginService.getAllPlugins();
  }

  @Get('installed/:userId')
  async getInstalledPlugins(@Param('userId') userId: string) {
    return this.pluginService.getInstalledPlugins(userId);
  }

  @Post('install')
  async installPlugin(@Body() data: { userId: string, pluginId: string }) {
    return this.pluginService.installPlugin(data.userId, data.pluginId);
  }
}
