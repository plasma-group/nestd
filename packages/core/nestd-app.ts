import { INestdApp, OnStart, OnStop } from "../common";
import { Logger } from "../common/services/logger.service";
import { NestdContainer } from "./injector/container";
import { AppConfig } from "./app-config";
import { NestdAppOptions } from "../common/interfaces/nestd-app-options.interface";
import { NestdAppContext } from "./nestd-app-context";
import { MESSAGES } from "./constants";
import { Module } from "./injector/module";
import { RuntimeException } from "./errors/exceptions/runtime.exception";
import { isUndefined } from "util";

export class NestdApp extends NestdAppContext implements INestdApp {
  private readonly logger = new Logger(NestdApp.name, true)
  private app: any
  private isInitialized = false

  constructor(
    container: NestdContainer,
    private readonly config: AppConfig,
    private readonly appOptions: NestdAppOptions = {},
  ) {
    super(container, [], null)

    this.selectContextModule()
  }

  public async startServices(): Promise<void> {
    for (const module of this.container.getModules().values()) {
      await this.startModuleServices(module)
    }
  }

  public async startModuleServices(module: Module): Promise<void> {
    for (const wrapper of module.providers.values()) {
      const provider = wrapper.instance
      try {
        if (this.hasOnStartHook(provider) && !wrapper.isStarted) {
          await (provider as OnStart).onStart()
          wrapper.isStarted = true
        }
      } catch (err) {
        throw new RuntimeException(err)
      }
    }
  }

  private hasOnStartHook(provider: any): provider is OnStart {
    return !isUndefined((provider as OnStart).onStart)
  }

  public async stopServices(): Promise<void> {
    for (const module of this.container.getModules().values()) {
      await this.stopModuleServices(module)
    }
  }

  public async stopModuleServices(module: Module): Promise<void> {
    for (const wrapper of module.providers.values()) {
      const provider = wrapper.instance
      try {
        if (this.hasOnStopHook(provider)) {
          await (provider as OnStop).onStop()
          wrapper.isStarted = false
        }
      } catch (err) {
        throw new RuntimeException(err)
      }
    }
  }

  private hasOnStopHook(provider: any): provider is OnStop {
    return !isUndefined((provider as OnStop).onStop)
  }

  public async init(): Promise<this> {
    await this.callInitHook()
    await this.callBootstrapHook()

    this.isInitialized = true
    this.logger.log(MESSAGES.APPLICATION_READY)
    return this
  }

  public getApp(): any {
    return this.app
  }

  public async start(): Promise<void> {
    !this.isInitialized && (await this.init())
    this.startServices()
  }

  public async stop(): Promise<any> {
    this.stopServices()
  }
}
