import { Module } from '../packages/common'

/* services */
import { TestService } from './test.service'

@Module({
  providers: [TestService]
})
export class AppModule {}
