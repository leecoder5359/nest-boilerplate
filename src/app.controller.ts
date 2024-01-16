import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('/ecs')
  ecsTest(): string {
    return 'ecs up!';
  }
}
