import { Service } from "../packages/common";

@Service()
export class TestService {
  public test(): void {
    console.log('Constructor works!')
  }
}

