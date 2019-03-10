import { DynamicModule, Type } from '../interfaces';
import { Module } from './module';
import { AppConfig } from '../app-config';
import { ModulesContainer } from './modules-container';
import { AppRefHost } from '../helpers/app-ref-host';
import { Reflector } from '../services/reflector.service';
export declare class NestdContainer {
    private readonly config;
    private readonly globalModules;
    private readonly moduleCompiler;
    private readonly dynamicModulesMetadata;
    private readonly reflector;
    private readonly modules;
    private readonly appRefHost;
    private modulesContainer;
    private appRef;
    constructor(config?: AppConfig);
    readonly appConfig: AppConfig;
    setAppRef(appRef: any): void;
    getAppRef(): void;
    addModule(metatype: Type<any> | DynamicModule | Promise<DynamicModule>, scope: Type<any>[]): Promise<void>;
    addDynamicMetadata(token: string, dynamicModuleMetadata: Partial<DynamicModule>, scope: Type<any>[]): void;
    addDynamicModules(modules: any[], scope: Type<any>[]): void;
    isGlobalModule(metatype: Type<any>): boolean;
    addGlobalModule(module: Module): void;
    getModules(): ModulesContainer;
    addRelatedModule(relatedModule: Type<any> | DynamicModule, token: string): Promise<void>;
    addProvider(provider: Type<any>, token: string): string;
    addInjectable(injectable: Type<any>, token: string): void;
    addExportedComponent(exported: Type<any>, token: string): void;
    bindGlobalScope(): void;
    bindGlobalsToRelatedModules(module: Module): void;
    bindGlobalModuleToModule(module: Module, globalModule: Module): void;
    getDynamicMetadataByToken(token: string, metadataKey: keyof DynamicModule): any[];
    getReflector(): Reflector;
    getAppRefHost(): AppRefHost;
    getModulesContainer(): ModulesContainer;
}
export interface InstanceWrapper<T> {
    name: any;
    metatype: Type<T>;
    instance: T;
    isResolved: boolean;
    isStarted?: boolean;
    isPending?: boolean;
    done$?: Promise<void>;
    inject?: Type<any>[];
    isNotMetatype?: boolean;
    forwardRef?: boolean;
    async?: boolean;
}
