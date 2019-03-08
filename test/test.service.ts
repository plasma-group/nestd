import { Injectable } from "../packages/common";

@Injectable()
export class TestService {
  public test(): void {
    console.log('Hello!')
  }
}

