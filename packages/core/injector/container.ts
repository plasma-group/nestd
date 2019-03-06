import { AppConfig } from '../app-config'

export class NesdContainer {
  constructor(private readonly config: AppConfig) {}

  get appConfig(): AppConfig {
    return this.config
  }
}
