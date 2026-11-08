import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service.js';
import { HelloResponseDto } from './dto/hello.response.dto.js';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns a simple message to confirm the API is running.',
  })
  @ApiOkResponse({ type: HelloResponseDto })
  getHello() {
    return this.appService.getHello();
  }
}
