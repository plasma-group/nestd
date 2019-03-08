import { Injectable } from "../packages/common";
import { TestService } from "./test.service";

@Injectable()
export class OtherService {
  constructor(private testService: TestService) {
    this.testService.test()
  }
}
