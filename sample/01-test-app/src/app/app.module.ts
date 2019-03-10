import { Module } from '@nestd/core'

/* services */
import { TestService } from './services/test.service'
import { OtherService } from './services/other.service'

@Module({
  services: [TestService, OtherService],
})
export class AppModule {}
