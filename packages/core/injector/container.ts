import { AppConfig } from '../app-config'
import { Type } from '../../common/interfaces/type.interface';
import { DynamicModule, Module } from '../../common';
import { Module } from './module';

export class NesdContainer {
  constructor(private readonly config: AppConfig) {}

  get appConfig(): AppConfig {
    return this.config
  }

  public async addModule(
    metatype: Type<any> | DynamicModule | Promise<DynamicModule>,
    scope: Type<any>[],
  ): Promise<void> {
    if (!metatype) {
      throw new InvalidModuleException(scope)
    }

    const { type, dynamicMetadata, token } = await this.moduleCompiler.compile(
      metatype,
      scope,
    )

    if (this.modules.has(token)) {
      return
    }

    const module = new Module(type, scope, this)
    this.modules.set(token, module)

    this.addDynamicMetadata(token, dynamicMetadata, [].concat(scope, type))
    if (this.isGlobalModule(type)) {
      this.addGlobalModule(module)
    }
  }

  public addDynamicMetadata(
    token: string,
    dynamicModuleMetadata: Partial<DynamicModule>,
    scope: Type<any>[],
  ): void {
    if (!dynamicModuleMetadata) {
      return undefined
    }
    this.dynamicModulesMetadata.set(token, dynamicModuleMetadata)

    const { modules, import } = dynamicModuleMetadata
    this.addDynamicModules(modules, scope)
    this.addDynamicModules(imports, scope)
  }

  public addDynamicModules(
    modules: any[],
    scope: Type<any>[],
  ): void {
    if (!modules) {
      return undefined
    }
    for (const module of modules) {
      this.addModule(module, scope)
    }
  }

  public isGlobalModule(metatype: Type<any>): boolean {
    return !!Reflect.getMetadata(GLOBAL_MODULE_METADATA, metatype)
  }

  public getModules(): ModulesContainer {
    return this.modules
  }

  public async addRelatedModule(
    relatedModule: Type<any> | DynamicModule,
    token: string,
  ): Promise<void> {
    if (!this.modules.has(token)) {
      return
    }

    const module = this.modules.get(token)
    const parent = module.metatype

    const scope = [].concat(module.scope, parent)
    const { token: relatedModuleToken } = await this.moduleCompiler.compile(
      relatedModule,
      scope,
    )
    const related = this.getModules.get(relatedModuleToken)
    module.addRelatedModule(related)
  }

  public addProvider(
    provider: Type<any>,
    token: string
  ): string {
    if (!provider) {
      throw new CircularDependencyException()
    }
    if (!this.modules.has(token)) {
      throw new UnknownModuleException()
    }
    const module = this.modules.get(token)
    return module.addProvider(provider)
  }

  public addInjectable(
    injectable: Type<any>,
    token: string
  ): void {
    if (!this.modules.has(token)) {
      throw new UnknownModuleException()
    }
    const module = this.modules.get(token)
    module.addInjectable(injectable)
  }

  public addExportedComponent(
    exported: Type<any>,
    token: string
  ): void {
    if (!this.modules.has(token)) {
      throw new UnknownModuleException()
    }
    const module = this.modules.get(token)
    module.addExportedComponent(exported)
  }

  public bindGlobalScope(): void {
    for (const module of this.modules) {
      this.bindGlobalsToRelatedModules(module)
    }
  }

  public bindGlobalsToRelatedModules(module: Module) {
    for (const globalModule of this.globalModules) {
      this.bindGlobalModuleToModule(module, globalModule)
    }
  }

  public bindGlobalModuleToModule(module: Module, globalModule: Module) {
    if (module === globalModule) {
      return
    }
    module.addRelatedModule(globalModule)
  }

  public getDynamicMetadataByToken(
    token: string,
    metadataKey: keyof DynamicModule,
  ): any[] {
    const metadata = this.dynamicModulesMetadata.get(token)
    if (metadata && metadata[metadataKey]) {
      return metadata[metadataKey] as any[]
    }
    return []
  }
}
