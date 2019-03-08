import { NestdFactory } from '../packages/core'
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestdFactory.create(AppModule);
  app.start()
}
bootstrap();
