import { Injectable, DynamicModule, Type, NestdModule } from '../interfaces';
import { NestdContainer, InstanceWrapper } from './container';
import { ModulesContainer } from './modules-container';
import { Reflector } from '../services/reflector.service';
import { AppRefHost } from '../helpers/app-ref-host';
export interface CustomProvider {
    provide: any;
    name: string;
}
export declare type OpaqueToken = string | symbol | object | Type<any>;
export declare type CustomClass = CustomProvider & {
    useClass: Type<any>;
};
export declare type CustomFactory = CustomProvider & {
    useFactory: (...args: any) => any;
    inject?: OpaqueToken[];
};
export declare type CustomValue = CustomProvider & {
    useValue: any;
};
export declare type ProviderMetatype = Type<Injectable> | CustomClass | CustomFactory | CustomValue;
export declare class Module {
    private readonly _metatype;
    private readonly _scope;
    private readonly container;
    private readonly _id;
    private readonly _relatedModules;
    private readonly _providers;
    private readonly _injectables;
    private readonly _exports;
    constructor(_metatype: Type<any>, _scope: Type<any>[], container: NestdContainer);
    readonly id: string;
    readonly scope: Type<any>[];
    readonly relatedModules: Set<Module>;
    readonly providers: Map<string, InstanceWrapper<Injectable>>;
    readonly exports: Set<string | symbol>;
    readonly instance: NestdModule;
    readonly metatype: Type<any>;
    addCoreInjectables(container: NestdContainer): void;
    addModuleRef(): void;
    addModuleAsProvider(): void;
    addReflector(reflector: Reflector): void;
    addAppRef(appRef: any): void;
    addModulesContainer(modulesContainer: ModulesContainer): void;
    addAppRefHost(appRefHost: AppRefHost): void;
    addInjectable(injectable: Type<Injectable>): void;
    addProvider(provider: ProviderMetatype): string;
    isCustomProvider(provider: ProviderMetatype): provider is CustomClass | CustomFactory | CustomValue;
    addCustomProvider(provider: CustomClass | CustomFactory | CustomValue, collection: Map<string, any>): string;
    isCustomClass(provider: any): provider is CustomClass;
    isCustomFactory(provider: any): provider is CustomFactory;
    isCustomValue(provider: any): provider is CustomValue;
    isDynamicModule(exported: any): exported is DynamicModule;
    addCustomClass(provider: CustomClass, collection: Map<string, any>): void;
    addCustomFactory(provider: CustomFactory, collection: Map<string, any>): void;
    addCustomValue(provider: CustomValue, collection: Map<string, any>): void;
    addExportedProvider(exported: ProviderMetatype | string | symbol | DynamicModule): void;
    addCustomExportedProvider(exported: CustomClass | CustomFactory | CustomValue): void;
    validateExportedProvider(token: string | symbol): string | symbol;
    addRelatedModule(relatedModule: Module): void;
    createModuleRefMetatype(): any;
}
