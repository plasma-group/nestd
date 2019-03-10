import { ForwardReference, DynamicModule, Type, Injectable } from './interfaces';
import { AppConfig } from './app-config';
import { MetadataScanner } from './metadata-scanner';
import { NestdContainer } from './injector/container';
export declare class DependencyScanner {
    private readonly container;
    private readonly metadataScanner;
    private readonly appConfig;
    private readonly applicationProvidersApplyMap;
    constructor(container: NestdContainer, metadataScanner: MetadataScanner, appConfig?: AppConfig);
    scan(module: Type<any>): Promise<void>;
    scanForModules(module: ForwardReference | Type<any> | DynamicModule, scope?: Type<any>[], ctxRegistry?: (ForwardReference | DynamicModule | Type<any>)[]): Promise<void>;
    storeModule(module: any, scope: Type<any>[]): Promise<void>;
    scanModulesForDependencies(): Promise<void>;
    reflectRelatedModules(module: Type<any>, token: string, context: string): Promise<void>;
    reflectProviders(module: Type<any>, token: string): Promise<void>;
    reflectProviderMetadata(provider: Type<Injectable>, token: string): void;
    reflectExports(module: Type<any>, token: string): void;
    reflectKeyMetadata(component: Type<Injectable>, key: string, method: string): any;
    storeRelatedModule(related: any, token: string, context: string): Promise<void>;
    storeProvider(provider: any, token: string): void;
    storeExportedComponent(exported: Type<Injectable>, token: string): void;
    reflectMetadata(metatype: any, metadataKey: string): any;
    applyApplicationProviders(): void;
    getApplyProvidersMap(): {
        [type: string]: Function;
    };
    isDynamicModule(module: Type<any> | DynamicModule): module is DynamicModule;
    isForwardReference(module: Type<any> | DynamicModule | ForwardReference): module is ForwardReference;
}
