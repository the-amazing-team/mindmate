import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { PersonalityType } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { SyncUserDto } from './dto/sync-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  @Post('sync')
  @ApiOperation({ summary: 'Create or sync user account', description: 'Creates a new user or returns existing user.' })
  @ApiResponse({ status: 201, description: 'User synced successfully', type: Object })
  async syncUser(@Body() data: SyncUserDto) {
    const user = await this.usersService.create(data);
    const token = this.usersService.generateJwt(user);
    return { user, token };
  }

  @Get('check-email')
  @ApiOperation({ summary: 'Check email availability', description: 'Checks if an email address is available for registration' })
  @ApiQuery({ name: 'email', example: 'user@example.com', description: 'Email address to check' })
  @ApiResponse({ status: 200, description: 'Returns availability status', type: Object })
  async checkEmail(@Query('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    return { available: !user };
  }

  @Post('login')
  @ApiOperation({ summary: 'User login with email and password', description: 'Authenticate user with email and password, returns user data and JWT token' })
  @ApiResponse({ status: 200, description: 'User logged in successfully', type: Object })
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

    const token = this.usersService.generateJwt(user);
    return { user, token };
  }

  @Post('update-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update user profile and personality', description: 'Update user age group, personality type, goals, and reminders.' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: Object })
  async updateProfile(@Body() data: UpdateProfileDto) {
    console.log('Received update-profile request for:', data.email, data);
    return this.usersService.updatePersonality(data);
  }

  @Get(':email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user by email', description: 'Retrieve user profile data by email address' })
  @ApiResponse({ status: 200, description: 'Returns user data', type: Object })
  async getUser(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Post('send-otp')
  @ApiOperation({ summary: 'Send OTP verification code', description: 'Send a 6-digit OTP code to user email for verification' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async sendOtp(@Body() data: { email: string }) {
    const otp = await this.usersService.createOtp(data.email);
    await this.mailService.sendOtp(data.email, otp);
    return { success: true };
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP code', description: 'Verify the 6-digit OTP code sent to user email.' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully', type: Object })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() data: VerifyOtpDto) {
    const success = await this.usersService.verifyOtp(data.email, data.otp);
    if (!success) {
      throw new Error('Invalid or expired OTP');
    }
    return { success: true };
  }

  @Post('auth/google')
  @ApiOperation({ summary: 'Google OAuth2 authentication', description: 'Authenticate with Google OAuth2.' })
  @ApiResponse({ status: 200, description: 'Google authentication successful', type: Object })
  @ApiResponse({ status: 401, description: 'Invalid Google token' })
  async googleAuth(@Body() data: GoogleAuthDto) {
    const result = await this.usersService.authenticateWithGoogle(data.idToken);
    return result;
  }

  @Get('metrics/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user metrics', description: 'Returns streak, total journals, and check-ins count' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved successfully', type: Object })
  async getMetrics(@Param('userId') userId: string) {
    return this.usersService.getMetrics(userId);
  }

  @Post('check-in')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new check-in', description: 'Records user mood and an optional note' })
  @ApiResponse({ status: 201, description: 'Check-in recorded successfully' })
  async createCheckIn(@Body() data: { userId: string; moodScore: number; note?: string }) {
    return this.usersService.createCheckIn(data.userId, data.moodScore, data.note);
  }
}
