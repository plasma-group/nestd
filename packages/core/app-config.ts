import { PipeTransform, NesdInterceptor } from '../common';

export class AppConfig {
  private globalPipes: PipeTransform<any>[] = []
  private globalInterceptors: NesdInterceptor[] = []

  public addGlobalPipe(pipe: PipeTransform<any>): void {
    this.globalPipes.push(pipe)
  }

  public addGlobalInterceptor(interceptor: NesdInterceptor): void {
    this.globalInterceptors.push(interceptor)
  }
}
