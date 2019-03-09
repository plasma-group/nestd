import { Injectable } from '@nestd/common/interfaces'
import { Logger } from '@nestd/common/services/logger.service'

import { NestdContainer } from './container'
import { Injector } from './injector'
import { Module } from './module'
import { MODULE_INIT_MESSAGE } from '../helpers/messages'

export class InstanceLoader {
  private readonly injector = new Injector()
  private readonly logger = new Logger(InstanceLoader.name, true)

  constructor(private readonly container: NestdContainer) {}

  public async createInstancesOfDependencies(): Promise<void> {
    const modules = this.container.getModules()

    this.createPrototypes(modules)
    await this.createInstances(modules)
  }

  public createPrototypes(modules: Map<string, Module>): void {
    for (const [_, module] of modules) {
      this.createPrototypesOfProviders(module)
    }
  }

  private async createInstances(modules: Map<string, Module>): Promise<void> {
    await Promise.all(
      [...modules.values()].map(async (module) => {
        await this.createInstancesOfProviders(module)

        const { name } = module.metatype
        this.logger.log(MODULE_INIT_MESSAGE`${name}`)
      })
    )
  }

  private createPrototypesOfProviders(module: Module): void {
    for (const wrapper of module.providers.values()) {
      this.injector.loadPrototypeOfInstance<Injectable>(
        wrapper,
        module.providers
      )
    }
  }

  private async createInstancesOfProviders(module: Module): Promise<void> {
    await Promise.all(
      [...module.providers.values()].map(async (wrapper) => {
        this.injector.loadInstanceOfProvider(wrapper, module)
      })
    )
  }
}
