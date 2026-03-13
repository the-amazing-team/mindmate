import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): object {
    return { status: 'ok' };
  }

  @Post('chat')
  async chat(@Body() body: { messages: { role: string; content: string }[] }) {
    // Mock response for now
    const responses = [
      "I hear you. That sounds challenging. What's one small step you could take today?",
      "Your feelings are valid. Let's explore this together. What triggered this for you?",
      "That's a great insight. How does that make you feel about your progress?",
      "I'm here with you. Take a deep breath. What would help you right now?",
    ];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    return { content: [{ text: randomResponse }] };
  }
}
