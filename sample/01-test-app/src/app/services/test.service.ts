import { Service } from '@nestd/core'

@Service()
export class TestService {
  public test(): void {
    console.log('Constructor works!')
  }
}
