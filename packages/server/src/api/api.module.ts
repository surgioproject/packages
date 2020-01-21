import { Module } from '@nestjs/common';
import { SurgioService } from '../surgio/surgio.service';
import { ApiController } from './api.controller';

@Module({
  controllers: [ApiController],
  providers: [SurgioService],
})
export class ApiModule {}
