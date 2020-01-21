import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ApiModule } from './api/api.module';
import { SurgioModule } from './surgio/surgio.module';
import { SurgioService } from './surgio/surgio.service';

@Module({
  imports: [
    SurgioModule.register({
      cwd: process.env.SURGIO_PROJECT_DIR || process.cwd(),
    }),
    ApiModule,
  ],
  controllers: [AppController],
  providers: [SurgioService],
})
export class AppModule {}
