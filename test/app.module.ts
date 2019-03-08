import { Module } from '../packages/common'

/* services */
import { TestService } from './test.service'
import { OtherService } from './other.service'

@Module({
  providers: [
    TestService,
    OtherService
  ]
})
export class AppModule {}
