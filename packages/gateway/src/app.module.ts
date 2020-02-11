import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AppController } from './app.controller';
import { ApiModule } from './api/api.module';
import { SurgioModule } from './surgio/surgio.module';
import { SurgioService } from './surgio/surgio.service';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';

const CWD = process.env.SURGIO_PROJECT_DIR || process.cwd();
const FE_FOLDER = require.resolve('@surgio/gateway-frontend');

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(FE_FOLDER, 'build'),
    }),
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      load: [configuration],
    }),
    SurgioModule.register({
      cwd: CWD,
    }),
    ApiModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [SurgioService],
})
export class AppModule {}
