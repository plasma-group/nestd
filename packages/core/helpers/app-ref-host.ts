export class AppRefHost {
  private ref: any

  set appRef(appRef: any) {
    this.appRef = appRef
  }

  get appRef(): any {
    return this.ref
  }
}
