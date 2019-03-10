import { Module } from '../../injector/module';
import { InjectorDependencyContext } from '../../injector/injector';
import { RuntimeException } from './runtime.exception';
export declare class UndefinedDependencyException extends RuntimeException {
    constructor(type: string, undefinedDependencyContext: InjectorDependencyContext, module?: Module);
}
