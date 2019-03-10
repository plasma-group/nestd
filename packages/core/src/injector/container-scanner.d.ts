import { Type, Abstract } from '../interfaces';
import { Module } from './module';
import { NestdContainer } from './container';
export declare class ContainerScanner {
    private readonly container;
    private flatContainer;
    constructor(container: NestdContainer);
    find<TInput = any, TResult = TInput>(typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol): TResult;
    findInstanceByPrototypeOrToken<TInput = any, TResult = TInput>(metatypeOrToken: Type<TInput> | Abstract<TInput> | string | symbol, contextModule: Partial<Module>): TResult;
    private initFlatContainer;
}
