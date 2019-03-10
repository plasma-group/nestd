import { ForwardReference, DynamicModule, Type, Injectable } from './interfaces'
import { METADATA, PROVIDERS_METADATA } from './constants'
import { isNil, isUndefined, randomString } from './utils'
import { AppConfig } from './app-config'
import { MetadataScanner } from './metadata-scanner'
import { NestdContainer } from './injector/container'
import { CircularDependencyException } from './errors/exceptions'

interface ApplicationProviderWrapper {
  moduleKey: string
  providerKey: string
  type: string
}

export class DependencyScanner {
  private readonly applicationProvidersApplyMap: ApplicationProviderWrapper[] = []
  constructor(
    private readonly container: NestdContainer,
    private readonly metadataScanner: MetadataScanner,
    private readonly appConfig = new AppConfig()
  ) {}

  public async scan(module: Type<any>) {
    await this.scanForModules(module)
    await this.scanModulesForDependencies()
    this.container.bindGlobalScope()
  }

  public async scanForModules(
    module: ForwardReference | Type<any> | DynamicModule,
    scope: Type<any>[] = [],
    ctxRegistry: (ForwardReference | DynamicModule | Type<any>)[] = []
  ): Promise<void> {
    await this.storeModule(module, scope)
    ctxRegistry.push(module)

    if (this.isForwardReference(module)) {
      module = (module as ForwardReference).forwardRef()
    }

    const modules = !this.isDynamicModule(module as Type<any> | DynamicModule)
      ? this.reflectMetadata(module, METADATA.MODULES)
      : [
          ...this.reflectMetadata(
            (module as DynamicModule).module,
            METADATA.MODULES
          ),
          ...((module as DynamicModule).imports || []),
        ]

    for (const innerModule of modules) {
      if (ctxRegistry.includes(innerModule)) {
        continue
      }

      await this.scanForModules(
        innerModule,
        [].concat(scope, module),
        ctxRegistry
      )
    }
  }

  public async storeModule(module: any, scope: Type<any>[]): Promise<void> {
    if (module && module.forwardRef) {
      return this.container.addModule(module.forwardRef(), scope)
    }

    return this.container.addModule(module, scope)
  }

  public async scanModulesForDependencies() {
    const modules = this.container.getModules()

    for (const [token, { metatype }] of modules) {
      await this.reflectRelatedModules(metatype, token, metatype.name)
      this.reflectProviders(metatype, token)
      this.reflectExports(metatype, token)
    }
  }

  public async reflectRelatedModules(
    module: Type<any>,
    token: string,
    context: string
  ): Promise<void> {
    const modules = [
      ...this.reflectMetadata(module, METADATA.MODULES),
      ...this.container.getDynamicMetadataByToken(
        token,
        METADATA.MODULES as 'module'
      ),
      ...this.container.getDynamicMetadataByToken(
        token,
        METADATA.IMPORTS as 'imports'
      ),
    ]

    for (const related of modules) {
      await this.storeRelatedModule(related, token, context)
    }
  }

  public async reflectProviders(
    module: Type<any>,
    token: string
  ): Promise<void> {
    const providers = [
      ...this.reflectMetadata(module, METADATA.SERVICES),
      ...this.container.getDynamicMetadataByToken(
        token,
        METADATA.SERVICES as 'services'
      ),
    ]

    for (const provider of providers) {
      this.storeProvider(provider, token)
      this.reflectProviderMetadata(provider, token)
    }
  }

  public reflectProviderMetadata(
    provider: Type<Injectable>,
    token: string
  ): void {
    const metadata = this.reflectMetadata(provider, PROVIDERS_METADATA)

    for (const data of metadata) {
      this.storeProvider(data, token)
    }
  }

  public reflectExports(module: Type<any>, token: string): void {
    const exports = [
      ...this.reflectMetadata(module, METADATA.EXPORTS),
      ...this.container.getDynamicMetadataByToken(
        token,
        METADATA.EXPORTS as 'exports'
      ),
    ]

    for (const exported of exports) {
      this.storeExportedComponent(exported, token)
    }
  }

  public reflectKeyMetadata(
    component: Type<Injectable>,
    key: string,
    method: string
  ): any {
    let prototype = component.prototype

    do {
      const descriptor = Reflect.getOwnPropertyDescriptor(prototype, method)
      if (!descriptor) {
        continue
      }

      return Reflect.getMetadata(key, descriptor.value)
    } while (
      (prototype = Reflect.getPrototypeOf(prototype)) &&
      prototype !== Object.prototype &&
      prototype
    )

    return undefined
  }

  public async storeRelatedModule(
    related: any,
    token: string,
    context: string
  ): Promise<void> {
    if (isUndefined(related)) {
      throw new CircularDependencyException(context)
    }
    if (related && related.forwardRef) {
      return this.container.addRelatedModule(related.forwardRef(), token)
    }
    return this.container.addRelatedModule(related, token)
  }

  public storeProvider(provider: any, token: string): void {
    const isCustomProvider = provider && !isNil(provider.provide)
    if (!isCustomProvider) {
      this.container.addProvider(provider, token)
      return
    }

    const applyProvidersMap = this.getApplyProvidersMap()
    const providersKeys = Object.keys(applyProvidersMap)
    const type = provider.provide
    if (!providersKeys.includes(type)) {
      this.container.addProvider(provider, token)
      return
    }

    const providerToken = randomString()
    this.applicationProvidersApplyMap.push({
      type,
      moduleKey: token,
      providerKey: providerToken,
    })
    this.container.addProvider(
      {
        ...provider,
        provide: providerToken,
      },
      token
    )
  }

  public storeExportedComponent(
    exported: Type<Injectable>,
    token: string
  ): void {
    this.container.addExportedComponent(exported, token)
  }

  public reflectMetadata(metatype: any, metadataKey: string): any {
    return Reflect.getMetadata(metadataKey, metatype) || []
  }

  public applyApplicationProviders() {
    const applyProvidersMap = this.getApplyProvidersMap()
    for (const { moduleKey, providerKey, type } of this
      .applicationProvidersApplyMap) {
      const modules = this.container.getModules()
      const { providers } = modules.get(moduleKey)
      const { instance } = providers.get(providerKey)

      applyProvidersMap[type](instance)
    }
  }

  public getApplyProvidersMap(): { [type: string]: Function } {
    return {}
  }

  public isDynamicModule(
    module: Type<any> | DynamicModule
  ): module is DynamicModule {
    return module && !!(module as DynamicModule).module
  }

  public isForwardReference(
    module: Type<any> | DynamicModule | ForwardReference
  ): module is ForwardReference {
    return module && !!(module as ForwardReference).forwardRef
  }
}
