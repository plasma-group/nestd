import { InjectorDependencyContext, InjectorDependency } from "../injector/injector"
import { Module } from "../injector/module"
import { isNil, isSymbol } from "../../common/utils/shared.utils"
import { Type } from "../../common/interfaces/type.interface"

const getInstanceName = (instance: any) => {
  return instance && (instance as Type<any>).name
}

const getDependencyName = (dependency: InjectorDependency) => {
  return (
    // use class name
    getInstanceName(dependency) ||
    // use injection token (symbol)
    (isSymbol(dependency) && dependency.toString()) ||
    // use string directly
    dependency ||
    // otherwise
    '+'
  )
}

const getModuleName = (module: Module) => {
  return (module && getInstanceName(module.metatype)) || 'current'
}

export const UNKNOWN_DEPENDENCIES_MESSAGE = (
  type: string | symbol,
  unknownDependenciesContext: InjectorDependencyContext,
  module: Module,
) => {
  const { index, dependencies, key } = unknownDependenciesContext
  let message = `Nestd can't reslve dependencies of the ${type.toString()}`

  if (isNil(index)) {
    message += `. Please make sure that the "${key.toString()}" property is available in the current context.`
    return message
  }
  const dependenciesName = (dependencies || []).map(getDependencyName)
  dependenciesName[index] = '?'

  message += ` (`
  message += dependenciesName.join(', ')
  message += `). Please make sure that the argument at index [${index}] is available in the ${getModuleName(
    module,
  )} context.`
  return message
}

export const UNKNOWN_EXPORT_MESSAGE = (text, module: string) =>
  `Nestd cannot export a component/module that is not a part of the currently processed module (${module}). Please verify whether each exported unit is available in this particular context.`
export const INVALID_MODULE_MESSAGE = (text, scope: string) =>
  `Nestd cannot create the module instance. Often, this is because of a circular dependency between modules. Use forwardRef() to avoid it. (Read more https://docs.nestjs.com/fundamentals/circular-dependency.) Scope [${scope}]`
export const INVALID_CLASS_MESSAGE = (text, value: any) =>
  `ModuleRef cannot instantiate class (${value} is not constructable).`

export const UNHANDLED_RUNTIME_EXCEPTION = `Unhandled Runtime Exception.`;
