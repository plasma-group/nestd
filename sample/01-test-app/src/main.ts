import { NestdFactory } from '@nestd/core'
import { AppModule } from './app/app.module'

async function bootstrap() {
  const app = await NestdFactory.create(AppModule)
  app.start()
}
bootstrap()
