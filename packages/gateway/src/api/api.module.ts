import { Module } from '@nestjs/common';

import { ApiController } from './api.controller';
import { SurgioService } from '../surgio/surgio.service';

@Module({
  controllers: [ApiController],
  providers: [SurgioService],
})
export class ApiModule {}
