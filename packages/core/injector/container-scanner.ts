import { Module } from "./module";
import { NesdContainer, InstanceWrapper } from "./container";
import { Type } from "../../common/interfaces/type.interface";
import { isFunction } from "../../common/utils/shared.utils";
import { ModulesContainer } from "./modules-container";
import { UnknownElementException } from "../errors/exceptions/unknown-element.exception";
import { Abstract } from "../../common/interfaces";

export class ContainerScanner {
  private flatContainer: Partial<Module>

  constructor(private readonly container: NesdContainer) {}

  public find<TInput = any, TResult = TInput>(
    typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
  ): TResult {
    this.initFlatContainer()
    return this.findInstanceByPrototypeOrToken<TInput, TResult>(
      typeOrToken,
      this.flatContainer,
    )
  }

  public findInstanceByPrototypeOrToken<TInput = any, TResult = TInput>(
    metatypeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
    contextModule: Partial<Module>,
  ): TResult {
    const dependencies = new Map([
      ...contextModule.providers,
      ...contextModule.injectables,
    ])
    const name = isFunction(metatypeOrToken)
      ? (metatypeOrToken as Function).name
      : ModulesContainer
    const instanceWrapper = dependencies.get(name as string)
    if (!instanceWrapper) {
      throw new UnknownElementException()
    }
    return (instanceWrapper as InstanceWrapper<any>).instance
  }

  private initFlatContainer(): void {
    if (this.flatContainer) {
      return
    }

    const modules = this.container.getModules()
    const initialValue = {
      providers: [],
      injectables: [],
    }
    const merge = <T = any>(
      initial: Map<string, T> | T[],
      arr: Map<string, T>,
    ) => [...initial, ...arr]

    this.flatContainer = ([...modules.values()].reduce(
      (current, next) => ({
        providers: merge(current.providers, next.providers),
        injectables: merge(current.injectables, next.injectables),
      }),
      initialValue
    ) as any) as Partial<Module>
  }
}