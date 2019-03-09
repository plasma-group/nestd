import * as hash from 'object-hash'
import stringify from 'fast-safe-stringify'

import { DynamicModule } from '@nestd/common'
import { SHARED_MODULE_METADATA } from '@nestd/common/constants'
import { Type } from '@nestd/common/interfaces/type.interface'

export class ModuleTokenFactory {
  public create(
    metatype: Type<any>,
    scope: Type<any>[],
    dynamicModuleMetadata?: Partial<DynamicModule> | undefined
  ): string {
    const reflectedScope = this.reflectScope(metatype)
    const isSingleScoped = reflectedScope === true
    const opaqueToken = {
      module: this.getModuleName(metatype),
      dynamic: this.getDynamicMetadataToken(dynamicModuleMetadata),
      scope: isSingleScoped ? this.getScopeStack(scope) : reflectedScope,
    }
    return hash(opaqueToken)
  }

  public getDynamicMetadataToken(
    dynamicModuleMetadata: Partial<DynamicModule> | undefined
  ): string {
    return dynamicModuleMetadata ? stringify(dynamicModuleMetadata) : ''
  }

  public getModuleName(metatype: Type<any>): string {
    return metatype.name
  }

  public getScopeStack(scope: Type<any>[]): string[] {
    const reversedScope = scope.reverse()
    const firstGlobalIndex = reversedScope.findIndex(
      (s) => this.reflectScope(s) === 'global'
    )
    scope.reverse()

    const stack =
      firstGlobalIndex >= 0
        ? scope.slice(scope.length - firstGlobalIndex - 1)
        : scope
    return stack.map((module) => module.name)
  }

  private reflectScope(metatype: Type<any>): any {
    const scope = Reflect.getMetadata(SHARED_MODULE_METADATA, metatype)
    return scope ? scope : 'global'
  }
}
