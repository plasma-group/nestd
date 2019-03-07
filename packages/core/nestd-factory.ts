import { INesdApplication } from '../common'
import { NesdContainer } from './injector/container'
import { AppConfig } from './app-config'
import { InstanceLoader } from './injector/instance-loader'
import { MetadataScanner } from './metadata-scanner';
import { DependencyScanner } from './dependency-scanner';

export class NestdFactoryStatic {
  public async create(
    module: any,
    options?: NestdAppOptions,
  ): Promise<INestdApp> {
    const appConfig = new AppConfig()
    const container = new NesdContainer(appConfig)

    await this.initialize(module, container, appConfig)
    return this.createNestdInstance<NestdApp>(
      new NestdApp(container, appConfig, options)
    )
  }

  private async initialize(
    module: any,
    container: NesdContainer,
    config = new AppConfig(),
    app: any,
  ) {
    const instanceLoader = new InstanceLoader(container)
    const dependenciesScanner = new DependencyScanner(
      container,
      new MetadataScanner(),
      config,
    )
    container.setAppRef(app)
    try {
      await ExceptionsZone.asyncRun(async () => {
        await dependenciesScanner.scan(module)
        await instanceLoader.createInstancesOfDependencies()
        dependenciesScanner.applyApplicationProviders()
      })
    } catch (e) {
      process.abort()
    }
  }
}

export const NestdFactory = new NestdFactoryStatic()

