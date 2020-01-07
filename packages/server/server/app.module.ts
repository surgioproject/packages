import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SurgioModule } from './surgio/surgio.module';
import { SurgioService } from './surgio/surgio.service';

@Module({
  imports: [
    SurgioModule.register({
      cwd: '/Users/yihang/Development/own-projects/gen-config',
    }),
  ],
  controllers: [AppController],
  providers: [SurgioService],
})
export class AppModule {}
