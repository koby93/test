import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlatformModule } from './platform/platform.module';
import { validateEnvironment } from './platform/config/environment';
@Module({ imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../.env'], validate: validateEnvironment }), PlatformModule] })
export class AppModule {}
