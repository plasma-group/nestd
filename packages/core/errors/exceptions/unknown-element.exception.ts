import { RuntimeException } from './runtime.exception'

export class UnknownElementException extends RuntimeException {
  constructor() {
    super(
      'Nesd cannot find element (it does not exist in current context)',
    )
  }
}
