import { RuntimeException } from './runtime.exception'

export class UnknownModuleException extends RuntimeException {
  constructor() {
    super(
      'Nesd cannot select given module (it does not exist in current context)',
    )
  }
}
