import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { CommandModule, CommandService } from 'nestjs-command';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {});

  try {
    await app.select(CommandModule).get(CommandService).exec();
    await app.close();
  } catch (error) {
    console.error(error);
    await app.close();
    process.exit(1);
  }
}

void bootstrap();