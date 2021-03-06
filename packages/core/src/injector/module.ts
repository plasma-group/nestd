import {
  isNil,
  isFunction,
  isUndefined,
  isString,
  isSymbol,
  randomString,
} from '../utils'
import { Injectable, DynamicModule, Type, NestdModule } from '../interfaces'
import { ModuleRef } from './module-ref'
import { NestdContainer, InstanceWrapper } from './container'
import { ModulesContainer } from './modules-container'
import { APP_REF } from './tokens'
import {
  RuntimeException,
  InvalidClassException,
  UnknownExportException,
} from '../errors/exceptions'
import { Reflector } from '../services/reflector.service'
import { AppRefHost } from '../helpers/app-ref-host'

export interface CustomProvider {
  provide: any
  name: string
}
export type OpaqueToken = string | symbol | object | Type<any>
export type CustomClass = CustomProvider & { useClass: Type<any> }
export type CustomFactory = CustomProvider & {
  useFactory: (...args: any) => any
  inject?: OpaqueToken[]
}
export type CustomValue = CustomProvider & { useValue: any }
export type ProviderMetatype =
  | Type<Injectable>
  | CustomClass
  | CustomFactory
  | CustomValue

export class Module {
  private readonly _id: string
  private readonly _relatedModules = new Set<Module>()
  private readonly _providers = new Map<any, InstanceWrapper<Injectable>>()
  private readonly _injectables = new Map<any, InstanceWrapper<Injectable>>()
  private readonly _exports = new Set<string | symbol>()

  constructor(
    private readonly _metatype: Type<any>,
    private readonly _scope: Type<any>[],
    private readonly container: NestdContainer
  ) {
    this.addCoreInjectables(container)
    this._id = randomString()
  }

  get id(): string {
    return this._id
  }

  get scope(): Type<any>[] {
    return this._scope
  }

  get relatedModules(): Set<Module> {
    return this._relatedModules
  }

  get providers(): Map<string, InstanceWrapper<Injectable>> {
    return this._providers
  }

  get exports(): Set<string | symbol> {
    return this._exports
  }

  get instance(): NestdModule {
    if (!this._providers.has(this._metatype.name)) {
      throw new RuntimeException()
    }
    const module = this._providers.get(this._metatype.name)
    return module.instance as NestdModule
  }

  get metatype(): Type<any> {
    return this._metatype
  }

  public addCoreInjectables(container: NestdContainer): void {
    this.addModuleAsProvider()
    this.addModuleRef()
    this.addReflector(container.getReflector())
    this.addAppRef(container.getAppRef())
    this.addModulesContainer(container.getModulesContainer())
    this.addAppRefHost(container.getAppRefHost())
  }

  public addModuleRef(): void {
    const moduleRef = this.createModuleRefMetatype()
    this._providers.set(ModuleRef.name, {
      name: ModuleRef.name,
      metatype: ModuleRef as any,
      isResolved: true,
      instance: new moduleRef(),
    })
  }

  public addModuleAsProvider(): void {
    this._providers.set(this._metatype.name, {
      name: this._metatype.name,
      metatype: this._metatype,
      isResolved: false,
      instance: null,
    })
  }

  public addReflector(reflector: Reflector): void {
    this._providers.set(Reflector.name, {
      name: Reflector.name,
      metatype: Reflector,
      isResolved: true,
      instance: reflector,
    })
  }

  public addAppRef(appRef: any): void {
    this._providers.set(APP_REF, {
      name: APP_REF,
      metatype: {} as any,
      isResolved: true,
      instance: appRef || {},
    })
  }

  public addModulesContainer(modulesContainer: ModulesContainer): void {
    this._providers.set(ModulesContainer.name, {
      name: ModulesContainer.name,
      metatype: ModulesContainer,
      isResolved: true,
      instance: modulesContainer,
    })
  }

  public addAppRefHost(appRefHost: AppRefHost): void {
    this._providers.set(AppRefHost.name, {
      name: AppRefHost.name,
      metatype: AppRefHost,
      isResolved: true,
      instance: appRefHost,
    })
  }

  public addInjectable(injectable: Type<Injectable>): void {
    this._injectables.set(injectable.name, {
      name: injectable.name,
      metatype: injectable,
      isResolved: false,
      instance: null,
    })
  }

  public addProvider(provider: ProviderMetatype): string {
    if (this.isCustomProvider(provider)) {
      return this.addCustomProvider(provider, this._providers)
    }

    this._providers.set((provider as Type<Injectable>).name, {
      name: (provider as Type<Injectable>).name,
      metatype: provider as Type<Injectable>,
      isResolved: false,
      instance: null,
    })

    return (provider as Type<Injectable>).name
  }

  public isCustomProvider(
    provider: ProviderMetatype
  ): provider is CustomClass | CustomFactory | CustomValue {
    return !isNil((provider as CustomProvider).provide)
  }

  public addCustomProvider(
    provider: CustomClass | CustomFactory | CustomValue,
    collection: Map<string, any>
  ): string {
    const { provide } = provider
    const name = isFunction(provide) ? provide.name : provide
    const providerWithName = {
      ...provider,
      name,
    }

    if (this.isCustomClass(providerWithName)) {
      this.addCustomClass(providerWithName, collection)
    } else if (this.isCustomFactory(providerWithName)) {
      this.addCustomFactory(providerWithName, collection)
    } else if (this.isCustomValue(providerWithName)) {
      this.addCustomValue(providerWithName, collection)
    }

    return name
  }

  public isCustomClass(provider: any): provider is CustomClass {
    return !isUndefined((provider as CustomClass).useClass)
  }

  public isCustomFactory(provider: any): provider is CustomFactory {
    return !isUndefined((provider as CustomFactory).useFactory)
  }

  public isCustomValue(provider: any): provider is CustomValue {
    return !isUndefined((provider as CustomValue).useValue)
  }

  public isDynamicModule(exported: any): exported is DynamicModule {
    return exported && exported.module
  }

  public addCustomClass(
    provider: CustomClass,
    collection: Map<string, any>
  ): void {
    const { name, useClass } = provider
    collection.set(name, {
      name,
      metatype: useClass,
      isResolved: false,
      instance: null,
    })
  }

  public addCustomFactory(
    provider: CustomFactory,
    collection: Map<string, any>
  ): void {
    const { name, useFactory: factory, inject } = provider
    collection.set(name, {
      name,
      metatype: factory as any,
      instance: null,
      isResolved: false,
      inject: inject || [],
      isNotMetatype: true,
    })
  }

  public addCustomValue(
    provider: CustomValue,
    collection: Map<string, any>
  ): void {
    const { name, useValue: value } = provider
    collection.set(name, {
      name,
      metatype: null,
      instance: value,
      isResolved: true,
      isNotMetatype: true,
      async: value instanceof Promise,
    })
  }

  public addExportedProvider(
    exported: ProviderMetatype | string | symbol | DynamicModule
  ): void {
    const addExportedUnit = (token: string | symbol) => {
      this._exports.add(this.validateExportedProvider(token))
    }

    if (this.isCustomProvider(exported as any)) {
      return this.addCustomExportedProvider(exported as any)
    } else if (isString(exported) || isSymbol(exported)) {
      return addExportedUnit(exported)
    } else if (this.isDynamicModule(exported)) {
      const { module } = exported
      return addExportedUnit(module.name)
    }

    addExportedUnit(exported.name)
  }

  public addCustomExportedProvider(
    exported: CustomClass | CustomFactory | CustomValue
  ): void {
    const provide = exported.provide
    if (isString(provide) || isSymbol(provide)) {
      this._exports.add(this.validateExportedProvider(provide))
      return
    }
    this._exports.add(this.validateExportedProvider(provide.name))
  }

  public validateExportedProvider(token: string | symbol): string | symbol {
    if (this._providers.has(token)) {
      return token
    }

    const imported = [...this._relatedModules.values()]
    const importedRefNames = imported
      .filter((item) => item)
      .map(({ metatype }) => metatype)
      .filter((metatype) => metatype)
      .map(({ name }) => name)

    if (!importedRefNames.includes(token as any)) {
      const { name } = this.metatype
      throw new UnknownExportException(name)
    }

    return token
  }

  public addRelatedModule(relatedModule: Module): void {
    this._relatedModules.add(relatedModule)
  }

  public createModuleRefMetatype(): any {
    const self = this
    return class extends ModuleRef {
      constructor() {
        super(self.container)
      }

      public get<TInput = any, TResult = TInput>(
        typeOrToken: Type<TInput> | string | symbol,
        options: { strict: boolean } = { strict: true }
      ): TResult {
        if (!(options && options.strict)) {
          return this.find<TInput, TResult>(typeOrToken)
        }
        return this.findInstanceByPrototypeOrToken<TInput, TResult>(
          typeOrToken,
          self
        )
      }

      public async create<T = any>(type: Type<T>): Promise<T> {
        if (!(type && isFunction(type) && type.prototype)) {
          throw new InvalidClassException(type)
        }
        return this.instantiateClass<T>(type, self)
      }
    }
  }
}
