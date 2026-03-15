import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { PersonalityType } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SyncUserDto } from './dto/sync-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  @Post('sync')
  @ApiOperation({ summary: 'Sync user data (create or update)' })
  @ApiResponse({ status: 201, description: 'User synced successfully' })
  async syncUser(@Body() data: SyncUserDto) {
    return this.usersService.create(data);
  }

  @Get('check-email')
  @ApiOperation({ summary: 'Check if email is available' })
  @ApiQuery({ name: 'email', example: 'test@example.com' })
  @ApiResponse({ status: 200, description: 'Returns availability status' })
  async checkEmail(@Query('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    return { available: !user };
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Invalid password' })
  async login(@Body() data: LoginDto) {
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
  @ApiOperation({ summary: 'Update user profile and personality' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Body() data: UpdateProfileDto) {
    return this.usersService.updatePersonality(
      data.email, 
      data.age_group, 
      data.personality_type,
      data.goals,
      data.reminders
    );
  }

  @Get(':email')
  @ApiOperation({ summary: 'Get user by email' })
  @ApiResponse({ status: 200, description: 'Returns user data' })
  async getUser(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP to email' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async sendOtp(@Body() data: { email: string }) {
    const otp = await this.usersService.createOtp(data.email);
    await this.mailService.sendOtp(data.email, otp);
    return { success: true };
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() data: VerifyOtpDto) {
    const success = await this.usersService.verifyOtp(data.email, data.otp);
    if (!success) {
      throw new Error('Invalid or expired OTP');
    }
    return { success: true };
  }
}
