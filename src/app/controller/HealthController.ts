import { Controller } from '@nestjs/common';

@Controller('health')
export class HealthController {
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
