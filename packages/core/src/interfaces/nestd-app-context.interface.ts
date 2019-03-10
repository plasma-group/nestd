import { Abstract } from './abstract.interface'
import { Type } from './type.interface'
import { LoggerService } from '../services'

export interface INestdAppContext {
  select<T>(module: Type<T>): INestdAppContext
  get<TInput = any, TResult = TInput>(
    typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
    options?: { strict: boolean }
  ): TResult
  stop(): Promise<void>
  useLogger(logger: LoggerService): void
}
