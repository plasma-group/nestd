import {
  OPTIONAL_DEPS_METADATA,
  PARAMTYPES_METADATA,
  SELF_DECLARED_DEPS_METADATA,
  PROPERTY_DEPS_METADATA,
  OPTIONAL_PROPERTY_DEPS_METADATA,
} from '../constants'
import { isNil, isUndefined, isFunction, isObject } from '../utils'
import { Injectable, Type } from '../interfaces'
import { InstanceWrapper } from './container'
import { Module } from './module'
import {
  RuntimeException,
  UnknownDependenciesException,
  UndefinedDependencyException,
} from '../errors/exceptions'

export type InjectorDependency = Type<any> | Function | string | symbol

export interface PropertyDependency {
  key: string
  name: InjectorDependency
  isOptional?: boolean
  instance?: any
}

export interface InjectorDependencyContext {
  key?: string | symbol
  name?: string
  index?: number
  dependencies?: InjectorDependency[]
}

export class Injector {
  public loadPrototypeOfInstance<T>(
    { metatype, name }: InstanceWrapper<T>,
    collection: Map<string, InstanceWrapper<T>>
  ): void {
    if (!collection) {
      return
    }
    const target = collection.get(name)
    if (target.isResolved || !isNil(target.inject) || !metatype.prototype) {
      return
    }
    collection.set(name, {
      ...collection.get(name),
      instance: Object.create(metatype.prototype),
    })
  }

  public async loadInstanceOfProvider(
    wrapper: InstanceWrapper<Injectable>,
    module: Module
  ): Promise<void> {
    const providers = module.providers
    await this.loadInstance<Injectable>(wrapper, providers, module)
  }

  public applyDoneHook<T>(wrapper: InstanceWrapper<T>): () => void {
    let done: () => void
    wrapper.done$ = new Promise<void>((resolve, reject) => {
      done = resolve
    })
    wrapper.isPending = true
    return done
  }

  public async loadInstance<T>(
    wrapper: InstanceWrapper<T>,
    collection: Map<string, InstanceWrapper<any>>,
    module: Module
  ): Promise<void> {
    if (wrapper.isPending) {
      return wrapper.done$
    }
    const done = this.applyDoneHook(wrapper)
    const { name, inject } = wrapper

    const targetWrapper = collection.get(name)
    if (isUndefined(targetWrapper)) {
      throw new RuntimeException()
    }
    if (targetWrapper.isResolved) {
      return
    }
    const callback = async (instances: any[]) => {
      const properties = await this.resolveProperties(wrapper, module, inject)
      const instance = await this.instantiateClass(
        instances,
        wrapper,
        targetWrapper
      )
      this.applyProperties(instance, properties)
      done()
    }
    await this.resolveConstructorParams<T>(wrapper, module, inject, callback)
  }

  public async resolveConstructorParams<T>(
    wrapper: InstanceWrapper<T>,
    module: Module,
    inject: InjectorDependency[],
    callback: (args: any) => void
  ): Promise<void> {
    const dependencies = isNil(inject)
      ? this.reflectConstructorParams(wrapper.metatype)
      : inject
    const optionalDependenciesIds = isNil(inject)
      ? this.reflectOptionalParams(wrapper.metatype)
      : []

    let isResolved = true
    const instances = await Promise.all(
      dependencies.map(async (param, index) => {
        try {
          const paramWrapper = await this.resolveSingleParam<T>(
            wrapper,
            param,
            { index, dependencies },
            module
          )
          if (!paramWrapper.isResolved && !paramWrapper.forwardRef) {
            isResolved = false
          }
          return paramWrapper.instance
        } catch (err) {
          const isOptional = optionalDependenciesIds.includes(index)
          if (!isOptional) {
            throw err
          }
          return
        }
      })
    )
    isResolved && (await callback(instances))
  }

  public reflectConstructorParams<T>(type: Type<T>): any[] {
    const paramtypes = Reflect.getMetadata(PARAMTYPES_METADATA, type) || []
    const selfParams = this.reflectSelfParams<T>(type)

    for (const { index, param } of selfParams) {
      paramtypes[index] = param
    }

    return paramtypes
  }

  public reflectOptionalParams<T>(type: Type<T>): any[] {
    return Reflect.getMetadata(OPTIONAL_DEPS_METADATA, type) || []
  }

  public reflectSelfParams<T>(type: Type<T>): any[] {
    return Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, type) || []
  }

  public async resolveSingleParam<T>(
    wrapper: InstanceWrapper<T>,
    param: Type<any> | string | symbol | any,
    dependencyContext: InjectorDependencyContext,
    module: Module
  ): Promise<any> {
    if (isUndefined(param)) {
      throw new UndefinedDependencyException(
        wrapper.name,
        dependencyContext,
        module
      )
    }
    const token = this.resolveParamToken(wrapper, param)
    return this.resolveProviderInstance<T>(
      module,
      isFunction(token) ? (token as Type<any>).name : token,
      dependencyContext,
      wrapper
    )
  }

  public resolveParamToken<T>(
    wrapper: InstanceWrapper<T>,
    param: Type<any> | string | symbol | any
  ): any {
    if (!param.forwardRef) {
      return param
    }
    wrapper.forwardRef = true
    return param.forwardRef()
  }

  public async resolveProviderInstance<T>(
    module: Module,
    name: any,
    dependencyContext: InjectorDependencyContext,
    wrapper: InstanceWrapper<T>
  ): Promise<any> {
    const providers = module.providers
    const instanceWrapper = await this.lookupProvider(
      providers,
      module,
      { ...dependencyContext, name },
      wrapper
    )
    if (!instanceWrapper.isResolved && !instanceWrapper.forwardRef) {
      await this.loadInstanceOfProvider(instanceWrapper, module)
    }
    if (instanceWrapper.async) {
      instanceWrapper.instance = await instanceWrapper.instance
    }
    return instanceWrapper
  }

  public async lookupProvider<T = any>(
    providers: Map<string, any>,
    module: Module,
    dependencyContext: InjectorDependencyContext,
    wrapper: InstanceWrapper<T>
  ): Promise<any> {
    const { name } = dependencyContext
    const scanInExports = () => {
      return this.lookupProviderInExports(dependencyContext, module, wrapper)
    }
    return providers.has(name) ? providers.get(name) : scanInExports()
  }

  public async lookupProviderInExports<T = any>(
    dependencyContext: InjectorDependencyContext,
    module: Module,
    wrapper: InstanceWrapper<T>
  ): Promise<any> {
    const instanceWrapper = await this.lookupProviderInRelatedModules(
      module,
      dependencyContext.name
    )
    if (isNil(instanceWrapper)) {
      throw new UnknownDependenciesException(
        wrapper.name,
        dependencyContext,
        module
      )
    }
    return instanceWrapper
  }

  public async lookupProviderInRelatedModules(
    module: Module,
    name: any,
    moduleRegistry = []
  ): Promise<any> {
    let providerRef = null

    const relatedModules: Set<Module> = module.relatedModules || new Set()
    const children = [...relatedModules.values()].filter((item) => item)
    for (const relatedModule of children) {
      if (moduleRegistry.includes(relatedModule.id)) {
        continue
      }
      moduleRegistry.push(relatedModule.id)
      const { providers, exports } = relatedModule
      if (!exports.has(name) || !providers.has(name)) {
        const instanceRef = await this.lookupProviderInRelatedModules(
          relatedModule,
          name,
          moduleRegistry
        )
        if (instanceRef) {
          return instanceRef
        }
        continue
      }
      providerRef = providers.get(name)
      if (!providerRef.isResolved && !providerRef.forwardRef) {
        await this.loadInstanceOfProvider(providerRef, relatedModule)
        break
      }
    }
    return providerRef
  }

  public async resolveProperties<T>(
    wrapper: InstanceWrapper<T>,
    module: Module,
    inject?: InjectorDependency[]
  ): Promise<PropertyDependency[]> {
    if (!isNil(inject)) {
      return []
    }
    const properties = this.reflectProperties(wrapper.metatype)
    const instances = await Promise.all(
      properties.map(async (item: PropertyDependency) => {
        try {
          const dependencyContext = {
            key: item.key,
            name: item.name as string,
          }
          const paramWrapper = await this.resolveSingleParam<T>(
            wrapper,
            item.name,
            dependencyContext,
            module
          )
          return (paramWrapper && paramWrapper.instance) || undefined
        } catch (err) {
          if (!item.isOptional) {
            throw err
          }
          return undefined
        }
      })
    )
    return properties.map((item: PropertyDependency, index: number) => ({
      ...item,
      instance: instances[index],
    }))
  }

  public reflectProperties<T>(type: Type<T>): PropertyDependency[] {
    const properties = Reflect.getMetadata(PROPERTY_DEPS_METADATA, type) || []
    const optionalKeys: string[] =
      Reflect.getMetadata(OPTIONAL_PROPERTY_DEPS_METADATA, type) || []

    return properties.map((item) => ({
      ...item,
      name: item.type,
      isOptional: optionalKeys.includes(item.key),
    }))
  }

  public applyProperties<T = any>(
    instance: T,
    properties: PropertyDependency[]
  ): void {
    if (!isObject(instance)) {
      return undefined
    }

    properties
      .filter((item) => !isNil(item.instance))
      .forEach((item) => (instance[item.key] = item.instance))
  }

  public async instantiateClass<T = any>(
    instances: any[],
    wrapper: InstanceWrapper<any>,
    targetMetatype: InstanceWrapper<any>
  ): Promise<T> {
    const { metatype, inject } = wrapper
    if (isNil(inject)) {
      targetMetatype.instance = wrapper.forwardRef
        ? Object.assign(targetMetatype.instance, new metatype(...instances))
        : new metatype(...instances)
    } else {
      const factoryResult = ((targetMetatype.metatype as any) as Function)(
        ...instances
      )
      targetMetatype.instance = await factoryResult
    }
    targetMetatype.isResolved = true
    return targetMetatype.instance
  }
}
