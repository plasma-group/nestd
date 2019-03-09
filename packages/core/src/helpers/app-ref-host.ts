export class AppRefHost {
  private ref: any

  set appRef(ref: any) {
    this.ref = ref
  }

  get appRef(): any {
    return this.ref
  }
}
