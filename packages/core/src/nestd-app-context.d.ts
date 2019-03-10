import { Type, Abstract, OnModuleInit, OnModuleDestroy, OnAppBootstrap, INestdAppContext } from './interfaces';
import { LoggerService } from './services';
import { NestdContainer } from './injector/container';
import { Module } from './injector/module';
export declare class NestdAppContext implements INestdAppContext {
    protected readonly container: NestdContainer;
    private readonly scope;
    private contextModule;
    private readonly moduleTokenFactory;
    private readonly containerScanner;
    constructor(container: NestdContainer, scope: Type<any>[], contextModule: Module);
    selectContextModule(): void;
    select<T>(module: Type<T>): INestdAppContext;
    get<TInput = any, TResult = TInput>(typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol, options?: {
        strict: boolean;
    }): TResult;
    init(): Promise<this>;
    stop(): Promise<void>;
    useLogger(logger: LoggerService): void;
    protected callInitHook(): Promise<any>;
    protected callModuleInitHook(module: Module): Promise<any>;
    protected hasOnModuleInitHook(instance: any): instance is OnModuleInit;
    protected callDestroyHook(): Promise<any>;
    protected callModuleDestroyHook(module: Module): Promise<any>;
    protected hasOnModuleDestroyHook(instance: any): instance is OnModuleDestroy;
    protected callBootstrapHook(): Promise<any>;
    protected callModuleBootstrapHook(module: Module): Promise<any>;
    protected hasOnAppBotstrapHook(instance: any): instance is OnAppBootstrap;
    protected find<TInput = any, TResult = TInput>(typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol): TResult;
    protected findInstanceByPrototypeOrToken<TInput = any, TResult = TInput>(metatypeOrToken: Type<TInput> | Abstract<TInput> | string | symbol, contextModule: Partial<Module>): TResult;
}
