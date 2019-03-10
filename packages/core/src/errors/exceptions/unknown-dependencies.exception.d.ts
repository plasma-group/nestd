import { RuntimeException } from './runtime.exception';
import { InjectorDependencyContext } from '../../injector/injector';
import { Module } from '../../injector/module';
export declare class UnknownDependenciesException extends RuntimeException {
    constructor(type: string | symbol, unknownDependencyContext: InjectorDependencyContext, module?: Module);
}
