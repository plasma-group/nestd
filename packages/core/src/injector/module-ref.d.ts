import { Type } from '../interfaces';
import { NestdContainer } from './container';
import { Module } from './module';
export declare abstract class ModuleRef {
    protected readonly container: NestdContainer;
    private readonly injector;
    private readonly containerScanner;
    constructor(container: NestdContainer);
    abstract get<TInput = any, TResult = TInput>(typeOrToken: Type<TInput> | string | symbol, options?: {
        strict: boolean;
    }): TResult;
    abstract create<T = any>(type: Type<T>): Promise<T>;
    protected find<TInput = any, TResult = TInput>(typeOrToken: Type<TInput> | string | symbol): TResult;
    protected instantiateClass<T = any>(type: Type<T>, module: Module): Promise<T>;
    protected findInstanceByPrototypeOrToken<TInput = any, TResult = TInput>(metatypeOrToken: Type<TInput> | string | symbol, contextModule: Partial<Module>): TResult;
}
