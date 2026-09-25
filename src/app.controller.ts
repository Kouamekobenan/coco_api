import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Retourne un message de bienvenue.' })
  getHello(): string {
    return this.appService.getHello();
  }
}
