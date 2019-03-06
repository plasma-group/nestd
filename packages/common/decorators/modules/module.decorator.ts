import { ModuleMetadata } from '../../interfaces/modules/module-metadata.interface'
import * as constants from '../../constants'

const validateKeys = (keys: string[]) => {
  for (const key in keys) {
    if (!Object.values(constants.metadata).includes(key)) {
      throw new Error(`Invalid property '${key}' in @Module() decorator.`)
    }
  }
}

export function Module(metadata: ModuleMetadata): ClassDecorator {
  const propsKeys = Object.keys(metadata)

  validateKeys(propsKeys)

  return (target: object) => {
    for (const property in metadata) {
      if (metadata.hasOwnProperty(property)) {
        Reflect.defineMetadata(property, metadata[property], target)
      }
    }
  }
}
