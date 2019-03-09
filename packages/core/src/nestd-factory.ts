import { INestdApp } from '@nestd/common'
import { isNil, isFunction } from '@nestd/common/utils/shared.utils'
import { Logger } from '@nestd/common/services/logger.service'
import { NestdAppContextOptions } from '@nestd/common/interfaces/nestd-app-context-options.interface'
import { NestdAppOptions } from '@nestd/common/interfaces/nestd-app-options.interface'
import { INestdAppContext } from '@nestd/common/interfaces/nestd-app-context.interface'

import { AppConfig } from './app-config'
import { MetadataScanner } from './metadata-scanner'
import { DependencyScanner } from './dependency-scanner'
import { NestdAppContext } from './nestd-app-context'
import { NestdApp } from './nestd-app'
import { MESSAGES } from './constants'
import { NestdContainer } from './injector/container'
import { InstanceLoader } from './injector/instance-loader'
import { ExceptionsZone } from './errors/exceptions-zone'

export class NestdFactoryStatic {
  private readonly logger = new Logger('NestFactory', true)

  public async create(
    module: any,
    options?: NestdAppOptions
  ): Promise<INestdApp> {
    const appConfig = new AppConfig()
    const container = new NestdContainer(appConfig)

    this.applyLogger(options)
    await this.initialize(module, container, appConfig)
    return this.createNestdInstance<NestdApp>(
      new NestdApp(container, appConfig, options)
    )
  }

  public async createAppContext(
    module: any,
    options?: NestdAppContextOptions
  ): Promise<INestdAppContext> {
    const container = new NestdContainer()

    this.applyLogger(options)
    await this.initialize(module, container)

    const modules = container.getModules().values()
    const root = modules.next().value
    const context = this.createNestdInstance<NestdAppContext>(
      new NestdAppContext(container, [], root)
    )
    return context.init()
  }

  private createNestdInstance<T>(instance: T): T {
    return this.createProxy(instance)
  }

  private async initialize(
    module: any,
    container: NestdContainer,
    config = new AppConfig(),
    app: any = null
  ) {
    const instanceLoader = new InstanceLoader(container)
    const dependenciesScanner = new DependencyScanner(
      container,
      new MetadataScanner(),
      config
    )
    container.setAppRef(app)
    try {
      this.logger.log(MESSAGES.APPLICATION_START)
      await ExceptionsZone.asyncRun(async () => {
        await dependenciesScanner.scan(module)
        await instanceLoader.createInstancesOfDependencies()
        dependenciesScanner.applyApplicationProviders()
      })
    } catch (e) {
      process.abort()
    }
  }

  private createProxy(target: any): any {
    const proxy = this.createExceptionProxy()
    return new Proxy(target, {
      get: proxy,
      set: proxy,
    })
  }

  private createExceptionProxy(): any {
    return (receiver: any, prop: any) => {
      if (!(prop in receiver)) {
        return
      }

      if (isFunction(receiver[prop])) {
        return (...args: any) => {
          let result: any
          ExceptionsZone.run(() => {
            result = receiver[prop](...args)
          })
          return result
        }
      }
      return receiver[prop]
    }
  }

  private applyLogger(options: NestdAppContextOptions | undefined): void {
    if (!options) {
      return
    }
    !isNil(options.logger) && Logger.overrideLogger(options.logger)
  }
}

export const NestdFactory = new NestdFactoryStatic()
