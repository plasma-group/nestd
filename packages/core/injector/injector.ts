import 'reflect-metadata'

export class Injector {
  public resolve<T>(target: any): T {
    const tokens: any[] = Reflect.getMetadata('design:paramtypes', target) || []
    const injections = tokens.map((token) => {
      return this.resolve<any>(token)
    })

    return new target(...injections)
  }
}
