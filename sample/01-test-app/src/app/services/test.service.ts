import { Service } from '@nestd/common'

@Service()
export class TestService {
  public test(): void {
    console.log('Constructor works!')
  }
}
