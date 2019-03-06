import { INesdApplication } from '../common'
import { NesdContainer } from './injector/container'
import { AppConfig } from './app-config'
import { InstanceLoader } from './injector/instance-loader'

export class AppFactoryStatic {
  public async create(
    module: any
  ): Promise<INesdApplication> {

  }

  private async initialize(
    module: any,
    container: NesdContainer,
    config = new AppConfig()
  ) {
    const instanceLoader = new InstanceLoader()
    const dependenciesScanner = new DependenciesScanner(
      container,
      new MetadataScanner(),
      config,
    )
  }
}
