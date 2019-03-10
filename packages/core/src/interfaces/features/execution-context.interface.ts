import { Type } from '../type.interface'
import { ArgumentsHost } from './arguments-host.interface'

export interface ExecutionContext extends ArgumentsHost {
  getClass<T = any>(): Type<T>
  getHandler(): Function
}
