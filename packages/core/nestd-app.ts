import { INestdApp } from "../common";
import { Logger } from "../common/services/logger.service";
import { NestdContainer } from "./injector/container";
import { AppConfig } from "./app-config";
import { NestdAppOptions } from "../common/interfaces/nestd-app-options.interface";
import { NestdAppContext } from "./nestd-app-context";
import { MESSAGES } from "./constants";

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
  }

  public async stop(): Promise<any> {

  }
}
