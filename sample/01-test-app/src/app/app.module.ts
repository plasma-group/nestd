import { Module } from '@nestd/common'

/* services */
import { TestService } from './services/test.service'
import { OtherService } from './services/other.service'

@Module({
  services: [
    TestService,
    OtherService
  ]
})
export class AppModule {}
