import iterate from 'iterare'

import {
  Type,
  Abstract,
  OnModuleInit,
  OnModuleDestroy,
  OnAppBootstrap,
  INestdAppContext,
} from './interfaces'
import { LoggerService, Logger } from './services'
import { isNil, isUndefined } from './utils'
import { ModuleTokenFactory } from './injector/module-token-factory'
import { ContainerScanner } from './injector/container-scanner'
import { NestdContainer } from './injector/container'
import { Module } from './injector/module'
import { UnknownModuleException } from './errors/exceptions'

export class NestdAppContext implements INestdAppContext {
  private readonly moduleTokenFactory = new ModuleTokenFactory()
  private readonly containerScanner: ContainerScanner

  constructor(
    protected readonly container: NestdContainer,
    private readonly scope: Type<any>[],
    private contextModule: Module
  ) {
    this.containerScanner = new ContainerScanner(container)
  }

  public selectContextModule(): void {
    const modules = this.container.getModules().values()
    this.contextModule = modules.next().value
  }

  public select<T>(module: Type<T>): INestdAppContext {
    const modules = this.container.getModules()
    const moduleMetatype = this.contextModule.metatype
    const scope = this.scope.concat(moduleMetatype)

    const token = this.moduleTokenFactory.create(module, scope)
    const selectedModule = modules.get(token)
    if (!selectedModule) {
      throw new UnknownModuleException()
    }
    return new NestdAppContext(this.container, scope, selectedModule)
  }

  public get<TInput = any, TResult = TInput>(
    typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
    options: { strict: boolean } = { strict: false }
  ): TResult {
    if (!(options && options.strict)) {
      return this.find<TInput, TResult>(typeOrToken)
    }
    return this.findInstanceByPrototypeOrToken<TInput, TResult>(
      typeOrToken,
      this.contextModule
    )
  }

  public async init(): Promise<this> {
    await this.callInitHook()
    await this.callBootstrapHook()
    return this
  }

  public async stop(): Promise<void> {
    await this.callDestroyHook()
  }

  public useLogger(logger: LoggerService): void {
    Logger.overrideLogger(logger)
  }

  protected async callInitHook(): Promise<any> {
    const modulesContainer = this.container.getModules()
    for (const module of [...modulesContainer.values()].reverse()) {
      await this.callModuleInitHook(module)
    }
  }

  protected async callModuleInitHook(module: Module): Promise<any> {
    const providers = [...module.providers]
    const [_, { instance: moduleClassInstance }] = providers.shift()

    await Promise.all(
      iterate(providers)
        .map(([_, { instance }]) => instance)
        .filter((instance) => !isNil(instance))
        .filter(this.hasOnModuleInitHook)
        .map(async (instance) => (instance as OnModuleInit).onModuleInit())
    )
    if (moduleClassInstance && this.hasOnModuleInitHook(moduleClassInstance)) {
      await (moduleClassInstance as OnModuleInit).onModuleInit()
    }
  }

  protected hasOnModuleInitHook(instance: any): instance is OnModuleInit {
    return !isUndefined((instance as OnModuleInit).onModuleInit)
  }

  protected async callDestroyHook(): Promise<any> {
    const modulesContainer = this.container.getModules()
    for (const module of modulesContainer.values()) {
      await this.callModuleDestroyHook(module)
    }
  }

  protected async callModuleDestroyHook(module: Module): Promise<any> {
    const providers = [...module.providers]
    const [_, { instance: moduleClassInstance }] = providers.shift()

    await Promise.all(
      iterate(providers)
        .map(([key, { instance }]) => instance)
        .filter((instance) => !isNil(instance))
        .filter(this.hasOnModuleDestroyHook)
        .map(async (instance) =>
          (instance as OnModuleDestroy).onModuleDestroy()
        )
    )
    if (
      moduleClassInstance &&
      this.hasOnModuleDestroyHook(moduleClassInstance)
    ) {
      await (moduleClassInstance as OnModuleDestroy).onModuleDestroy()
    }
  }

  protected hasOnModuleDestroyHook(instance): instance is OnModuleDestroy {
    return !isUndefined((instance as OnModuleDestroy).onModuleDestroy)
  }

  protected async callBootstrapHook(): Promise<any> {
    const modulesContainer = this.container.getModules()
    for (const module of [...modulesContainer.values()].reverse()) {
      await this.callModuleBootstrapHook(module)
    }
  }

  protected async callModuleBootstrapHook(module: Module): Promise<any> {
    const providers = [...module.providers]
    const [_, { instance: moduleClassInstance }] = providers.shift()

    await Promise.all(
      iterate(providers)
        .map(([key, { instance }]) => instance)
        .filter((instance) => !isNil(instance))
        .filter(this.hasOnAppBotstrapHook)
        .map(async (instance) => (instance as OnAppBootstrap).onAppBootstrap())
    )
    if (moduleClassInstance && this.hasOnAppBotstrapHook(moduleClassInstance)) {
      await (moduleClassInstance as OnAppBootstrap).onAppBootstrap()
    }
  }

  protected hasOnAppBotstrapHook(instance: any): instance is OnAppBootstrap {
    return !isUndefined((instance as OnAppBootstrap).onAppBootstrap)
  }

  protected find<TInput = any, TResult = TInput>(
    typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol
  ): TResult {
    return this.containerScanner.find<TInput, TResult>(typeOrToken)
  }

  protected findInstanceByPrototypeOrToken<TInput = any, TResult = TInput>(
    metatypeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
    contextModule: Partial<Module>
  ): TResult {
    return this.containerScanner.findInstanceByPrototypeOrToken<
      TInput,
      TResult
    >(metatypeOrToken, contextModule)
  }
}
