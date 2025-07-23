import { Public } from '@/auth/decorator/public.decorator';
import { Controller, Get } from '@nestjs/common';

@Public()
@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
