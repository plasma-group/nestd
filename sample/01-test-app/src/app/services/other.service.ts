import { Service, OnStart } from '@nestd/common'
import { TestService } from './test.service'

@Service()
export class OtherService implements OnStart {
  constructor(private testService: TestService) {
    this.testService.test()
  }

  onStart(): void {
    console.log('onStart works!')
  }
}
