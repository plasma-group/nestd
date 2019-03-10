import { Injectable, Type } from '../interfaces';
import { InstanceWrapper } from './container';
import { Module } from './module';
export declare type InjectorDependency = Type<any> | Function | string | symbol;
export interface PropertyDependency {
    key: string;
    name: InjectorDependency;
    isOptional?: boolean;
    instance?: any;
}
export interface InjectorDependencyContext {
    key?: string | symbol;
    name?: string;
    index?: number;
    dependencies?: InjectorDependency[];
}
export declare class Injector {
    loadPrototypeOfInstance<T>({ metatype, name }: InstanceWrapper<T>, collection: Map<string, InstanceWrapper<T>>): void;
    loadInstanceOfProvider(wrapper: InstanceWrapper<Injectable>, module: Module): Promise<void>;
    applyDoneHook<T>(wrapper: InstanceWrapper<T>): () => void;
    loadInstance<T>(wrapper: InstanceWrapper<T>, collection: Map<string, InstanceWrapper<any>>, module: Module): Promise<void>;
    resolveConstructorParams<T>(wrapper: InstanceWrapper<T>, module: Module, inject: InjectorDependency[], callback: (args: any) => void): Promise<void>;
    reflectConstructorParams<T>(type: Type<T>): any[];
    reflectOptionalParams<T>(type: Type<T>): any[];
    reflectSelfParams<T>(type: Type<T>): any[];
    resolveSingleParam<T>(wrapper: InstanceWrapper<T>, param: Type<any> | string | symbol | any, dependencyContext: InjectorDependencyContext, module: Module): Promise<any>;
    resolveParamToken<T>(wrapper: InstanceWrapper<T>, param: Type<any> | string | symbol | any): any;
    resolveProviderInstance<T>(module: Module, name: any, dependencyContext: InjectorDependencyContext, wrapper: InstanceWrapper<T>): Promise<any>;
    lookupProvider<T = any>(providers: Map<string, any>, module: Module, dependencyContext: InjectorDependencyContext, wrapper: InstanceWrapper<T>): Promise<any>;
    lookupProviderInExports<T = any>(dependencyContext: InjectorDependencyContext, module: Module, wrapper: InstanceWrapper<T>): Promise<any>;
    lookupProviderInRelatedModules(module: Module, name: any, moduleRegistry?: any[]): Promise<any>;
    resolveProperties<T>(wrapper: InstanceWrapper<T>, module: Module, inject?: InjectorDependency[]): Promise<PropertyDependency[]>;
    reflectProperties<T>(type: Type<T>): PropertyDependency[];
    applyProperties<T = any>(instance: T, properties: PropertyDependency[]): void;
    instantiateClass<T = any>(instances: any[], wrapper: InstanceWrapper<any>, targetMetatype: InstanceWrapper<any>): Promise<T>;
}
