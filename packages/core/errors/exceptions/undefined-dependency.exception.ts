import { Module } from "../../injector/module";
import { InjectorDependencyContext } from "../../injector/injector";
import { RuntimeException } from "./runtime.exception";
import { UNKNOWN_DEPENDENCIES_MESSAGE } from "../messages";

export class UndefinedDependencyException extends RuntimeException {
  constructor(
    type: string,
    undefinedDependencyContext: InjectorDependencyContext,
    module?: Module,
  ) {
    super(UNKNOWN_DEPENDENCIES_MESSAGE(type, undefinedDependencyContext, module))
  }
}