import { INesdApplication } from '../common'
import { NesdContainer } from './injector/container'
import { AppConfig } from './app-config'
import { InstanceLoader } from './injector/instance-loader'
import { MetadataScanner } from './metadata-scanner';
import { DependencyScanner } from './dependency-scanner';

export class NesdFactoryStatic {
  public async create(
    module: any
  ): Promise<INesdApplication> {

  }

  private async initialize(
    module: any,
    container: NesdContainer,
    config = new AppConfig()
  ) {
    const instanceLoader = new InstanceLoader(container)
    const dependenciesScanner = new DependencyScanner(
      container,
      new MetadataScanner(),
      config,
    )
    container
  }
}
