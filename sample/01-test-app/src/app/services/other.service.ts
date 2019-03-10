import { Service, OnStart } from '@nestd/core'
import { TestService } from './test.service'

@Service()
export class OtherService implements OnStart {
  constructor(private testService: TestService) {
    this.testService.test()
  }

  public onStart(): void {
    console.log('onStart works!')
  }
}
