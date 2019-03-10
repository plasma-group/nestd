import * as clc from 'cli-color'
import { Service, Optional } from '../decorators'
import { NestdEnvironment } from '../enums'
import { isObject } from '../utils'

declare const process: any

export interface LoggerService {
  log(message: any, context?: string): void
  error(message: any, trace?: string, context?: string): void
  warn(message: any, context?: string): void
}

@Service()
export class Logger implements LoggerService {
  private static prevTimestamp?: number
  private static contextEnvironment = NestdEnvironment.RUN
  private static logger?: typeof Logger | LoggerService = Logger
  private static readonly yellow = clc.xterm(3)

  constructor(
    @Optional() private readonly context?: string,
    @Optional() private readonly isTimeDiffEnabled = false
  ) {}

  public log(message: any, context?: string): void {
    const { logger } = Logger
    if (logger === this) {
      Logger.log(message, context || this.context, this.isTimeDiffEnabled)
      return
    }
    logger && logger.log.call(logger, message, context || this.context)
  }

  public error(message: any, trace = '', context?: string): void {
    const { logger } = Logger
    if (logger === this) {
      Logger.error(message, trace, context || this.context)
      return
    }
    logger && logger.error.call(logger, message, trace, context || this.context)
  }

  public warn(message: any, context?: string): void {
    const { logger } = Logger
    if (logger === this) {
      Logger.warn(message, context || this.context, this.isTimeDiffEnabled)
      return
    }
    logger && logger.warn.call(logger, message, context || this.context)
  }

  public static overrideLogger(logger: LoggerService | boolean): void {
    this.logger = logger ? (logger as LoggerService) : undefined
  }

  public static setMode(mode: NestdEnvironment): void {
    this.contextEnvironment = mode
  }

  public static log(
    message: any,
    context = '',
    isTimeDiffEnabled = true
  ): void {
    this.printMessage(message, clc.green, context, isTimeDiffEnabled)
  }

  public static error(
    message: any,
    trace = '',
    context = '',
    isTimeDiffEnabled = true
  ): void {
    this.printMessage(message, clc.red, context, isTimeDiffEnabled)
    this.printStackTrace(trace)
  }

  public static warn(
    message: any,
    context = '',
    isTimeDiffEnabled = true
  ): void {
    this.printMessage(message, clc.yellow, context, isTimeDiffEnabled)
  }

  protected static isActive(): boolean {
    return Logger.contextEnvironment !== NestdEnvironment.TEST
  }

  private static printMessage(
    message: any,
    color: (message: string) => string,
    context: string = '',
    isTimeDiffEnabled?: boolean
  ): void {
    if (!this.isActive()) {
      return
    }
    const output = isObject(message)
      ? JSON.stringify(message, null, 2)
      : message
    process.stdout.write(color(`[Nest] ${process.pid}   - `))
    process.stdout.write(`${new Date(Date.now()).toLocaleString()}   `)

    context && process.stdout.write(this.yellow(`[${context}] `))
    process.stdout.write(color(output))

    this.printTimestamp(isTimeDiffEnabled)
    process.stdout.write(`\n`)
  }

  private static printTimestamp(isTimeDiffEnabled?: boolean): void {
    const includeTimestamp = Logger.prevTimestamp && isTimeDiffEnabled
    if (includeTimestamp) {
      process.stdout.write(
        this.yellow(` +${Date.now() - Logger.prevTimestamp}ms`)
      )
    }
    Logger.prevTimestamp = Date.now()
  }

  private static printStackTrace(trace: string): void {
    if (!this.isActive() || !trace) {
      return
    }
    process.stdout.write(trace)
    process.stdout.write(`\n`)
  }
}
