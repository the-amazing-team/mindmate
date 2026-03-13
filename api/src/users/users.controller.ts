import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { PersonalityType } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sync')
  async syncUser(@Body() data: { email: string; name: string; password_hash: string }) {
    const user = await this.usersService.findByEmail(data.email);
    if (!user) {
      return this.usersService.create(data);
    }
    return user;
  }

  @Post('update-profile')
  async updateProfile(@Body() data: { 
    email: string; 
    age_group: string; 
    personality_type: PersonalityType 
  }) {
    return this.usersService.updatePersonality(
      data.email, 
      data.age_group, 
      data.personality_type
    );
  }

  @Get(':email')
  async getUser(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }
}
