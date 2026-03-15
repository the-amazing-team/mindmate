import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { PersonalityType } from '@prisma/client';
import { MailService } from '../mail/mail.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  @Post('sync')
  async syncUser(@Body() data: { email: string; name: string; password?: string; auth_type?: any; onboarding_complete?: boolean }) {
    return this.usersService.create(data);
  }

  @Get('check-email')
  async checkEmail(@Query('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    return { available: !user };
  }

  @Post('login')
  async login(@Body() data: { email: string; password?: string }) {
    const user = await this.usersService.findByEmail(data.email);
    if (!user) {
      throw new Error('User not found');
    }

    if (data.password && user.password_hash) {
      const isValid = await this.usersService.validatePassword(data.password, user.password_hash);
      if (!isValid) {
        throw new Error('Invalid password');
      }
    }

    return user;
  }

  @Post('update-profile')
  async updateProfile(@Body() data: { 
    email: string; 
    age_group: string; 
    personality_type: PersonalityType;
    goals: string[];
    reminders: string;
  }) {
    return this.usersService.updatePersonality(
      data.email, 
      data.age_group, 
      data.personality_type,
      data.goals,
      data.reminders
    );
  }

  @Get(':email')
  async getUser(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Post('send-otp')
  async sendOtp(@Body() data: { email: string }) {
    const otp = await this.usersService.createOtp(data.email);
    await this.mailService.sendOtp(data.email, otp);
    return { success: true };
  }

  @Post('verify-otp')
  async verifyOtp(@Body() data: { email: string; otp: string }) {
    const success = await this.usersService.verifyOtp(data.email, data.otp);
    if (!success) {
      throw new Error('Invalid or expired OTP');
    }
    return { success: true };
  }
}
