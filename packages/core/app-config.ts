import { PipeTransform, NestdInterceptor } from '../common';

export class AppConfig {
  private globalPipes: PipeTransform<any>[] = []
  private globalInterceptors: NestdInterceptor[] = []

  public addGlobalPipe(pipe: PipeTransform<any>): void {
    this.globalPipes.push(pipe)
  }

  public addGlobalInterceptor(interceptor: NestdInterceptor): void {
    this.globalInterceptors.push(interceptor)
  }
}
