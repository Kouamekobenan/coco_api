import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Message de bienvenue' })
  @ApiResponse({ status: 200, description: 'Retourne un message de bienvenue.' })
  getHello(): string {
    return this.appService.getHello();
  }
}
